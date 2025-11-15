import { Feature, FeatureStatus } from '@a_ng_d/figmug-utils'
import { Translations } from '../types/translations'
import { Context, Editor, PlanStatus, Service } from '../types/app'

export const setContexts = (
  contextList: Array<Context>,
  planStatus: PlanStatus,
  features: Array<Feature<'BROWSE' | 'CREATE' | 'EDIT' | 'SEE'>>,
  editor: Editor,
  service: Service,
  currentLocales: Translations
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
    SOURCE: new FeatureStatus({
      features: features,
      featureName: 'SOURCE',
      planStatus: planStatus,
      currentService: service,
      currentEditor: editor,
    }),
    SOURCE_OVERVIEW: new FeatureStatus({
      features: features,
      featureName: 'SOURCE_OVERVIEW',
      planStatus: planStatus,
      currentService: service,
      currentEditor: editor,
    }),
    SOURCE_EXPLORE: new FeatureStatus({
      features: features,
      featureName: 'SOURCE_EXPLORE',
      planStatus: planStatus,
      currentService: service,
      currentEditor: editor,
    }),
    SOURCE_IMAGE: new FeatureStatus({
      features: features,
      featureName: 'SOURCE_IMAGE',
      planStatus: planStatus,
      currentService: service,
      currentEditor: editor,
    }),
    SOURCE_HARMONY: new FeatureStatus({
      features: features,
      featureName: 'SOURCE_HARMONY',
      planStatus: planStatus,
      currentService: service,
      currentEditor: editor,
    }),
    SOURCE_AI: new FeatureStatus({
      features: features,
      featureName: 'SOURCE_AI',
      planStatus: planStatus,
      currentService: service,
      currentEditor: editor,
    }),
    SCALE: new FeatureStatus({
      features: features,
      featureName: 'SCALE',
      planStatus: planStatus,
      currentService: service,
      currentEditor: editor,
    }),
    COLORS: new FeatureStatus({
      features: features,
      featureName: 'COLORS',
      planStatus: planStatus,
      currentService: service,
      currentEditor: editor,
    }),
    THEMES: new FeatureStatus({
      features: features,
      featureName: 'THEMES',
      planStatus: planStatus,
      currentService: service,
      currentEditor: editor,
    }),
    EXPORT: new FeatureStatus({
      features: features,
      featureName: 'EXPORT',
      planStatus: planStatus,
      currentService: service,
      currentEditor: editor,
    }),
    SETTINGS: new FeatureStatus({
      features: features,
      featureName: 'SETTINGS',
      planStatus: planStatus,
      currentService: service,
      currentEditor: editor,
    }),
    PROPERTIES: new FeatureStatus({
      features: features,
      featureName: 'PROPERTIES',
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
      label: currentLocales.browse.contexts.local,
      id: 'LOCAL_PALETTES',
      isUpdated: false,
      isNew: featuresList.LOCAL_PALETTES.isNew(),
      isActive: featuresList.LOCAL_PALETTES.isActive(),
    },
    {
      label: currentLocales.browse.contexts.page,
      id: 'LOCAL_PALETTES_PAGE',
      isUpdated: false,
      isNew: featuresList.LOCAL_PALETTES_PAGE.isNew(),
      isActive: featuresList.LOCAL_PALETTES_PAGE.isActive(),
    },
    {
      label: currentLocales.browse.contexts.file,
      id: 'LOCAL_PALETTES_FILE',
      isUpdated: false,
      isNew: featuresList.LOCAL_PALETTES_FILE.isNew(),
      isActive: featuresList.LOCAL_PALETTES_FILE.isActive(),
    },
    {
      label: currentLocales.browse.contexts.remote,
      id: 'REMOTE_PALETTES',
      isUpdated: false,
      isNew: featuresList.REMOTE_PALETTES.isNew(),
      isActive: featuresList.REMOTE_PALETTES.isActive(),
    },
    {
      label: currentLocales.browse.contexts.self,
      id: 'REMOTE_PALETTES_SELF',
      isUpdated: false,
      isNew: featuresList.REMOTE_PALETTES_SELF.isNew(),
      isActive: featuresList.REMOTE_PALETTES_SELF.isActive(),
    },
    {
      label: currentLocales.browse.contexts.community,
      id: 'REMOTE_PALETTES_COMMUNITY',
      isUpdated: false,
      isNew: featuresList.REMOTE_PALETTES_COMMUNITY.isNew(),
      isActive: featuresList.REMOTE_PALETTES_COMMUNITY.isActive(),
    },
    {
      label: currentLocales.browse.contexts.org,
      id: 'REMOTE_PALETTES_ORG',
      isUpdated: false,
      isNew: featuresList.REMOTE_PALETTES_ORG.isNew(),
      isActive: featuresList.REMOTE_PALETTES_ORG.isActive(),
    },
    {
      label: currentLocales.browse.contexts.starred,
      id: 'REMOTE_PALETTES_STARRED',
      isUpdated: false,
      isNew: featuresList.REMOTE_PALETTES_STARRED.isNew(),
      isActive: featuresList.REMOTE_PALETTES_STARRED.isActive(),
    },
    {
      label: currentLocales.contexts.source,
      id: 'SOURCE',
      isUpdated: false,
      isNew: featuresList.SOURCE.isNew(),
      isActive: featuresList.SOURCE.isActive(),
    },
    {
      label: currentLocales.source.contexts.overview,
      id: 'SOURCE_OVERVIEW',
      isUpdated: false,
      isNew: featuresList.SOURCE_EXPLORE.isNew(),
      isActive: featuresList.SOURCE_EXPLORE.isActive(),
    },
    {
      label: currentLocales.source.contexts.explore,
      id: 'SOURCE_EXPLORE',
      isUpdated: false,
      isNew: featuresList.SOURCE_EXPLORE.isNew(),
      isActive: featuresList.SOURCE_EXPLORE.isActive(),
    },
    {
      label: currentLocales.source.contexts.image,
      id: 'SOURCE_IMAGE',
      isUpdated: false,
      isNew: featuresList.SOURCE_IMAGE.isNew(),
      isActive: featuresList.SOURCE_IMAGE.isActive(),
    },
    {
      label: currentLocales.source.contexts.harmony,
      id: 'SOURCE_HARMONY',
      isUpdated: false,
      isNew: featuresList.SOURCE_HARMONY.isNew(),
      isActive: featuresList.SOURCE_HARMONY.isActive(),
    },
    {
      label: currentLocales.source.contexts.ai,
      id: 'SOURCE_AI',
      isUpdated: false,
      isNew: featuresList.SOURCE_AI.isNew(),
      isActive: featuresList.SOURCE_AI.isActive(),
    },
    {
      label: currentLocales.contexts.scale,
      id: 'SCALE',
      isUpdated: false,
      isNew: featuresList.SCALE.isNew(),
      isActive: featuresList.SCALE.isActive(),
    },
    {
      label: currentLocales.contexts.colors,
      id: 'COLORS',
      isUpdated: false,
      isNew: featuresList.COLORS.isNew(),
      isActive: featuresList.COLORS.isActive(),
    },
    {
      label: currentLocales.contexts.themes,
      id: 'THEMES',
      isUpdated: false,
      isNew: featuresList.THEMES.isNew(),
      isActive: featuresList.THEMES.isActive(),
    },
    {
      label: currentLocales.contexts.export,
      id: 'EXPORT',
      isUpdated: false,
      isNew: featuresList.EXPORT.isNew(),
      isActive: featuresList.EXPORT.isActive(),
    },
    {
      label: currentLocales.contexts.settings,
      id: 'SETTINGS',
      isUpdated: false,
      isNew: featuresList.SETTINGS.isNew(),
      isActive: featuresList.SETTINGS.isActive(),
    },
    {
      label: 'Properties',
      id: 'PROPERTIES',
      isUpdated: false,
      isNew: featuresList.PROPERTIES.isNew(),
      isActive: featuresList.PROPERTIES.isActive(),
    },
  ]

  const filteredContexts = contexts.filter((context) => {
    return contextList.includes(context.id) && context.isActive
  })

  return filteredContexts.sort((a, b) => {
    return contextList.indexOf(a.id) - contextList.indexOf(b.id)
  })
}
