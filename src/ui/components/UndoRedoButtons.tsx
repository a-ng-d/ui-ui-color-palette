import { Component } from 'preact/compat'
import { Button, layouts } from '@unoff/ui'
import { useTranslate } from '@tolgee/react'
import { $canRedo, $canUndo, redo, undo } from '../../stores/history'

interface UndoRedoButtonsState {
  canUndo: boolean
  canRedo: boolean
}

interface UndoRedoButtonsProps {
  t: (key: string, fallback?: string) => string
  documentWidth: number
}

class UndoRedoButtonsInner extends Component<
  UndoRedoButtonsProps,
  UndoRedoButtonsState
> {
  private unsubscribeUndo: (() => void) | undefined
  private unsubscribeRedo: (() => void) | undefined

  constructor(props: UndoRedoButtonsProps) {
    super(props)
    this.state = {
      canUndo: $canUndo.get(),
      canRedo: $canRedo.get(),
    }
  }

  componentDidMount = () => {
    this.unsubscribeUndo = $canUndo.subscribe((value) => {
      this.setState({ canUndo: value })
    })
    this.unsubscribeRedo = $canRedo.subscribe((value) => {
      this.setState({ canRedo: value })
    })
  }

  componentWillUnmount = () => {
    if (this.unsubscribeUndo) this.unsubscribeUndo()
    if (this.unsubscribeRedo) this.unsubscribeRedo()
  }

  render = () => {
    const { t } = this.props
    return (
      <div
        className={
          this.props.documentWidth > 460
            ? layouts['stackbar--medium']
            : layouts['snackbar--medium']
        }
      >
        <Button
          type="icon"
          icon="undo"
          helper={{ label: t('actions.undo') }}
          isDisabled={!this.state.canUndo}
          action={() => undo()}
        />
        <Button
          type="icon"
          icon="redo"
          helper={{ label: t('actions.redo') }}
          isDisabled={!this.state.canRedo}
          action={() => redo()}
        />
      </div>
    )
  }
}

const UndoRedoButtons = () => {
  const { t } = useTranslate()
  return (
    <UndoRedoButtonsInner
      t={t}
      documentWidth={window.innerWidth}
    />
  )
}

export default UndoRedoButtons
