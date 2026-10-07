import type { IconList } from '@unoff/ui'
import { CreatorConfiguration } from '@yelbolt/engine-ui-color-palette'
import { BaseProps } from '../types/app'

interface PublicationContext {
  userSession: BaseProps['userSession']
  creatorIdentity: CreatorConfiguration
  t: (key: string) => string
}

export const getPublicationLabel = ({
  userSession,
  creatorIdentity,
  t,
}: PublicationContext): string => {
  if (userSession?.connectionStatus === 'UNCONNECTED')
    return t('actions.publishOrSyncPalette')
  else if (userSession?.userId === creatorIdentity?.creatorId)
    return t('actions.publishPalette')
  else if (
    userSession?.userId !== creatorIdentity?.creatorId &&
    creatorIdentity?.creatorId !== ''
  )
    return t('actions.syncPalette')
  else return t('actions.publishPalette')
}

export const getPublicationIcon = ({
  userSession,
  creatorIdentity,
}: Omit<PublicationContext, 't'>): IconList => {
  if (userSession?.connectionStatus === 'UNCONNECTED') return 'library'
  else if (userSession?.userId === creatorIdentity?.creatorId) return 'library'
  else if (
    userSession?.userId !== creatorIdentity?.creatorId &&
    creatorIdentity?.creatorId !== ''
  )
    return 'swap'
  else return 'library'
}
