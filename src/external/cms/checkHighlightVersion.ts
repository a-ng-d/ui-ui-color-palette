const checkHighlightVersion = async (
  announcementsWorkerUrl: string,
  announcementsDbId: string
) => {
  return await fetch(
    `${announcementsWorkerUrl}/?action=get_version&database_id=${announcementsDbId}`
  )
    .then((response) => response.json())
    .then((data) => {
      if (data.message !== 'The database is not found') {
        parent.postMessage(
          {
            pluginMessage: {
              type: 'CHECK_HIGHLIGHT_STATUS',
              data: {
                version: data.version,
              },
            },
          },
          '*'
        )
        return data.version
      }
    })
    .catch((error) => console.error(error))
}

export default checkHighlightVersion
