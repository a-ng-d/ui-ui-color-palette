import { FeatureStatus } from '@unoff/utils'
import { Editor, PlanStatus, Service } from '../types/app'
import { ConfigContextType } from '../config/ConfigContext'

export type PricingPlanId = 'WEEK' | 'MONTH' | 'YEAR' | 'LIFETIME'

export interface PricingPlan {
  id: PricingPlanId
  productId: string
}

export const getPricingPlans = (
  planStatus: PlanStatus,
  config: ConfigContextType,
  service: Service,
  editor: Editor
): Array<PricingPlan> =>
  (
    [
      ['WEEK', 'PRICING_PRO_WEEK', config.plan.storeProWeekId],
      ['MONTH', 'PRICING_PRO_MONTH', config.plan.storeProMonthId],
      ['YEAR', 'PRICING_PRO_YEAR', config.plan.storeProYearId],
      ['LIFETIME', 'PRICING_PRO_LIFETIME', config.plan.storeProLifetimeId],
    ] as const
  )
    .filter(([, featureName]) =>
      new FeatureStatus({
        features: config.features,
        featureName,
        planStatus,
        currentService: service,
        currentEditor: editor,
      }).isActive()
    )
    .map(([id, , productId]) => ({ id, productId }))
