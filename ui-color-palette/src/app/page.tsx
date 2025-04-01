'use client'

import { Auth } from '@supabase/auth-ui-react'
import { ThemeSupa } from '@supabase/auth-ui-shared'
import { createClient, Session } from '@supabase/supabase-js'
import { useEffect, useState } from 'react'
import { colors, UicpTheme } from './Themes'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
)

const titleStyle = {
  fontSize: '32px',
  fontWeight: '700',
  fontFamily: 'var(--font-martian-mono)',
  margin: '0',
  lineHeight: '1.1',
} as React.CSSProperties

const subtitleStyle = {
  fontSize: '16px',
  fontWeight: '600',
  fontFamily: 'var(--font-sora)',
  margin: '0',
  lineHeight: '1.5',
} as React.CSSProperties

const paragraphStyle = {
  fontSize: '16px',
  fontWeight: '500',
  fontFamily: 'var(--font-sora)',
  margin: '0',
  lineHeight: '1.5',
} as React.CSSProperties

const linkStyle = {
  textDecoration: 'underline',
} as React.CSSProperties

const cardStyle = {
  padding: '16px',
  borderRadius: '8px',
  width: '100%',
  boxSizing: 'border-box',
  display: 'flex',
  flexDirection: 'column',
  gap: '8px',
} as React.CSSProperties

const stackbarStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '16px',
} as React.CSSProperties

const mainStyle = {
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'flex-start',
  maxWidth: '400px',
  width: '100%',
  gap: '32px',
} as React.CSSProperties

