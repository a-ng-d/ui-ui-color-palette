import { ComponentType, forwardRef, useContext } from 'preact/compat'
import { ConfigContext, ConfigContextType } from '../../config/ConfigContext'

export interface WithConfigProps {
  config: ConfigContextType
}

export const WithConfig = <P extends WithConfigProps>(
  WrappedComponent: ComponentType<P>
) => {
  return forwardRef<unknown, Omit<P, keyof WithConfigProps>>((props, ref) => {
    const config = useContext(ConfigContext)
    if (!config) throw new Error('Config context is undefined')
    return (
      <WrappedComponent
        {...(props as P)}
        config={config}
        ref={ref}
      />
    )
  })
}
