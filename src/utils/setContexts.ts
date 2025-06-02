import { Feature, FeatureStatus } from '@a_ng_d/figmug-utils'
import { locals } from '../content/locals'
import { Context, PlanStatus } from '../types/app'

export const setContexts = (
  contextList: Array<Context>,
  planStatus: PlanStatus,
  features: Array<Feature<'BROWSE' | 'CREATE' | 'EDIT' | 'TRANSFER'>>
) => {
  const featuresList = {
    LOCAL_PALETTES: new FeatureStatus({
      features: features,
      featureName: 'LOCAL_PALETTES',
      planStatus: planStatus,
    }),
    LOCAL_PALETTES_PAGE: new FeatureStatus({
      features: features,
      featureName: 'LOCAL_PALETTES_PAGE',
      planStatus: planStatus,
    }),
    REMOTE_PALETTES: new FeatureStatus({
      features: features,
      featureName: 'REMOTE_PALETTES',
      planStatus: planStatus,
    }),
    REMOTE_PALETTES_SELF: new FeatureStatus({
      features: features,
      featureName: 'REMOTE_PALETTES_SELF',
      planStatus: planStatus,
    }),
    REMOTE_PALETTES_COMMUNITY: new FeatureStatus({
      features: features,
      featureName: 'REMOTE_PALETTES_COMMUNITY',
      planStatus: planStatus,
    }),
    SOURCE: new FeatureStatus({
      features: features,
      featureName: 'SOURCE',
      planStatus: planStatus,
    }),
    SOURCE_EXPLORE: new FeatureStatus({
      features: features,
      featureName: 'SOURCE_EXPLORE',
      planStatus: planStatus,
    }),
    SCALE: new FeatureStatus({
      features: features,
      featureName: 'SCALE',
      planStatus: planStatus,
    }),
    COLORS: new FeatureStatus({
      features: features,
      featureName: 'COLORS',
      planStatus: planStatus,
    }),
    THEMES: new FeatureStatus({
      features: features,
      featureName: 'THEMES',
      planStatus: planStatus,
    }),
    EXPORT: new FeatureStatus({
      features: features,
      featureName: 'EXPORT',
      planStatus: planStatus,
    }),
    SETTINGS: new FeatureStatus({
      features: features,
      featureName: 'SETTINGS',
      planStatus: planStatus,
    }),
    SETTINGS_PALETTE: new FeatureStatus({
      features: features,
      featureName: 'SETTINGS_PALETTE',
      planStatus: planStatus,
    }),
    SETTINGS_PREFERENCES: new FeatureStatus({
      features: features,
      featureName: 'SETTINGS_PREFERENCES',
      planStatus: planStatus,
    }),
  }

  const contexts: Array<{
    label: string
    id: Context
    isUpdated: boolean
    isActive: boolean
  }> = [
    {
      label: locals.get().browse.contexts.local,
      id: 'LOCAL_PALETTES',
      isUpdated: featuresList.LOCAL_PALETTES.isNew(),
      isActive: featuresList.LOCAL_PALETTES.isActive(),
    },
    {
      label: locals.get().browse.contexts.page,
      id: 'LOCAL_PALETTES_PAGE',
      isUpdated: featuresList.LOCAL_PALETTES_PAGE.isNew(),
      isActive: featuresList.LOCAL_PALETTES_PAGE.isActive(),
    },
    {
      label: locals.get().browse.contexts.remote,
      id: 'REMOTE_PALETTES',
      isUpdated: featuresList.REMOTE_PALETTES.isNew(),
      isActive: featuresList.REMOTE_PALETTES.isActive(),
    },
    {
      label: locals.get().browse.contexts.self,
      id: 'REMOTE_PALETTES_SELF',
      isUpdated: featuresList.REMOTE_PALETTES_SELF.isNew(),
      isActive: featuresList.REMOTE_PALETTES_SELF.isActive(),
    },
    {
      label: locals.get().browse.contexts.community,
      id: 'REMOTE_PALETTES_COMMUNITY',
      isUpdated: featuresList.REMOTE_PALETTES_COMMUNITY.isNew(),
      isActive: featuresList.REMOTE_PALETTES_COMMUNITY.isActive(),
    },
    {
      label: locals.get().contexts.source,
      id: 'SOURCE',
      isUpdated: featuresList.SOURCE.isNew(),
      isActive: featuresList.SOURCE.isActive(),
    },
    {
      label: locals.get().source.contexts.overview,
      id: 'SOURCE_OVERVIEW',
      isUpdated: featuresList.SOURCE_EXPLORE.isNew(),
      isActive: featuresList.SOURCE_EXPLORE.isActive(),
    },
    {
      label: locals.get().source.contexts.explore,
      id: 'SOURCE_EXPLORE',
      isUpdated: featuresList.SOURCE_EXPLORE.isNew(),
      isActive: featuresList.SOURCE_EXPLORE.isActive(),
    },
    {
      label: locals.get().contexts.scale,
      id: 'SCALE',
      isUpdated: featuresList.SCALE.isNew(),
      isActive: featuresList.SCALE.isActive(),
    },
    {
      label: locals.get().contexts.colors,
      id: 'COLORS',
      isUpdated: featuresList.COLORS.isNew(),
      isActive: featuresList.COLORS.isActive(),
    },
    {
      label: locals.get().contexts.themes,
      id: 'THEMES',
      isUpdated: featuresList.THEMES.isNew(),
      isActive: featuresList.THEMES.isActive(),
    },
    {
      label: locals.get().contexts.export,
      id: 'EXPORT',
      isUpdated: featuresList.EXPORT.isNew(),
      isActive: featuresList.EXPORT.isActive(),
    },
    {
      label: locals.get().contexts.settings,
      id: 'SETTINGS',
      isUpdated: featuresList.SETTINGS.isNew(),
      isActive: featuresList.SETTINGS.isActive(),
    },
    {
      label: locals.get().settings.contexts.palette,
      id: 'SETTINGS_PALETTE',
      isUpdated: featuresList.SETTINGS_PALETTE.isNew(),
      isActive: featuresList.SETTINGS_PALETTE.isActive(),
    },
    {
      label: locals.get().settings.contexts.preferences,
      id: 'SETTINGS_PREFERENCES',
      isUpdated: featuresList.SETTINGS_PREFERENCES.isNew(),
      isActive: featuresList.SETTINGS_PREFERENCES.isActive(),
    },
  ]

  return contexts.filter((context) => {
    return contextList.includes(context.id) && context.isActive
  })
}