export default function App() {
  let view = null
  const [session, setSession] = useState<Session | null>(null)
  const [passkey, setPasskey] = useState<string | null>(null)
  const [action, setAction] = useState<string | null>(null)
  const [theme, setTheme] = useState<'default' | 'dark'>('dark')

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const passkey = urlParams.get('passkey') ?? null
    const action = urlParams.get('action') ?? null
    const theme = window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'default'

    if (passkey !== null) localStorage.setItem('passkey', passkey)

    setPasskey(passkey)
    setAction(action)
    setTheme(theme)
  }, [])

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      //console.log(session)
      const passkey = localStorage.getItem('passkey') || null

      if (session && action === 'sign_out') {
        const { error } = await supabase.auth.signOut({
          scope: 'local',
        })
        if (!error) return setSession(null)
      }

      if (session && passkey !== null) {
        fetch(
          process.env.NODE_ENV === 'development'
            ? 'http://localhost:8787'
            : process.env.NEXT_PUBLIC_WORKER_URL || '',
          {
            method: 'POST',
            headers: {
              type: 'SEND_TOKENS',
              passkey: passkey,
              tokens: JSON.stringify(session),
            },
          }
        )
          .then((res) => console.log(res))
          .catch((error) => console.log(error))
      }

      return setSession(session)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => subscription.unsubscribe()
  }, [action, passkey])

  if (!session) {
    view = (
      <div
        style={{
          ...mainStyle,
        }}
      >
        <div
          style={{
            ...stackbarStyle,
          }}
        >
          <svg
            width="64"
            height="64"
            viewBox="0 0 128 128"
            xmlns="http://www.w3.org/2000/svg"
            fill={
              theme === 'default'
                ? colors.color.UICP['6'].value
                : colors.color.UICP['source'].value
            }
          >
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M36.5714 8C22.9594 8 12 19.1451 12 32.8V95.2C12 108.855 22.9595 120 36.5714 120H91.4286C105.041 120 116 108.855 116 95.2V32.8C116 19.1451 105.041 8 91.4286 8H36.5714ZM20 32.8C20 23.4798 27.4608 16 36.5714 16H46V36C42.6863 36 40 38.6863 40 42V46H20V32.8ZM40 50H20V78H40V50ZM40 82H20V95.2C20 104.52 27.4608 112 36.5714 112H46V92C42.6863 92 40 89.3137 40 86V82ZM50 92V112H78V92H50ZM50 36H78V16H50V36ZM82 36C85.3137 36 88 38.6863 88 42V46H108V32.8C108 23.4798 100.539 16 91.4286 16H82V36ZM88 50V78H108V50H88ZM88 82V86C88 89.3137 85.3137 92 82 92V112H91.4286C100.539 112 108 104.52 108 95.2V82H88Z"
            />
          </svg>
          <div
            style={{
              ...stackbarStyle,
            }}
          >
            <h1
              style={{
                ...titleStyle,
                color:
                  theme === 'default'
                    ? colors.color.UICP['6'].value
                    : colors.color.UICP['source'].value,
              }}
            >
              Start exploring palettes!
            </h1>
            <h2
              style={{
                ...subtitleStyle,
                color:
                  theme === 'default'
                    ? colors.color.UICP['6'].value
                    : colors.color.UICP['source'].value,
              }}
            >
              Sign in to UI Color Palette
            </h2>
          </div>
        </div>
        <div
          style={{
            ...cardStyle,
            backgroundColor:
              theme === 'default'
                ? colors.color.UICP['2'].value
                : colors.color.UICP['5'].value,
            border: `2px solid ${
              theme === 'default'
                ? colors.color.UICP['3'].value
                : colors.color.UICP['4'].value
            }`,
          }}
        >
          <Auth
            supabaseClient={supabase}
            appearance={{
              theme: ThemeSupa,
              variables: UicpTheme,
            }}
            localization={{
              variables: {
                sign_in: {
                  social_provider_text: 'Continue with {{provider}}',
                },
              },
            }}
            theme={theme}
            providers={['figma']}
            onlyThirdPartyProviders
          />
        </div>
        <p
          style={{
            ...paragraphStyle,
            color:
              theme === 'default'
                ? colors.color.UICP['6'].value
                : colors.color.UICP['source'].value,
          }}
        >
          By continuing, you agree with our{' '}
          <a
            href="https://uicp.link/terms"
            style={{
              ...linkStyle,
              color:
                theme === 'default'
                  ? colors.color.UICP['5'].value
                  : colors.color.UICP['4'].value,
            }}
          >
            Terms and Conditions
          </a>{' '}
          and our{' '}
          <a
            href="https://uicp.link/privacy"
            style={{
              ...linkStyle,
              color:
                theme === 'default'
                  ? colors.color.UICP['5'].value
                  : colors.color.UICP['4'].value,
            }}
          >
            Privacy Policy
          </a>
          .
        </p>
      </div>
    )
  } else {
    view = (
      <div
        style={{
          ...mainStyle,
        }}
      >
        <div
          style={{
            ...stackbarStyle,
          }}
        >
          <svg
            width="64"
            height="64"
            viewBox="0 0 128 128"
            xmlns="http://www.w3.org/2000/svg"
            fill={
              theme === 'default'
                ? colors.color.UICP['6'].value
                : colors.color.UICP['source'].value
            }
          >
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M36.5714 8C22.9594 8 12 19.1451 12 32.8V95.2C12 108.855 22.9595 120 36.5714 120H91.4286C105.041 120 116 108.855 116 95.2V32.8C116 19.1451 105.041 8 91.4286 8H36.5714ZM20 32.8C20 23.4798 27.4608 16 36.5714 16H46V36C42.6863 36 40 38.6863 40 42V46H20V32.8ZM40 50H20V78H40V50ZM40 82H20V95.2C20 104.52 27.4608 112 36.5714 112H46V92C42.6863 92 40 89.3137 40 86V82ZM50 92V112H78V92H50ZM50 36H78V16H50V36ZM82 36C85.3137 36 88 38.6863 88 42V46H108V32.8C108 23.4798 100.539 16 91.4286 16H82V36ZM88 50V78H108V50H88ZM88 82V86C88 89.3137 85.3137 92 82 92V112H91.4286C100.539 112 108 104.52 108 95.2V82H88Z"
            />
          </svg>
        </div>
        <div
          style={{
            ...cardStyle,
            backgroundColor:
              theme === 'default'
                ? colors.color.UICP['2'].value
                : colors.color.UICP['5'].value,
            border: `2px solid ${
              theme === 'default'
                ? colors.color.UICP['3'].value
                : colors.color.UICP['4'].value
            }`,
          }}
        >
          <h1
            style={{
              ...titleStyle,
              color:
                theme === 'default'
                  ? colors.color.UICP['6'].value
                  : colors.color.UICP['source'].value,
            }}
          >
            You are authenticated on UI Color Palette!
          </h1>
          <h2
            style={{
              ...subtitleStyle,
              color:
                theme === 'default'
                  ? colors.color.UICP['6'].value
                  : colors.color.UICP['source'].value,
            }}
          >
            You can close the tab.
          </h2>
        </div>
      </div>
    )
  }

  return (
    <div
      style={{
        width: '100vw',
        height: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor:
          theme === 'default'
            ? colors.color.UICP['1'].value
            : colors.color.UICP['6'].value,
        padding: '16px',
        boxSizing: 'border-box',
      }}
    >
      {view}
    </div>
  )
}
