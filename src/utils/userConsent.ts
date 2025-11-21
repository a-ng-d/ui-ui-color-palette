import { ConsentConfiguration } from '@a_ng_d/figmug-ui'

export const getUserConsent = (
  t: (key: string) => string
): Array<ConsentConfiguration> => [
  {
    name: t('vendors.mixpanel.name'),
    id: 'mixpanel',
    icon: 'https://asset.brandfetch.io/idr_rhI2FS/ideb-tnj2D.svg',
    description: t('vendors.mixpanel.description'),
    isConsented: false,
  },
]
