import { Client, APIErrorCode } from '@notionhq/client'

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url)

    if (url.searchParams.get('action') === 'get_version') {
      try {
        const notion = new Client({
          auth: env.NOTION_API_KEY,
        })

        const announcementsInfo = await notion.databases.retrieve({
          database_id: url.searchParams.get('database_id') ?? 'e078993c1ac74bdb8d2806174927ddcb',
        })

        return new Response(
          JSON.stringify({
            version: announcementsInfo.description[0].plain_text as string,
          }) as BodyInit,
          {
            status: 200,
            headers: {
              'Access-Control-Allow-Origin': '*',
            },
          }
        )
      } catch (error) {
        if (error.code === APIErrorCode.ObjectNotFound) {
          return new Response(
            JSON.stringify({
              message: 'The database is not found',
            }) as BodyInit,
            {
              status: 404,
              headers: {
                'Access-Control-Allow-Origin': '*',
              },
            }
          )
        } else {
          console.error(error)
          return new Response(
            JSON.stringify({
              message: 'The database could not be queried',
            }) as BodyInit,
            {
              status: 400,
              headers: {
                'Access-Control-Allow-Origin': '*',
              },
            }
          )
        }
      }
    }

    if (url.searchParams.get('action') === 'get_announcements') {
      try {
        const notion = new Client({
          auth: env.NOTION_API_KEY,
        })

        const announcementsList = await notion.databases.query({
          database_id: url.searchParams.get('database_id') ?? 'e078993c1ac74bdb8d2806174927ddcb',
          filter: {
            property: 'Publié',
            checkbox: {
              equals: true,
            },
          },
        })

        return new Response(
          JSON.stringify({
            anouncements: announcementsList,
          }) as BodyInit,
          {
            status: 200,
            headers: {
              'Access-Control-Allow-Origin': '*',
            },
          }
        )
      } catch (error) {
        if (error.code === APIErrorCode.ObjectNotFound) {
          return new Response(
            JSON.stringify({
              message: 'The database is not found',
            }) as BodyInit,
            {
              status: 404,
              headers: {
                'Access-Control-Allow-Origin': '*',
              },
            }
          )
        } else {
          console.error(error)
          return new Response(
            JSON.stringify({
              message: 'The database could not be queried',
            }) as BodyInit,
            {
              status: 400,
              headers: {
                'Access-Control-Allow-Origin': '*',
              },
            }
          )
        }
      }
    }
  },
}
