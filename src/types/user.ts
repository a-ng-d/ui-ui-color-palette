export type ConnectionStatus = 'CONNECTED' | 'UNCONNECTED'

export interface UserSession {
  connectionStatus: ConnectionStatus
  userId: string
  userFullName: string
  userAvatar: string
}

export interface Identity {
  connectionStatus: ConnectionStatus
  userId: string | undefined
  creatorId: string
}
