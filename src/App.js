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

export default function App() {
  let view = null
  const [session, setSession] = useState(null)
  const passkey =  new URLSearchParams(
    window.location.search
  ).get('passkey') ?? null

  const action =  new URLSearchParams(
    window.location.search
  ).get('action') ?? null

  if (passkey != null) localStorage.setItem('passkey', passkey)

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      console.log(session)

      if (session && action === 'sign_out') {
        const { error } = supabase.auth.signOut({
          scope: 'local'
        })
        if (!error) setSession(null)
      }
      
      if (session && localStorage.getItem('passkey') !== null) {
        fetch(
          process.env.REACT_APP_WORKER_URL,
          {
            headers: {
              'type': 'SEND_TOKENS',
              'passkey': localStorage.getItem('passkey'),
              'tokens': JSON.stringify(session)
            }
          }
        )
        .catch((error) => console.log(error))
      }

      setSession(session)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => subscription.unsubscribe()
  }, [action])

  const [theme] = useState(
    window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'default'
  )

  if (!session) {
    view = (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-start',
          maxWidth: '400px',
          width: '100%',
          gap: '32px',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
          }}
        >
          <Logo
            style={{
              width: '64px',
              height: '64px',
              marginBottom: '16px',
              fill: theme === 'default'
                ? tokens.theme.colors.primary.light['900']
                : tokens.theme.colors.primary.dark['source'],
              margin: '0'
            }}
          />
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
            }}
          >
            <h1
              style={{
                color: theme === 'default'
                  ? tokens.theme.colors.primary.light['900']
                  : tokens.theme.colors.primary.dark['source'],
                fontSize: '32px',
                fontWeight: '700',
                fontFamily: '"Red Hat Mono", monospace',
                margin: '0',
                lineHeight: '1.1',
              }}
            >
              Start exploring palettes
            </h1>
            <p
              style={{
                color: theme === 'default'
                  ? tokens.theme.colors.primary.light['900']
                  : tokens.theme.colors.primary.dark['source'],
                fontSize: '16px',
                fontWeight: '600',
                fontFamily: '"Lexend", sans-serif',
                margin: '0',
                lineHeight: '1.5',
              }}
            >
              Sign in to UI Color Palette
            </p>
          </div>
        </div>
        <div
          style={{
            padding: '16px',
            backgroundColor: theme === 'default'
              ? tokens.theme.colors.primary.light['50']
              : tokens.theme.colors.primary.dark['900'],
            borderRadius: '8px',
            border: `2px solid ${theme === 'default'
              ? tokens.theme.colors.primary.light['900']
              : tokens.theme.colors.primary.dark['source']}`,
            width: '100%',
            boxSizing: 'border-box',
          }}
        >
          <Auth
            supabaseClient={supabase}
            appearance={{
              theme: ThemeSupa,
              variables: uicpTheme,
            }}
            theme={theme}
            providers={['figma']}
          />
        </div>
      </div>
    )
  }
  else {
    view = (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-start',
          maxWidth: '400px',
          width: '100%',
        }}
      >
        <div
          style={{
            padding: '16px',
            backgroundColor: theme === 'default'
              ? tokens.theme.colors.primary.light['50']
              : tokens.theme.colors.primary.dark['900'],
            borderRadius: '8px',
            border: `2px solid ${theme === 'default'
              ? tokens.theme.colors.primary.light['900']
              : tokens.theme.colors.primary.dark['source']}`,
            width: '100%',
            boxSizing: 'border-box',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
          }}
        >
          <h1
            style={{
              color: theme === 'default'
                ? tokens.theme.colors.primary.light['900']
                : tokens.theme.colors.primary.dark['source'],
              fontSize: '32px',
              fontWeight: '700',
              fontFamily: '"Red Hat Mono", monospace',
              margin: '0',
              lineHeight: '1.1',
            }}
          >
            You are authenticated!
          </h1>
          <h2
            style={{
              color: theme === 'default'
                ? tokens.theme.colors.primary.light['900']
                : tokens.theme.colors.primary.dark['source'],
              fontSize: '16px',
              fontWeight: '500',
              fontFamily: '"Lexend", monospace',
              margin: '0',
              lineHeight: '1.5',
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
        backgroundColor: theme === 'default'
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