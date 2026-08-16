import { PureComponent } from 'preact/compat'
import { ComponentChildren } from 'preact'
import {
  SHIFT_BOUNDS,
  ShiftChannel,
  ShiftCurve,
  ShiftCurveConfiguration,
} from '@yelbolt/engine-ui-color-palette'
import { doClassnames } from '@unoff/utils'
import { Input, layouts, SegmentedControl, SimpleSlider } from '@unoff/ui'
import { WithTranslationProps } from './WithTranslation'

export interface ShiftGradientStop {
  offset: number
  color: string
  outOfGamut?: boolean
}

export interface ShiftCurveFieldsProps extends WithTranslationProps {
  id: string
  channel: ShiftChannel
  label: string
  shift: ShiftCurveConfiguration
  colors?: { min: string; max: string }
  gradient?: { tracks: ShiftGradientStop[][] }
  feature: string
  isBlocked?: boolean
  isNew?: boolean
  onBlock?: () => void
  variant?: 'SLIDER' | 'INPUT'
  onChangeValue: (
    feature: string,
    state: string,
    patch: Partial<ShiftCurveConfiguration>
  ) => void
}

interface FieldSpec {
  idSuffix?: 'min' | 'max'
  value: number
  sliderLabel: string
  sliderHandler: (feature: string, state: string, value: number) => void
  inputLetter: 'C' | 'H' | 'L' | 'R'
  inputHelperLabel?: string
}

export class ShiftCurveFields extends PureComponent<ShiftCurveFieldsProps> {
  // Handlers
  valueHandler = (feature: string, state: string, value: number) => {
    this.props.onChangeValue(feature, state, { value })
  }

  hyperbolaHandler = (feature: string, state: string, value: number) => {
    this.props.onChangeValue(feature, state, { min: value, max: value })
  }

  minHandler = (feature: string, state: string, value: number) => {
    this.props.onChangeValue(feature, state, { min: value })
  }

  maxHandler = (feature: string, state: string, value: number) => {
    this.props.onChangeValue(feature, state, { max: value })
  }

  inputHandler =
    (handler: (feature: string, state: string, value: number) => void) =>
    (e: Event) => {
      const value = parseFloat((e.currentTarget as HTMLInputElement).value)
      if (Number.isNaN(value)) return
      handler(this.props.feature, 'TYPED', value)
    }

  // Templates
  Field = (field: FieldSpec) => {
    const {
      id,
      channel,
      colors,
      gradient,
      feature,
      isBlocked,
      isNew,
      onBlock,
    } = this.props
    const variant = this.props.variant ?? 'SLIDER'
    const [min, max] = SHIFT_BOUNDS[channel]
    const unit = channel === 'CHROMA' ? '%' : '°'
    const fieldId = field.idSuffix ? `${id}-${field.idSuffix}` : id

    return variant === 'INPUT' ? (
      <Input
        key={fieldId}
        id={fieldId}
        type="NUMBER"
        icon={{ type: 'LETTER', value: field.inputLetter }}
        unit={unit}
        value={field.value.toString()}
        min={min.toString()}
        max={max.toString()}
        step="1"
        helper={
          field.inputHelperLabel
            ? { label: field.inputHelperLabel, pin: 'TOP' }
            : undefined
        }
        feature={feature}
        isBlocked={isBlocked}
        isNew={isNew}
        onUnblock={onBlock}
        onBlur={this.inputHandler(field.sliderHandler)}
        onShift={this.inputHandler(field.sliderHandler)}
      />
    ) : (
      <SimpleSlider
        key={fieldId}
        id={fieldId}
        label={field.sliderLabel}
        value={field.value}
        min={min}
        max={max}
        step={1}
        colors={colors}
        gradient={gradient}
        feature={feature}
        hasPadding={false}
        isBlocked={isBlocked}
        isNew={isNew}
        onBlock={onBlock}
        onChange={field.sliderHandler}
      />
    )
  }

