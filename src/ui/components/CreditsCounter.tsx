import { createRef, PureComponent } from 'preact/compat'
import {
  CREDITS_BADGE_DURATION,
  CREDITS_TWEEN_DURATION,
  displayedCredits,
} from '../../utils/creditsTween'

interface CreditsCounterProps {
  value: number
  formatAmount: (count: string) => string
  formatCharged: (cost: number) => string
}

interface CreditsCounterState {
  displayed: number
  badgeDelta: number
  badgeKey: number
  isStaticBadge: boolean
  announcement: string
  lockedWidth: number | null
}

export default class CreditsCounter extends PureComponent<
  CreditsCounterProps,
  CreditsCounterState
> {
  private frameId: number | null = null
  private badgeTimer: ReturnType<typeof setTimeout> | null = null
  private amountRef = createRef<HTMLSpanElement>()

  constructor(props: CreditsCounterProps) {
    super(props)
    this.state = {
      displayed: props.value,
      badgeDelta: 0,
      badgeKey: 0,
      isStaticBadge: false,
      announcement: '',
      lockedWidth: null,
    }
  }

  componentDidUpdate = (prevProps: CreditsCounterProps) => {
    const { value } = this.props
    if (value === prevProps.value) return

    if (value > prevProps.value) {
      this.stopTween()
      this.setState({ displayed: value, lockedWidth: null })
      return
    }

    const cost = prevProps.value - value
    const isReduced = this.prefersReducedMotion()
    const from = this.state.displayed
    this.restartBadge(cost, isReduced)

    if (isReduced) {
      this.stopTween()
      this.setState({ displayed: value, lockedWidth: null })
      return
    }
    this.setState((state) => ({
      lockedWidth:
        state.lockedWidth ?? this.amountRef.current?.offsetWidth ?? null,
    }))
    this.startTween(from, value)
  }

  componentWillUnmount = () => {
    this.stopTween()
    if (this.badgeTimer !== null) clearTimeout(this.badgeTimer)
  }

  private prefersReducedMotion = (): boolean =>
    typeof window !== 'undefined' &&
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches

  private stopTween = () => {
    if (this.frameId !== null) cancelAnimationFrame(this.frameId)
    this.frameId = null
  }

  private startTween = (from: number, to: number) => {
    this.stopTween()
    const start = performance.now()
    const step = (now: number) => {
      const next = displayedCredits(
        from,
        to,
        now - start,
        CREDITS_TWEEN_DURATION
      )
      const isDone = next === to
      this.setState(
        isDone ? { displayed: next, lockedWidth: null } : { displayed: next }
      )
      this.frameId = isDone ? null : requestAnimationFrame(step)
    }
    this.frameId = requestAnimationFrame(step)
  }

  private restartBadge = (cost: number, isStatic: boolean) => {
    if (this.badgeTimer !== null) clearTimeout(this.badgeTimer)
    this.setState((state) => ({
      badgeDelta: state.badgeDelta + cost,
      badgeKey: state.badgeKey + 1,
      isStaticBadge: isStatic,
      announcement: this.props.formatCharged(cost),
    }))
    this.badgeTimer = setTimeout(() => {
      this.badgeTimer = null
      this.setState({ badgeDelta: 0 })
    }, CREDITS_BADGE_DURATION)
  }

  render() {
    const {
      badgeDelta,
      badgeKey,
      isStaticBadge,
      announcement,
      displayed,
      lockedWidth,
    } = this.state

    return (
      <span className="credits-counter">
        <span
          ref={this.amountRef}
          className="credits-counter__amount"
          style={
            lockedWidth !== null ? { minWidth: `${lockedWidth}px` } : undefined
          }
        >
          {this.props.formatAmount(Math.ceil(displayed).toString())}
        </span>
        {badgeDelta > 0 && (
          <span
            key={badgeKey}
            className={`credits-counter__badge${
              isStaticBadge ? ' credits-counter__badge--static' : ''
            }`}
            aria-hidden="true"
          >
            {`−${badgeDelta}`}
          </span>
        )}
        <span
          className="credits-counter__live"
          aria-live="polite"
          role="status"
        >
          {announcement && <span key={badgeKey}>{announcement}</span>}
        </span>
      </span>
    )
  }
}
