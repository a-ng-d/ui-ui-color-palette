import CryptoJS from 'crypto-js'
import { ExportedHandler, KVNamespace } from '@cloudflare/workers-types'

export interface Env {
  YELBOLT_AUTH_KV: KVNamespace
}

export interface Env {
  YELBOLT_AUTH_KV: KVNamespace
}

export default {
  async fetch(request, env, ctx): Promise<Response> {
    const type = request.headers.get('type')

    // Handle CORS preflight requests
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, distinct-id, passkey, tokens, baggage, type, sentry-trace',
        },
      })
    }

    const actions = {
      GET_PASSKEY: async () => {
        const key = CryptoJS.lib.WordArray.random(32).toString(CryptoJS.enc.Hex),
          distinctId = request.headers.get('distinct-id')

        try {
          await env.YELBOLT_AUTH_KV.put(`PASSKEY_${distinctId}`, key)
          const value = await env.YELBOLT_AUTH_KV.get(`PASSKEY_${distinctId}`)

          if (value === null) {
            return new Response(
              JSON.stringify({
                message: 'Passkey not found',
              }) as BodyInit,
              {
                status: 404,
                headers: {
                  'Access-Control-Allow-Origin': '*',
                },
              }
            )
          }
          return new Response(
            JSON.stringify({
              passkey: value,
              message: 'Passkey generated',
            }) as BodyInit,
            {
              status: 200,
              headers: {
                'Access-Control-Allow-Origin': '*',
              },
            }
          )
        } catch (err) {
          console.error(`KV returned error: ${err}`)
          return new Response(
            JSON.stringify({
              message: err,
            }) as BodyInit,
            {
              status: 500,
              headers: {
                'Access-Control-Allow-Origin': '*',
              },
            }
          )
        }
      },
      SEND_TOKENS: async () => {
        const tokens = request.headers.get('tokens') ?? '',
          passkey = request.headers.get('passkey')

        try {
          await env.YELBOLT_AUTH_KV.put(`TOKENS_${passkey}`, tokens)
          const value = await env.YELBOLT_AUTH_KV.get(`TOKENS_${passkey}`)

          if (value === null) {
            return new Response(
              JSON.stringify({
                message: 'No token written',
              }) as BodyInit,
              {
                status: 404,
                headers: {
                  'Access-Control-Allow-Origin': '*',
                },
              }
            )
          }
          return new Response(
            JSON.stringify({
              message: 'Tokens written',
            }) as BodyInit,
            {
              status: 200,
              headers: {
                'Access-Control-Allow-Origin': '*',
              },
            }
          )
        } catch (err) {
          console.error(`KV returned error: ${err}`)
          return new Response(
            JSON.stringify({
              message: err,
            }) as BodyInit,
            {
              status: 500,
              headers: {
                'Access-Control-Allow-Origin': '*',
              },
            }
          )
        }
      },
      GET_TOKENS: async () => {
        const distinctId = request.headers.get('distinct-id') ?? '',
          passkey = request.headers.get('passkey')

        try {
          const value = await env.YELBOLT_AUTH_KV.get(`TOKENS_${passkey}`)

          if (value === null) {
            return new Response(
              JSON.stringify({
                message: 'No token found',
              }) as BodyInit,
              {
                status: 200,
                headers: {
                  'Access-Control-Allow-Origin': '*',
                },
              }
            )
          } else {
            const json = JSON.parse(value)

            await env.YELBOLT_AUTH_KV.delete(`TOKENS_${passkey}`)
            await env.YELBOLT_AUTH_KV.delete(`PASSKEY_${distinctId}`)
            
            return new Response(
              JSON.stringify({
                tokens: json,
                message: 'Tokens found',
              }) as BodyInit,
              {
                status: 200,
                headers: {
                  'Access-Control-Allow-Origin': '*',
                },
              }
            )
          }
        } catch (err) {
          console.error(`KV returned error: ${err}`)
          return new Response(
            JSON.stringify({
              message: err,
            }) as BodyInit,
            {
              status: 500,
              headers: {
                'Access-Control-Allow-Origin': '*',
              },
            }
          )
        }
      },
    }

    if (type && actions[type]) {
      return actions[type]()
    }

    return new Response('Invalid action type', {
      status: 400,
    })
  },
}
