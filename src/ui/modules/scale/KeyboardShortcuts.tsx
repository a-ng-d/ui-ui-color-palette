import { createPortal, PureComponent } from 'preact/compat'
import {
  Dialog,
  KeyboardShortcutItem,
  Section,
  SectionTitle,
  SimpleItem,
} from '@unoff/ui'
import { WithTranslationProps } from '../../components/WithTranslation'
import { WithConfigProps } from '../../components/WithConfig'
import { getPortalTarget } from '../../../utils/getPortalTarget'
import { BaseProps } from '../../../types/app'
import { trackScaleManagementEvent } from '../../../external/tracking/eventsTracker'

interface KeyboardShortcutsProps
  extends BaseProps, WithConfigProps, WithTranslationProps {
  isOpen: boolean
  onClose: () => void
}

export default class KeyboardShortcuts extends PureComponent<KeyboardShortcutsProps> {
  // Render
  render() {
    if (!this.props.isOpen) return null

    const isMacOrWinKeyboard =
      navigator.userAgent.indexOf('Mac') !== -1 ? '⌘' : '⌃'

    trackScaleManagementEvent(
      this.props.config.env.isMixpanelEnabled,
      this.props.userSession.userId,
      this.props.userIdentity.id,
      this.props.planStatus,
      this.props.userConsent.find((consent) => consent.id === 'mixpanel')
        ?.isConsented ?? false,
      {
        feature: 'OPEN_KEYBOARD_SHORTCUTS',
      }
    )

    return (
      getPortalTarget('modal') &&
      createPortal(
        <Dialog
          title={this.props.t('scale.tips.title')}
          pin="RIGHT"
          onClose={this.props.onClose}
        >
          <div className="dialog__blank">
            <Section
              body={[
                {
                  node: (
                    <KeyboardShortcutItem
                      label={this.props.t('scale.tips.move')}
                      shortcuts={[
                        [
                          isMacOrWinKeyboard,
                          this.props.t('scale.tips.inputs.drag'),
                        ],
                      ]}
                    />
                  ),
                  spacingModifier: 'NONE',
                },
                {
                  node: (
                    <KeyboardShortcutItem
                      label={this.props.t('scale.tips.select')}
                      shortcuts={[[this.props.t('scale.tips.inputs.click')]]}
                    />
                  ),
                  spacingModifier: 'NONE',
                },
                {
                  node: (
                    <KeyboardShortcutItem
                      label={this.props.t('scale.tips.unselect')}
                      shortcuts={[[this.props.t('scale.tips.inputs.escape')]]}
                    />
                  ),
                  spacingModifier: 'NONE',
                },
                {
                  node: (
                    <KeyboardShortcutItem
                      label={this.props.t('scale.tips.navPrevious')}
                      shortcuts={[
                        [
                          this.props.t('scale.tips.inputs.shift'),
                          this.props.t('scale.tips.inputs.tab'),
                        ],
                      ]}
                    />
                  ),
                  spacingModifier: 'NONE',
                },
                {
                  node: (
                    <KeyboardShortcutItem
                      label={this.props.t('scale.tips.navNext')}
                      shortcuts={[[this.props.t('scale.tips.inputs.tab')]]}
                    />
                  ),
                  spacingModifier: 'NONE',
                },
                {
                  node: (
                    <KeyboardShortcutItem
                      label={this.props.t('scale.tips.type')}
                      shortcuts={[
                        [this.props.t('scale.tips.inputs.dbClick')],
                        [this.props.t('scale.tips.inputs.enter')],
                      ]}
                      separator={this.props.t('scale.tips.inputs.or')}
                    />
                  ),
                  spacingModifier: 'NONE',
                },
                {
                  node: (
                    <KeyboardShortcutItem
                      label={this.props.t('scale.tips.shiftLeft')}
                      shortcuts={[
                        [this.props.t('scale.tips.inputs.left')],
                        [
                          this.props.t('scale.tips.inputs.shift'),
                          this.props.t('scale.tips.inputs.left'),
                        ],
                      ]}
                      separator={this.props.t('scale.tips.inputs.or')}
                    />
                  ),
                  spacingModifier: 'NONE',
                },
                {
                  node: (
                    <KeyboardShortcutItem
                      label={this.props.t('scale.tips.shiftRight')}
                      shortcuts={[
                        [this.props.t('scale.tips.inputs.right')],
                        [
                          this.props.t('scale.tips.inputs.shift'),
                          this.props.t('scale.tips.inputs.right'),
                        ],
                      ]}
                      separator={this.props.t('scale.tips.inputs.or')}
                    />
                  ),
                  spacingModifier: 'NONE',
                },
              ]}
              border={['BOTTOM']}
            />
            <Section
              title={
                <SimpleItem
                  leftPartSlot={
                    <SectionTitle label={this.props.t('scale.tips.custom')} />
                  }
                  isListItem={false}
                  alignment="CENTER"
                />
              }
              body={[
                {
                  node: (
                    <KeyboardShortcutItem
                      label={this.props.t('scale.tips.add')}
                      shortcuts={[[this.props.t('scale.tips.inputs.click')]]}
                    />
                  ),
                  spacingModifier: 'NONE',
                },
                {
                  node: (
                    <KeyboardShortcutItem
                      label={this.props.t('scale.tips.remove')}
                      shortcuts={[
                        [this.props.t('scale.tips.inputs.backspace')],
                      ]}
                    />
                  ),
                  spacingModifier: 'NONE',
                },
              ]}
            />
          </div>
        </Dialog>,
        getPortalTarget('modal') ?? document.createElement('app')
      )
    )
  }
}
