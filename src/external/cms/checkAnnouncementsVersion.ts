const checkAnnouncementsVersion = async (
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
          return resolve(data.version as string)
        }
      })
  })
}

export default checkAnnouncementsVersion
