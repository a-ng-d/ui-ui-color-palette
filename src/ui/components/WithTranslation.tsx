import React, { ComponentType } from 'react'
import { useTranslate } from '@tolgee/react'

export interface WithTranslationProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  t: (key: string, params?: Record<string, any>) => string
}

export const WithTranslation = <P extends WithTranslationProps>(
  WrappedComponent: ComponentType<P>
): ComponentType<Omit<P, keyof WithTranslationProps>> => {
  const WithTranslationComponent = (
    props: Omit<P, keyof WithTranslationProps>
  ) => {
    const { t } = useTranslate()
    return (
      <WrappedComponent
        {...(props as P)}
        t={t}
      />
    )
  }

  return WithTranslationComponent
}
