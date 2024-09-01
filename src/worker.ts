import { Client, APIErrorCode } from '@notionhq/client'

export default {
  async fetch(request, env, ctx) {
    try {
      const notion = new Client({
        auth: env.NOTION_API_KEY,
      })

      const announcementsList = await notion.databases.query({
        database_id: 'e078993c1ac74bdb8d2806174927ddcb',
        filter: {
          property: 'Publié',
          checkbox: {
            equals: true,
          },
        },
      })

      return new Response(JSON.stringify(announcementsList.results) as BodyInit, {
        status: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
        },
      })
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
  },
}
