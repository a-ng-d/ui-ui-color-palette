export type ConnectionStatus = 'CONNECTED' | 'UNCONNECTED'

export interface UserSession {
  connectionStatus: ConnectionStatus
  userId: string
  userFullName: string
  userAvatar: string
  accessToken: string | undefined
  refreshToken: string | undefined
}

export interface Identity {
  connectionStatus: ConnectionStatus
  userId: string | undefined
  creatorId: string
}
