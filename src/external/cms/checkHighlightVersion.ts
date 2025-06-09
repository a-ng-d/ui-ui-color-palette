const checkHighlightVersion = async (
  announcementsWorkerUrl: string,
  announcementsDbId: string
): Promise<string> => {
  return new Promise((resolve, reject) => {
    fetch(
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
          return resolve(data.version as string)
        }
      })
  })
}

export default checkHighlightVersion
