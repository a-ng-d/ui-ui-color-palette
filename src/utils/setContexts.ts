import { Feature, FeatureStatus } from '@a_ng_d/figmug-utils'
import { Context, Editor, PlanStatus, Service } from '../types/app'
import { locales } from '../content/locales'

export const setContexts = (
  contextList: Array<Context>,
  planStatus: PlanStatus,
  features: Array<Feature<'BROWSE' | 'CREATE' | 'EDIT' | 'TRANSFER'>>,
  editor: Editor,
  service: Service
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
  }

  const contexts: Array<{
    label: string
    id: Context
    isUpdated: boolean
    isActive: boolean
  }> = [
    {
      label: locales.get().browse.contexts.local,
      id: 'LOCAL_PALETTES',
      isUpdated: featuresList.LOCAL_PALETTES.isNew(),
      isActive: featuresList.LOCAL_PALETTES.isActive(),
    },
    {
      label: locales.get().browse.contexts.page,
      id: 'LOCAL_PALETTES_PAGE',
      isUpdated: featuresList.LOCAL_PALETTES_PAGE.isNew(),
      isActive: featuresList.LOCAL_PALETTES_PAGE.isActive(),
    },
    {
      label: locales.get().browse.contexts.file,
      id: 'LOCAL_PALETTES_FILE',
      isUpdated: featuresList.LOCAL_PALETTES_FILE.isNew(),
      isActive: featuresList.LOCAL_PALETTES_FILE.isActive(),
    },
    {
      label: locales.get().browse.contexts.remote,
      id: 'REMOTE_PALETTES',
      isUpdated: featuresList.REMOTE_PALETTES.isNew(),
      isActive: featuresList.REMOTE_PALETTES.isActive(),
    },
    {
      label: locales.get().browse.contexts.self,
      id: 'REMOTE_PALETTES_SELF',
      isUpdated: featuresList.REMOTE_PALETTES_SELF.isNew(),
      isActive: featuresList.REMOTE_PALETTES_SELF.isActive(),
    },
    {
      label: locales.get().browse.contexts.community,
      id: 'REMOTE_PALETTES_COMMUNITY',
      isUpdated: featuresList.REMOTE_PALETTES_COMMUNITY.isNew(),
      isActive: featuresList.REMOTE_PALETTES_COMMUNITY.isActive(),
    },
    {
      label: locales.get().contexts.source,
      id: 'SOURCE',
      isUpdated: featuresList.SOURCE.isNew(),
      isActive: featuresList.SOURCE.isActive(),
    },
    {
      label: locales.get().source.contexts.overview,
      id: 'SOURCE_OVERVIEW',
      isUpdated: featuresList.SOURCE_EXPLORE.isNew(),
      isActive: featuresList.SOURCE_EXPLORE.isActive(),
    },
    {
      label: locales.get().source.contexts.explore,
      id: 'SOURCE_EXPLORE',
      isUpdated: featuresList.SOURCE_EXPLORE.isNew(),
      isActive: featuresList.SOURCE_EXPLORE.isActive(),
    },
    {
      label: locales.get().contexts.scale,
      id: 'SCALE',
      isUpdated: featuresList.SCALE.isNew(),
      isActive: featuresList.SCALE.isActive(),
    },
    {
      label: locales.get().contexts.colors,
      id: 'COLORS',
      isUpdated: featuresList.COLORS.isNew(),
      isActive: featuresList.COLORS.isActive(),
    },
    {
      label: locales.get().contexts.themes,
      id: 'THEMES',
      isUpdated: featuresList.THEMES.isNew(),
      isActive: featuresList.THEMES.isActive(),
    },
    {
      label: locales.get().contexts.export,
      id: 'EXPORT',
      isUpdated: featuresList.EXPORT.isNew(),
      isActive: featuresList.EXPORT.isActive(),
    },
    {
      label: locales.get().contexts.settings,
      id: 'SETTINGS',
      isUpdated: featuresList.SETTINGS.isNew(),
      isActive: featuresList.SETTINGS.isActive(),
    },
  ]

  const filteredContexts = contexts.filter((context) => {
    return contextList.includes(context.id) && context.isActive
  })

  return filteredContexts.sort((a, b) => {
    return contextList.indexOf(a.id) - contextList.indexOf(b.id)
  })
}
