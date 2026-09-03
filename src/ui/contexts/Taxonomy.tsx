import { uid } from 'uid'
import { PureComponent } from 'preact/compat'
import {
  SystemConfiguration,
  TaxonomyGroup,
  TaxonomyGroupMember,
  TaxonomySchema,
} from '@yelbolt/engine-ui-color-palette'
import {
  Bar,
  Button,
  Input,
  Layout,
  SectionTitle,
  SemanticMessage,
  SortableList,
  layouts,
} from '@unoff/ui'
import { WithTranslationProps } from '../components/WithTranslation'
import { WithConfigProps } from '../components/WithConfig'
import { sendPluginMessage } from '../../utils/pluginMessage'
import { SystemSchemaMessage } from '../../types/messages'
import { BaseProps } from '../../types/app'
import { $system } from '../../stores/palette'

interface TaxonomyProps
  extends BaseProps, WithConfigProps, WithTranslationProps {
  id: string
  system: SystemConfiguration
}

interface TaxonomyState {
  selectedGroupId: string | null
}

export default class Taxonomy extends PureComponent<
  TaxonomyProps,
  TaxonomyState
> {
  private schemaMessage: SystemSchemaMessage
  private system: typeof $system
  private exampleSchema: TaxonomySchema
  private theme: string | null

  constructor(props: TaxonomyProps) {
    super(props)
    this.system = $system
    this.schemaMessage = {
      type: 'UPDATE_SYSTEM_SCHEMA',
      id: this.props.id,
      data: this.props.system.schema,
    }
    this.exampleSchema = this.buildExampleSchema()
    this.state = {
      selectedGroupId: this.props.system.schema.groups[0]?.id ?? null,
    }
    this.theme = document.documentElement.getAttribute('data-theme')
  }

  componentDidUpdate = (previousProps: Readonly<TaxonomyProps>) => {
    if (previousProps.system.schema !== this.props.system.schema) {
      const stillExists = this.props.system.schema.groups.some(
        (group) => group.id === this.state.selectedGroupId
      )
      if (!stillExists)
        this.setState({
          selectedGroupId: this.props.system.schema.groups[0]?.id ?? null,
        })
    }

    if (previousProps.t !== this.props.t)
      this.exampleSchema = this.buildExampleSchema()
  }

  // Helpers
  private buildExampleSchema = (): TaxonomySchema => ({
    groups: [
      {
        id: uid(),
        name: this.props.t('structure.taxonomy.example.groups.type.name'),
        members: [
          {
            id: uid(),
            name: this.props.t(
              'structure.taxonomy.example.groups.type.members.background'
            ),
          },
          {
            id: uid(),
            name: this.props.t(
              'structure.taxonomy.example.groups.type.members.text'
            ),
          },
          {
            id: uid(),
            name: this.props.t(
              'structure.taxonomy.example.groups.type.members.icon'
            ),
          },
          {
            id: uid(),
            name: this.props.t(
              'structure.taxonomy.example.groups.type.members.border'
            ),
          },
        ],
      },
      {
        id: uid(),
        name: this.props.t('structure.taxonomy.example.groups.prominence.name'),
        members: [
          {
            id: uid(),
            name: this.props.t(
              'structure.taxonomy.example.groups.prominence.members.primary'
            ),
          },
          {
            id: uid(),
            name: this.props.t(
              'structure.taxonomy.example.groups.prominence.members.secondary'
            ),
          },
          {
            id: uid(),
            name: this.props.t(
              'structure.taxonomy.example.groups.prominence.members.tertiary'
            ),
          },
          {
            id: uid(),
            name: this.props.t(
              'structure.taxonomy.example.groups.prominence.members.accent'
            ),
          },
          {
            id: uid(),
            name: this.props.t(
              'structure.taxonomy.example.groups.prominence.members.danger'
            ),
          },
          {
            id: uid(),
            name: this.props.t(
              'structure.taxonomy.example.groups.prominence.members.success'
            ),
          },
          {
            id: uid(),
            name: this.props.t(
              'structure.taxonomy.example.groups.prominence.members.warning'
            ),
          },
          {
            id: uid(),
            name: this.props.t(
              'structure.taxonomy.example.groups.prominence.members.info'
            ),
          },
        ],
      },
      {
        id: uid(),
        name: this.props.t('structure.taxonomy.example.groups.state.name'),
        members: [
          {
            id: uid(),
            name: this.props.t(
              'structure.taxonomy.example.groups.state.members.default'
            ),
          },
          {
            id: uid(),
            name: this.props.t(
              'structure.taxonomy.example.groups.state.members.hover'
            ),
          },
          {
            id: uid(),
            name: this.props.t(
              'structure.taxonomy.example.groups.state.members.pressed'
            ),
          },
          {
            id: uid(),
            name: this.props.t(
              'structure.taxonomy.example.groups.state.members.disabled'
            ),
          },
        ],
      },
    ],
  })

  private applySchemaChange = (schema: TaxonomySchema) => {
    this.schemaMessage.data = schema
    this.system.setKey('schema', schema)
    sendPluginMessage({ pluginMessage: this.schemaMessage }, '*')
  }

  // Handlers — Groups
  private selectGroup = (groupId: string) => {
    this.setState({ selectedGroupId: groupId })
  }

  private addGroup = () => {
    const label = this.props.t('structure.taxonomy.newGroupName')
    const existingCount = this.props.system.schema.groups.filter((group) =>
      group.name.includes(label)
    ).length
    const newGroup: TaxonomyGroup = {
      id: uid(),
      name: existingCount > 0 ? `${label} ${existingCount + 1}` : label,
      members: [],
    }

    const nextSchema: TaxonomySchema = {
      groups: [...this.props.system.schema.groups, newGroup],
    }

    this.applySchemaChange(nextSchema)
    this.setState({ selectedGroupId: newGroup.id })
  }

  private renameGroup = (groupId: string, name: string) => {
    const nextSchema: TaxonomySchema = {
      groups: this.props.system.schema.groups.map((group) =>
        group.id === groupId ? { ...group, name } : group
      ),
    }

    this.applySchemaChange(nextSchema)
  }

  private removeGroup = (groupId: string) => {
    const remainingGroups = this.props.system.schema.groups.filter(
      (group) => group.id !== groupId
    )
    const nextSchema: TaxonomySchema = { groups: remainingGroups }

    this.applySchemaChange(nextSchema)
    this.setState((state) => ({
      selectedGroupId:
        state.selectedGroupId === groupId
          ? (remainingGroups[0]?.id ?? null)
          : state.selectedGroupId,
    }))
  }

  // Handlers — Members
  private addMember = () => {
    const { selectedGroupId } = this.state
    if (selectedGroupId === null) return

    const currentGroup = this.props.system.schema.groups.find(
      (group) => group.id === selectedGroupId
    )
    if (currentGroup === undefined) return

    const label = this.props.t('structure.taxonomy.newMemberName')
    const existingCount = currentGroup.members.filter((member) =>
      member.name.includes(label)
    ).length
    const newMember: TaxonomyGroupMember = {
      id: uid(),
      name: existingCount > 0 ? `${label} ${existingCount + 1}` : label,
    }

    const nextSchema: TaxonomySchema = {
      groups: this.props.system.schema.groups.map((group) =>
        group.id === selectedGroupId
          ? { ...group, members: [...group.members, newMember] }
          : group
      ),
    }

    this.applySchemaChange(nextSchema)
  }

  private renameMember = (memberId: string, name: string) => {
    const { selectedGroupId } = this.state
    if (selectedGroupId === null) return

    const nextSchema: TaxonomySchema = {
      groups: this.props.system.schema.groups.map((group) =>
        group.id === selectedGroupId
          ? {
              ...group,
              members: group.members.map((member) =>
                member.id === memberId ? { ...member, name } : member
              ),
            }
          : group
      ),
    }

    this.applySchemaChange(nextSchema)
  }

  private removeMember = (memberId: string) => {
    const { selectedGroupId } = this.state
    if (selectedGroupId === null) return

    const nextSchema: TaxonomySchema = {
      groups: this.props.system.schema.groups.map((group) =>
        group.id === selectedGroupId
          ? {
              ...group,
              members: group.members.filter((member) => member.id !== memberId),
            }
          : group
      ),
    }

    this.applySchemaChange(nextSchema)
  }

  // Direct Actions — Groups
  private onChangeGroupsOrder = (groups: Array<TaxonomyGroup>) => {
    const nextSchema: TaxonomySchema = { groups }

    this.applySchemaChange(nextSchema)
  }

  private removeGroupHandler = (e: Event) => {
    const element = (e.target as HTMLElement).closest('.draggable-item')
    const groupId = element?.getAttribute('data-id') ?? null

    if (groupId !== null) this.removeGroup(groupId)
  }

  // Direct Actions — Members
  private onChangeMembersOrder = (members: Array<TaxonomyGroupMember>) => {
    const { selectedGroupId } = this.state
    if (selectedGroupId === null) return

    const nextSchema: TaxonomySchema = {
      groups: this.props.system.schema.groups.map((group) =>
        group.id === selectedGroupId ? { ...group, members } : group
      ),
    }

    this.applySchemaChange(nextSchema)
  }

  private removeMemberHandler = (e: Event) => {
    const element = (e.target as HTMLElement).closest('.draggable-item')
    const memberId = element?.getAttribute('data-id') ?? null

    if (memberId !== null) this.removeMember(memberId)
  }

  // Handlers — Example
  private onUseExample = () => {
    const schema = this.exampleSchema
    this.applySchemaChange(schema)
    this.setState({ selectedGroupId: schema.groups[0]?.id ?? null })
    this.exampleSchema = this.buildExampleSchema()
  }

  private onStartFromScratch = () => {
    this.addGroup()
  }

  // Render
  render() {
    let background

    switch (this.theme) {
      case 'figma':
        background = 'var(--figma-color-bg-default, var(--figma-color-bg))'
        break
      case 'penpot':
        background = 'var(--penpot-color-background-primary)'
        break
      case 'sketch':
        background = 'var(--sketch-color-background-primary)'
        break
      case 'framer':
        background = 'var(--framer-color-bg)'
        break
      default:
        background = 'var(--figma-color-bg-default, var(--figma-color-bg))'
    }

    const { schema } = this.props.system
    const showExample = schema.groups.length === 0
    const exampleSchema = showExample ? this.exampleSchema : null
    const displayGroups = exampleSchema?.groups ?? schema.groups
    const selectedGroup = showExample
      ? (exampleSchema?.groups[0] ?? null)
      : (displayGroups.find(
          (group) => group.id === this.state.selectedGroupId
        ) ?? null)

    return (
      <Layout
        id="taxonomy"
        column={[
          {
            node: (
              <>
                <Bar
                  id="taxonomy-groups-header"
                  leftPartSlot={
                    <SectionTitle
                      label={this.props.t('structure.taxonomy.groups')}
                      indicator={displayGroups.length.toString()}
                      helper={this.props.t('structure.taxonomy.groupsHelper')}
                    />
                  }
                  rightPartSlot={
                    !showExample ? (
                      <Button
                        type="icon"
                        icon="plus"
                        feature="ADD_GROUP"
                        helper={{
                          label: this.props.t('structure.taxonomy.addGroup'),
                        }}
                        action={this.addGroup}
                      />
                    ) : null
                  }
                  clip={['LEFT']}
                  border={['BOTTOM']}
                />
                <div style={{ position: 'relative', minHeight: '320px' }}>
                  <SortableList<TaxonomyGroup>
                    data={displayGroups}
                    primarySlot={displayGroups.map((group) => (
                      <div
                        key={group.id}
                        className={layouts['snackbar--medium']}
                      >
                        <Input
                          type="TEXT"
                          value={group.name}
                          charactersLimit={32}
                          isFlex
                          isDisabled={showExample}
                          canBeEmpty={false}
                          helper={{
                            label: this.props.t('structure.taxonomy.groupName'),
                          }}
                          onBlur={(e) =>
                            this.renameGroup(
                              group.id,
                              (e.currentTarget as HTMLInputElement).value
                            )
                          }
                          onValid={(e) =>
                            this.renameGroup(
                              group.id,
                              (e.currentTarget as HTMLInputElement).value
                            )
                          }
                        />
                        {!showExample && (
                          <Button
                            type="icon"
                            icon="adjust"
                            state={
                              selectedGroup?.id === group.id
                                ? 'selected'
                                : undefined
                            }
                            helper={{
                              label: this.props.t(
                                'structure.taxonomy.selectGroup'
                              ),
                            }}
                            action={() => this.selectGroup(group.id)}
                          />
                        )}
                      </div>
                    ))}
                    helpers={{
                      remove: this.props.t('structure.taxonomy.removeGroup'),
                    }}
                    canBeEmpty
                    isBlocked={showExample}
                    isScrollable
                    onChangeSortableList={this.onChangeGroupsOrder}
                    onRemoveItem={this.removeGroupHandler}
                  />
                  {showExample && (
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'end',
                        position: 'absolute',
                        inset: 0,
                        backgroundImage: `linear-gradient(0deg, ${background} 20%, rgba(255, 255, 255, 0))`,
                        zIndex: 1,
                      }}
                    >
                      <SemanticMessage
                        type="NEUTRAL"
                        message={this.props.t(
                          'structure.taxonomy.example.message'
                        )}
                        orientation="VERTICAL"
                        actionsSlot={
                          <>
                            <Button
                              type="secondary"
                              label={this.props.t(
                                'structure.taxonomy.example.startFromScratch'
                              )}
                              action={this.onStartFromScratch}
                            />
                            <Button
                              type="primary"
                              label={this.props.t(
                                'structure.taxonomy.example.useExample'
                              )}
                              action={this.onUseExample}
                            />
                          </>
                        }
                      />
                    </div>
                  )}
                </div>
              </>
            ),
            typeModifier: 'BLANK',
          },
          {
            node: (
              <>
                <Bar
                  id="taxonomy-members-header"
                  leftPartSlot={
                    <SectionTitle
                      label={this.props.t('structure.taxonomy.members')}
                      indicator={
                        selectedGroup !== null
                          ? `${selectedGroup.name} · ${selectedGroup.members.length}`
                          : undefined
                      }
                      helper={this.props.t('structure.taxonomy.membersHelper')}
                    />
                  }
                  rightPartSlot={
                    !showExample ? (
                      <Button
                        type="icon"
                        icon="plus"
                        feature="ADD_MEMBER"
                        isDisabled={selectedGroup === null}
                        helper={{
                          label: this.props.t('structure.taxonomy.addMember'),
                        }}
                        action={this.addMember}
                      />
                    ) : null
                  }
                  clip={['LEFT']}
                  border={['BOTTOM']}
                />
                {selectedGroup === null ? (
                  <div className={layouts.centered}>
                    <SemanticMessage
                      type="NEUTRAL"
                      message={this.props.t(
                        'structure.taxonomy.noGroupSelected'
                      )}
                    />
                  </div>
                ) : selectedGroup.members.length === 0 ? (
                  <div className={layouts.centered}>
                    <SemanticMessage
                      type="NEUTRAL"
                      message={this.props.t('structure.taxonomy.noMembers')}
                    />
                  </div>
                ) : (
                  <SortableList<TaxonomyGroupMember>
                    data={selectedGroup.members}
                    primarySlot={selectedGroup.members.map((member) => (
                      <Input
                        key={member.id}
                        type="TEXT"
                        value={member.name}
                        charactersLimit={32}
                        isFlex
                        isDisabled={showExample}
                        canBeEmpty={false}
                        helper={{
                          label: this.props.t('structure.taxonomy.memberName'),
                        }}
                        onBlur={(e) =>
                          this.renameMember(
                            member.id,
                            (e.currentTarget as HTMLInputElement).value
                          )
                        }
                        onValid={(e) =>
                          this.renameMember(
                            member.id,
                            (e.currentTarget as HTMLInputElement).value
                          )
                        }
                      />
                    ))}
                    helpers={{
                      remove: this.props.t('structure.taxonomy.removeMember'),
                    }}
                    canBeEmpty
                    isBlocked={showExample}
                    isScrollable
                    onChangeSortableList={this.onChangeMembersOrder}
                    onRemoveItem={this.removeMemberHandler}
                  />
                )}
              </>
            ),
            typeModifier: 'BLANK',
          },
        ]}
        isFullHeight
      />
    )
  }
}
