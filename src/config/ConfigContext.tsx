import React, { createContext, ReactNode, useContext } from 'react'
import { Config } from '../types/config'

export type ConfigContextType = Config

export const ConfigContext = createContext<ConfigContextType | undefined>(
  undefined
)

interface ConfigProviderProps extends ConfigContextType {
  children: ReactNode
}

export const ConfigProvider = ({
  children,
  limits,
  env,
  plan,
  dbs,
  urls,
  versions,
  features,
  locales,
  lang,
  fees,
}: ConfigProviderProps) => {
  return (
    <ConfigContext.Provider
      value={{
        limits,
        env,
        plan,
        dbs,
        urls,
        versions,
        features,
        locales,
        lang,
        fees,
      }}
    >
      {children}
    </ConfigContext.Provider>
  )
}

export const useConfig = () => {
  const context = useContext(ConfigContext)
  if (!context)
    throw new Error('useConfig must be used within a ConfigProvider')
  return context
}
