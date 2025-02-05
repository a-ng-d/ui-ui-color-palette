'use client'

import { Auth } from '@supabase/auth-ui-react'
import { ThemeSupa } from '@supabase/auth-ui-shared'
import { createClient, Session } from '@supabase/supabase-js'
import { useEffect, useState } from 'react'
import { colors, IsbTheme } from './Themes'

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
        ).catch((error) => console.log(error))
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
                ? colors.color.ISB['6'].value
                : colors.color.ISB['source'].value
            }
          >
            <path d="M50 94C48.8954 94 48 94.8954 48 96C48 97.1046 48.8954 98 50 98H56.2676C56.0974 98.2942 56 98.6357 56 99C56 100.105 56.8954 101 58 101L70 101C71.1046 101 72 100.105 72 99C72 98.6357 71.9026 98.2942 71.7324 98H78C79.1046 98 80 97.1046 80 96C80 94.8954 79.1046 94 78 94H50Z" />
            <path d="M49 67C49 65.3431 50.3431 64 52 64C53.6569 64 55 65.3431 55 67V70H52C50.3431 70 49 68.6569 49 67Z" />
            <path d="M76 64C74.3431 64 73 65.3431 73 67V70H76C77.6569 70 79 68.6569 79 67C79 65.3431 77.6569 64 76 64Z" />
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M40 42C40 38.6863 42.6863 36 46 36H82C85.3137 36 88 38.6863 88 42V86C88 89.3137 85.3137 92 82 92H46C42.6863 92 40 89.3137 40 86V42ZM57 70V67C57 64.2386 54.7614 62 52 62C49.2386 62 47 64.2386 47 67C47 69.7614 49.2386 72 52 72H55V87H57V72H71V87H73V72H76C78.7614 72 81 69.7614 81 67C81 64.2386 78.7614 62 76 62C73.2386 62 71 64.2386 71 67V70H57Z"
            />
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M40 8C24.536 8 12 20.536 12 36V92C12 107.464 24.536 120 40 120H88C103.464 120 116 107.464 116 92V36C116 20.536 103.464 8 88 8H40ZM25.2841 22.4558C28.939 18.4867 34.1791 16 40 16H88C93.8209 16 99.061 18.4867 102.716 22.4558L89.6328 35.5389C90.5312 36.5991 91.2126 37.849 91.6086 39.22L105.14 25.6883C106.956 28.6993 108 32.2277 108 36V92C108 95.7723 106.956 99.3007 105.14 102.312L91.6089 88.7806C91.2131 90.1517 90.5318 91.4017 89.6335 92.462L102.716 105.544C99.0609 109.513 93.8209 112 88 112H40C34.1791 112 28.9391 109.513 25.2842 105.544L38.3665 92.462C37.4682 91.4016 36.7869 90.1516 36.3911 88.7805L22.8598 102.312C21.0444 99.3008 20 95.7723 20 92V36C20 32.2277 21.0444 28.6994 22.8597 25.6883L36.3915 39.22C36.7874 37.849 37.4688 36.5991 38.3672 35.5389L25.2841 22.4558Z"
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
                    ? colors.color.ISB['6'].value
                    : colors.color.ISB['source'].value,
              }}
            >
              Start exploring activities!
            </h1>
            <h2
              style={{
                ...subtitleStyle,
                color:
                  theme === 'default'
                    ? colors.color.ISB['6'].value
                    : colors.color.ISB['source'].value,
              }}
            >
              Sign in to Ideas Spark Booth
            </h2>
          </div>
        </div>
        <div
          style={{
            ...cardStyle,
            backgroundColor:
              theme === 'default'
                ? colors.color.ISB['2'].value
                : colors.color.ISB['5'].value,
            border: `2px solid ${
              theme === 'default'
                ? colors.color.ISB['3'].value
                : colors.color.ISB['4'].value
            }`,
          }}
        >
          <Auth
            supabaseClient={supabase}
            appearance={{
              theme: ThemeSupa,
              variables: IsbTheme,
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
                ? colors.color.ISB['6'].value
                : colors.color.ISB['source'].value,
          }}
        >
          By continuing, you agree with our{' '}
          <a
            href="https://isb.ylb.lt/terms"
            style={{
              ...linkStyle,
              color:
                theme === 'default'
                  ? colors.color.ISB['5'].value
                  : colors.color.ISB['4'].value,
            }}
          >
            Terms and Conditions
          </a>{' '}
          and our{' '}
          <a
            href="https://isb.ylb.lt/privacy"
            style={{
              ...linkStyle,
              color:
                theme === 'default'
                  ? colors.color.ISB['5'].value
                  : colors.color.ISB['4'].value,
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
                ? colors.color.ISB['6'].value
                : colors.color.ISB['source'].value
            }
          >
            <path d="M50 94C48.8954 94 48 94.8954 48 96C48 97.1046 48.8954 98 50 98H56.2676C56.0974 98.2942 56 98.6357 56 99C56 100.105 56.8954 101 58 101L70 101C71.1046 101 72 100.105 72 99C72 98.6357 71.9026 98.2942 71.7324 98H78C79.1046 98 80 97.1046 80 96C80 94.8954 79.1046 94 78 94H50Z" />
            <path d="M49 67C49 65.3431 50.3431 64 52 64C53.6569 64 55 65.3431 55 67V70H52C50.3431 70 49 68.6569 49 67Z" />
            <path d="M76 64C74.3431 64 73 65.3431 73 67V70H76C77.6569 70 79 68.6569 79 67C79 65.3431 77.6569 64 76 64Z" />
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M40 42C40 38.6863 42.6863 36 46 36H82C85.3137 36 88 38.6863 88 42V86C88 89.3137 85.3137 92 82 92H46C42.6863 92 40 89.3137 40 86V42ZM57 70V67C57 64.2386 54.7614 62 52 62C49.2386 62 47 64.2386 47 67C47 69.7614 49.2386 72 52 72H55V87H57V72H71V87H73V72H76C78.7614 72 81 69.7614 81 67C81 64.2386 78.7614 62 76 62C73.2386 62 71 64.2386 71 67V70H57Z"
            />
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M40 8C24.536 8 12 20.536 12 36V92C12 107.464 24.536 120 40 120H88C103.464 120 116 107.464 116 92V36C116 20.536 103.464 8 88 8H40ZM25.2841 22.4558C28.939 18.4867 34.1791 16 40 16H88C93.8209 16 99.061 18.4867 102.716 22.4558L89.6328 35.5389C90.5312 36.5991 91.2126 37.849 91.6086 39.22L105.14 25.6883C106.956 28.6993 108 32.2277 108 36V92C108 95.7723 106.956 99.3007 105.14 102.312L91.6089 88.7806C91.2131 90.1517 90.5318 91.4017 89.6335 92.462L102.716 105.544C99.0609 109.513 93.8209 112 88 112H40C34.1791 112 28.9391 109.513 25.2842 105.544L38.3665 92.462C37.4682 91.4016 36.7869 90.1516 36.3911 88.7805L22.8598 102.312C21.0444 99.3008 20 95.7723 20 92V36C20 32.2277 21.0444 28.6994 22.8597 25.6883L36.3915 39.22C36.7874 37.849 37.4688 36.5991 38.3672 35.5389L25.2841 22.4558Z"
            />
          </svg>
        </div>
        <div
          style={{
            ...cardStyle,
            backgroundColor:
              theme === 'default'
                ? colors.color.ISB['2'].value
                : colors.color.ISB['5'].value,
            border: `2px solid ${
              theme === 'default'
                ? colors.color.ISB['3'].value
                : colors.color.ISB['4'].value
            }`,
          }}
        >
          <h1
            style={{
              ...titleStyle,
              color:
                theme === 'default'
                  ? colors.color.ISB['6'].value
                  : colors.color.ISB['source'].value,
            }}
          >
            You are authenticated on Ideas Spark Booth!
          </h1>
          <h2
            style={{
              ...subtitleStyle,
              color:
                theme === 'default'
                  ? colors.color.ISB['6'].value
                  : colors.color.ISB['source'].value,
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
            ? colors.color.ISB['1'].value
            : colors.color.ISB['6'].value,
        padding: '16px',
        boxSizing: 'border-box',
      }}
    >
      {view}
    </div>
  )
}
