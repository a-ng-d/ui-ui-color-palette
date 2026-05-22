import React from 'react'
import { Component } from 'preact/compat'
import { Button, layouts } from '@unoff/ui'
import { useTranslate } from '@tolgee/react'
import { $canRedo, $canUndo, redo, undo } from '../../stores/history'
import Feature from './Feature'

interface UndoRedoButtonsState {
  canUndo: boolean
  canRedo: boolean
}

interface UndoRedoButtonsProps {
  t: (key: string, fallback?: string) => string
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
      <div className={layouts['stackbar--medium']}>
        <Feature isActive={this.state.canUndo || this.state.canRedo}>
          <Button
            type="icon"
            icon="undo"
            helper={{ label: t('actions.undo', 'Undo') }}
            isDisabled={!this.state.canUndo}
            action={() => undo()}
          />
          <Button
            type="icon"
            icon="redo"
            helper={{ label: t('actions.redo', 'Redo') }}
            isDisabled={!this.state.canRedo}
            action={() => redo()}
          />
        </Feature>
      </div>
    )
  }
}

const UndoRedoButtons = () => {
  const { t } = useTranslate()
  return <UndoRedoButtonsInner t={t} />
}

export default UndoRedoButtons
