import { getSupabase } from './client'
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
        else reject()
      })
      .then((result) => {
        parent.postMessage(
          {
            pluginMessage: {
              type: 'OPEN_IN_BROWSER',
              data: {
                url: `${authUrl}/?passkey=${result.passkey}`,
              },
            },
          },
          '*'
        )
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
              else reject(new Error('Failed to fetch tokens'))
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
              reject(new Error('Authentication timeout'))
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
  const supabase = getSupabase()
  if (!supabase) throw new Error('Supabase client is not initialized')

  const { error } = await supabase.auth.signOut({
    scope: 'local',
  })

  console.log(error)

  if (!error) {
    parent.postMessage(
      {
        pluginMessage: {
          type: 'OPEN_IN_BROWSER',
          data: {
            url: `${authUrl}/?action=sign_out`,
          },
        },
      },
      '*'
    )
    parent.postMessage(
      {
        pluginMessage: {
          type: 'DELETE_ITEMS',
          items: ['supabase_access_token', 'supabase_refresh_token'],
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
    isAuthenticated = false

    return true
  } else throw new Error()
}