  // Render
  render() {
    const { label, shift, t } = this.props
    const { curve } = shift
    const letter = this.props.channel === 'CHROMA' ? 'C' : 'H'

    return curve === 'FREE' ? (
      <>
        {this.Field({
          idSuffix: 'min',
          value: shift.min,
          sliderLabel: t('scale.shift.threshold.left'),
          sliderHandler: this.minHandler,
          inputLetter: 'L',
        })}
        {this.Field({
          idSuffix: 'max',
          value: shift.max,
          sliderLabel: t('scale.shift.threshold.right'),
          sliderHandler: this.maxHandler,
          inputLetter: 'R',
        })}
      </>
    ) : (
      this.Field({
        value: curve === 'HYPERBOLA' ? shift.min : shift.value,
        sliderLabel: label,
        sliderHandler:
          curve === 'HYPERBOLA' ? this.hyperbolaHandler : this.valueHandler,
        inputLetter: letter,
      })
    )
  }
}

export interface ShiftCurveSelectorProps extends WithTranslationProps {
  id: string
  curve: ShiftCurve
  feature: string
  isBlocked?: boolean
  isNew?: boolean
  onBlock?: () => void
  onChangeCurve: (feature: string, curve: ShiftCurve) => void
}

export class ShiftCurveSelector extends PureComponent<ShiftCurveSelectorProps> {
  // Handlers
  curveHandler = (e: Event) => {
    if (this.props.isBlocked) {
      this.props.onBlock?.()
      return
    }

    const curve = (e.currentTarget as HTMLElement).dataset.feature as
      | ShiftCurve
      | undefined

    if (curve === undefined || curve === this.props.curve) return

    this.props.onChangeCurve(this.props.feature, curve)
  }

  // Render
  render() {
    const { id, curve, t } = this.props

    return (
      <SegmentedControl
        id={`${id}-mode`}
        items={[
          {
            id: 'LINEAR',
            icon: { type: 'PICTO', name: 'curve-linear' },
            helper: { label: t('scale.shift.curve.linear') },
          },
          {
            id: 'HYPERBOLA',
            icon: { type: 'PICTO', name: 'curve-anti-hyperbola' },
            helper: { label: t('scale.shift.curve.hyperbola') },
          },
          {
            id: 'FREE',
            icon: { type: 'PICTO', name: 'curve-ease-in-out' },
            helper: { label: t('scale.shift.curve.free') },
          },
        ]}
        active={curve}
        action={this.curveHandler}
      />
    )
  }
}

export interface ShiftCurveControlProps extends WithTranslationProps {
  id: string
  channel: ShiftChannel
  label: string
  shift: ShiftCurveConfiguration
  colors?: { min: string; max: string }
  gradient?: { tracks: ShiftGradientStop[][] }
  feature: string
  isBlocked?: boolean
  isNew?: boolean
  onBlock?: () => void
  variant?: 'SLIDER' | 'INPUT'
  resetSlot?: ComponentChildren
  onChangeCurve: (feature: string, curve: ShiftCurve) => void
  onChangeValue: (
    feature: string,
    state: string,
    patch: Partial<ShiftCurveConfiguration>
  ) => void
}

export default class ShiftCurveControl extends PureComponent<ShiftCurveControlProps> {
  // Templates
  Fields = () => {
    const {
      id,
      channel,
      label,
      shift,
      colors,
      gradient,
      feature,
      isBlocked,
      isNew,
      onBlock,
      variant,
      resetSlot,
      onChangeValue,
      t,
    } = this.props
    const isDouble = shift.curve === 'FREE'

    return (
      <div className={doClassnames([layouts['snackbar--tight']])}>
        <div
          className={doClassnames([
            isDouble ? layouts['stackbar--tight'] : layouts['snackbar--tight'],
          ])}
        >
          <ShiftCurveFields
            id={id}
            channel={channel}
            label={label}
            shift={shift}
            colors={colors}
            gradient={gradient}
            feature={feature}
            isBlocked={isBlocked}
            isNew={isNew}
            onBlock={onBlock}
            variant={variant}
            onChangeValue={onChangeValue}
            t={t}
          />
        </div>
        {resetSlot}
      </div>
    )
  }

  // Render
  render() {
    const { id, shift, feature, isBlocked, isNew, onBlock, onChangeCurve, t } =
      this.props

    return (
      <div className={doClassnames([layouts['stackbar--tight']])}>
        <this.Fields />
        <ShiftCurveSelector
          id={id}
          curve={shift.curve}
          feature={feature}
          isBlocked={isBlocked}
          isNew={isNew}
          onBlock={onBlock}
          onChangeCurve={onChangeCurve}
          t={t}
        />
      </div>
    )
  }
}
