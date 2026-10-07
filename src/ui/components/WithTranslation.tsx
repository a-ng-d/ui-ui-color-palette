import { ComponentType, forwardRef } from 'preact/compat'
import { useTranslate } from '@tolgee/react'

export interface WithTranslationProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  t: (key: string, params?: Record<string, any>) => string
}

export const WithTranslation = <P extends WithTranslationProps>(
  WrappedComponent: ComponentType<P>
) => {
  return forwardRef<unknown, Omit<P, keyof WithTranslationProps>>(
    (props, ref) => {
      const { t } = useTranslate()
      return (
        <WrappedComponent
          {...(props as P)}
          t={t}
          ref={ref}
        />
      )
    }
  )
}
