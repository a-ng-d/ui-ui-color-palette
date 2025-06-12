import { supabase } from '../../index'
import checkConnectionStatus from './checkConnectionStatus'

let isAuthenticated = false

export const signIn = async ({
  disinctId,
  authWorkerUrl,
  authUrl,
  platformUrl,
  pluginId,
}: {
  disinctId: string
  authWorkerUrl: string
  authUrl: string
  platformUrl: string
  pluginId: string
}) => {
  return new Promise((resolve, reject) => {
    fetch(authWorkerUrl, {
      method: 'GET',
      cache: 'no-cache',
      credentials: 'omit',
      headers: {
        type: 'GET_PASSKEY',
        'distinct-id': disinctId,
      },
    })
      .then((response) => {
        if (response.ok) return response.json()
        else throw new Error('Failed to fetch passkey')
      })
      .then((result) => {
        window.open(`${authUrl}/?passkey=${result.passkey}`, '_blank')?.focus()
        const poll = setInterval(async () => {
          fetch(authWorkerUrl, {
            method: 'GET',
            cache: 'no-cache',
            credentials: 'omit',
            headers: {
              type: 'GET_TOKENS',
              'distinct-id': disinctId,
              passkey: result.passkey,
            },
          })
            .then((response) => {
              if (response.body) return response.json()
              else throw new Error()
            })
            .then(async (result) => {
              if (result.message !== 'No token found') {
                isAuthenticated = true
                parent.postMessage(
                  {
                    pluginMessage: {
                      type: 'SET_ITEMS',
                      items: [
                        {
                          key: 'supabase_access_token',
                          value: result.tokens.access_token,
                        },
                        {
                          key: 'supabase_refresh_token',
                          value: result.tokens.refresh_token,
                        },
                      ],
                    },
                    pluginId: pluginId,
                  },
                  platformUrl
                )
                checkConnectionStatus(
                  result.tokens.access_token,
                  result.tokens.refresh_token
                )
                  .then(() => {
                    clearInterval(poll)
                    return resolve(result)
                  })
                  .catch((error) => {
                    clearInterval(poll)
                    return reject(error)
                  })
              }
            })
            .catch((error) => {
              clearInterval(poll)
              return reject(error)
            })
        }, 5000)
        setTimeout(
          () => {
            if (!isAuthenticated) {
              clearInterval(poll)
              throw new Error('Authentication timeout')
            }
          },
          2 * 60 * 1000
        )
      })
      .catch((error) => reject(error))
  })
}

export const signOut = async ({
  authUrl,
  platformUrl,
  pluginId,
}: {
  authUrl: string
  platformUrl: string
  pluginId: string
}) => {
  window.open(`${authUrl}/?action=sign_out`, '_blank')?.focus()
  parent.postMessage(
    {
      pluginMessage: {
        type: 'DELETE_ITEMS',
        items: ['supabase_access_token'],
      },
      pluginId: pluginId,
    },
    platformUrl
  )
  parent.postMessage(
    {
      pluginMessage: {
        type: 'SIGN_OUT',
      },
    },
    '*'
  )

  await supabase.auth.signOut({
    scope: 'local',
  })
}
