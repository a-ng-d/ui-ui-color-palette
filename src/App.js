import './index.css'
import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'
import { Auth } from '@supabase/auth-ui-react'
import { ThemeSupa } from '@supabase/auth-ui-shared'
import { tokens, uicpTheme } from './Themes'
import { ReactComponent as Logo } from './logo.svg'

const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL,
  process.env.REACT_APP_SUPABASE_ANON_KEY
)

const logoStyle = {
  width: '64px',
  height: '64px',
  marginBottom: '16px',
  margin: '0',
}

const titleStyle = {
  fontSize: '32px',
  fontWeight: '700',
  fontFamily: '"Red Hat Mono", monospace',
  margin: '0',
  lineHeight: '1.1',
}

const subtitleStyle = {
  fontSize: '16px',
  fontWeight: '600',
  fontFamily: '"Lexend", sans-serif',
  margin: '0',
  lineHeight: '1.5',
}

const paragraphStyle = {
  fontSize: '16px',
  fontWeight: '500',
  fontFamily: '"Lexend", sans-serif',
  margin: '0',
  lineHeight: '1.5',
}

const linkStyle = {
  textDecoration: 'underline',
}

const cardStyle = {
  padding: '16px',
  borderRadius: '8px',
  width: '100%',
  boxSizing: 'border-box',
  display: 'flex',
  flexDirection: 'column',
  gap: '8px',
}

const stackbarStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '16px',
}

const mainStyle = {
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'flex-start',
  maxWidth: '400px',
  width: '100%',
  gap: '32px',
}

export default function App() {
  let view = null
  const [session, setSession] = useState(null)
  const passkey =
    new URLSearchParams(window.location.search).get('passkey') ?? null
  const action =
    new URLSearchParams(window.location.search).get('action') ?? null

  if (passkey != null) localStorage.setItem('passkey', passkey)

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      //console.log(session)

      if (session && action === 'sign_out') {
        const { error } = await supabase.auth.signOut({
          scope: 'local',
        })
        if (!error) return setSession(null)
      }

      if (session && localStorage.getItem('passkey') !== null) {
        fetch(
          process.env.NODE_ENV === 'development'
            ? 'https://localhost:8787'
            : process.env.REACT_APP_WORKER_URL,
          {
            method: 'POST',
            headers: {
              type: 'SEND_TOKENS',
              passkey: localStorage.getItem('passkey'),
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
  }, [action])

  const [theme] = useState(
    window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'default'
  )

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
          <Logo
            style={{
              ...logoStyle,
              fill:
                theme === 'default'
                  ? tokens.theme.colors.primary.light['900']
                  : tokens.theme.colors.primary.dark['source'],
            }}
          />
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
                    ? tokens.theme.colors.primary.light['900']
                    : tokens.theme.colors.primary.dark['source'],
              }}
            >
              Start exploring palettes
            </h1>
            <h2
              style={{
                ...subtitleStyle,
                color:
                  theme === 'default'
                    ? tokens.theme.colors.primary.light['900']
                    : tokens.theme.colors.primary.dark['source'],
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
                ? tokens.theme.colors.primary.light['50']
                : tokens.theme.colors.primary.dark['900'],
            border: `2px solid ${
              theme === 'default'
                ? tokens.theme.colors.primary.light['900']
                : tokens.theme.colors.primary.dark['source']
            }`,
          }}
        >
          <Auth
            supabaseClient={supabase}
            appearance={{
              theme: ThemeSupa,
              variables: uicpTheme,
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
                ? tokens.theme.colors.primary.light['900']
                : tokens.theme.colors.primary.dark['source'],
          }}
        >
          By continuing, you agree with our{' '}
          <a
            href="https://uicp.link/terms"
            style={{
              ...linkStyle,
              color:
                theme === 'default'
                  ? tokens.theme.colors.primary.light['300']
                  : tokens.theme.colors.primary.dark['400'],
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
                  ? tokens.theme.colors.primary.light['300']
                  : tokens.theme.colors.primary.dark['400'],
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
          <Logo
            style={{
              ...logoStyle,
              fill:
                theme === 'default'
                  ? tokens.theme.colors.primary.light['900']
                  : tokens.theme.colors.primary.dark['source'],
            }}
          />
        </div>
        <div
          style={{
            ...cardStyle,
            backgroundColor:
              theme === 'default'
                ? tokens.theme.colors.primary.light['50']
                : tokens.theme.colors.primary.dark['900'],
            border: `2px solid ${
              theme === 'default'
                ? tokens.theme.colors.primary.light['900']
                : tokens.theme.colors.primary.dark['source']
            }`,
          }}
        >
          <h1
            style={{
              ...titleStyle,
              color:
                theme === 'default'
                  ? tokens.theme.colors.primary.light['900']
                  : tokens.theme.colors.primary.dark['source'],
            }}
          >
            You are authenticated!
          </h1>
          <h2
            style={{
              ...subtitleStyle,
              color:
                theme === 'default'
                  ? tokens.theme.colors.primary.light['900']
                  : tokens.theme.colors.primary.dark['source'],
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
            ? tokens.theme.colors.primary.light['50']
            : tokens.theme.colors.primary.dark['900'],
        padding: '16px',
        boxSizing: 'border-box',
      }}
    >
      {view}
    </div>
  )
}
