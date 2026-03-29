import { Feature, FeatureStatus } from '@unoff/utils'
import { Context, Editor, PlanStatus, Service } from '../types/app'

export const setContexts = (
  contextList: Array<Context>,
  planStatus: PlanStatus,
  features: Array<Feature<Service>>,
  editor: Editor,
  service: Service,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  locales: (key: string, params?: Record<string, any> | undefined) => string
) => {
  const featuresList = {
    LOCAL_PALETTES: new FeatureStatus({
      features: features,
      featureName: 'LOCAL_PALETTES',
      planStatus: planStatus,
      currentService: service,
      currentEditor: editor,
    }),
    LOCAL_PALETTES_PAGE: new FeatureStatus({
      features: features,
      featureName: 'LOCAL_PALETTES_PAGE',
      planStatus: planStatus,
      currentService: service,
      currentEditor: editor,
    }),
    LOCAL_PALETTES_FILE: new FeatureStatus({
      features: features,
      featureName: 'LOCAL_PALETTES_FILE',
      planStatus: planStatus,
      currentService: service,
      currentEditor: editor,
    }),
    REMOTE_PALETTES: new FeatureStatus({
      features: features,
      featureName: 'REMOTE_PALETTES',
      planStatus: planStatus,
      currentService: service,
      currentEditor: editor,
    }),
    REMOTE_PALETTES_SELF: new FeatureStatus({
      features: features,
      featureName: 'REMOTE_PALETTES_SELF',
      planStatus: planStatus,
      currentService: service,
      currentEditor: editor,
    }),
    REMOTE_PALETTES_COMMUNITY: new FeatureStatus({
      features: features,
      featureName: 'REMOTE_PALETTES_COMMUNITY',
      planStatus: planStatus,
      currentService: service,
      currentEditor: editor,
    }),
    REMOTE_PALETTES_ORG: new FeatureStatus({
      features: features,
      featureName: 'REMOTE_PALETTES_ORG',
      planStatus: planStatus,
      currentService: service,
      currentEditor: editor,
    }),
    REMOTE_PALETTES_STARRED: new FeatureStatus({
      features: features,
      featureName: 'REMOTE_PALETTES_STARRED',
      planStatus: planStatus,
      currentService: service,
      currentEditor: editor,
    }),
  }

  const contexts: Array<{
    label: string
    id: Context
    isUpdated: boolean
    isNew: boolean
    isActive: boolean
  }> = [
    {
      label: locales('browse.contexts.local'),
      id: 'LOCAL_PALETTES',
      isUpdated: false,
      isNew: featuresList.LOCAL_PALETTES.isNew(),
      isActive: featuresList.LOCAL_PALETTES.isActive(),
    },
    {
      label: locales('browse.contexts.page'),
      id: 'LOCAL_PALETTES_PAGE',
      isUpdated: false,
      isNew: featuresList.LOCAL_PALETTES_PAGE.isNew(),
      isActive: featuresList.LOCAL_PALETTES_PAGE.isActive(),
    },
    {
      label: locales('browse.contexts.file'),
      id: 'LOCAL_PALETTES_FILE',
      isUpdated: false,
      isNew: featuresList.LOCAL_PALETTES_FILE.isNew(),
      isActive: featuresList.LOCAL_PALETTES_FILE.isActive(),
    },
    {
      label: locales('browse.contexts.remote'),
      id: 'REMOTE_PALETTES',
      isUpdated: false,
      isNew: featuresList.REMOTE_PALETTES.isNew(),
      isActive: featuresList.REMOTE_PALETTES.isActive(),
    },
    {
      label: locales('browse.contexts.self'),
      id: 'REMOTE_PALETTES_SELF',
      isUpdated: false,
      isNew: featuresList.REMOTE_PALETTES_SELF.isNew(),
      isActive: featuresList.REMOTE_PALETTES_SELF.isActive(),
    },
    {
      label: locales('browse.contexts.community'),
      id: 'REMOTE_PALETTES_COMMUNITY',
      isUpdated: false,
      isNew: featuresList.REMOTE_PALETTES_COMMUNITY.isNew(),
      isActive: featuresList.REMOTE_PALETTES_COMMUNITY.isActive(),
    },
    {
      label: locales('browse.contexts.org'),
      id: 'REMOTE_PALETTES_ORG',
      isUpdated: false,
      isNew: featuresList.REMOTE_PALETTES_ORG.isNew(),
      isActive: featuresList.REMOTE_PALETTES_ORG.isActive(),
    },
    {
      label: locales('browse.contexts.starred'),
      id: 'REMOTE_PALETTES_STARRED',
      isUpdated: false,
      isNew: featuresList.REMOTE_PALETTES_STARRED.isNew(),
      isActive: featuresList.REMOTE_PALETTES_STARRED.isActive(),
    },
  ]

  const filteredContexts = contexts.filter((context) => {
    return contextList.includes(context.id) && context.isActive
  })

  return filteredContexts.sort((a, b) => {
    return contextList.indexOf(a.id) - contextList.indexOf(b.id)
  })
}
