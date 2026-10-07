import { Component, KeyboardEvent, MouseEvent } from 'preact/compat'
import { IconList, SegmentedControl } from '@unoff/ui'
import { useTranslate } from '@tolgee/react'
import { sendPluginMessage } from '../../utils/pluginMessage'
import { PalettesView } from '../../types/app'
import { $palettesView } from '../../stores/preferences'

interface PalettesViewSwitchProps {
  t: (key: string, fallback?: string) => string
}

interface PalettesViewSwitchState {
  palettesView: PalettesView
}

class PalettesViewSwitchInner extends Component<
  PalettesViewSwitchProps,
  PalettesViewSwitchState
> {
  private subscribePalettesView: (() => void) | undefined

  constructor(props: PalettesViewSwitchProps) {
    super(props)
    this.state = {
      palettesView: $palettesView.get(),
    }
  }

  // Lifecycle
  componentDidMount = () => {
    this.subscribePalettesView = $palettesView.subscribe((value) => {
      this.setState({ palettesView: value })
    })
  }

  componentWillUnmount = () => {
    if (this.subscribePalettesView) this.subscribePalettesView()
  }

  // Handlers
  changePalettesViewHandler = (
    e: MouseEvent<HTMLElement> & KeyboardEvent<HTMLElement>
  ) => {
    const view = (e.currentTarget.dataset.feature as PalettesView) ?? 'LIST'

    $palettesView.set(view)

    sendPluginMessage(
      {
        pluginMessage: {
          type: 'SET_ITEMS',
          items: [
            {
              key: 'palettes_view',
              value: view,
            },
          ],
        },
      },
      '*'
    )
  }

  // Render
  render = () => {
    const { t } = this.props

    return (
      <SegmentedControl
        items={[
          {
            id: 'MOSAIC',
            icon: {
              type: 'PICTO' as const,
              name: 'list-tile' as IconList,
            },
            helper: {
              label: t('browse.views.mosaic'),
              pin: 'BOTTOM' as const,
            },
          },
          {
            id: 'LIST',
            icon: {
              type: 'PICTO' as const,
              name: 'list' as IconList,
            },
            helper: {
              label: t('browse.views.list'),
              pin: 'BOTTOM' as const,
            },
          },
        ]}
        active={this.state.palettesView}
        action={this.changePalettesViewHandler}
      />
    )
  }
}

const PalettesViewSwitch = () => {
  const { t } = useTranslate()

  return <PalettesViewSwitchInner t={t} />
}

export default PalettesViewSwitch
