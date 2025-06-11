const desactivateUserLicenseKey = async ({
  storeApiUrl,
  licenseKey,
  instanceId,
}: {
  storeApiUrl: string
  licenseKey: string
  instanceId: string
}): Promise<boolean> => {
  return new Promise((resolve, reject) => {
    fetch(
      `${storeApiUrl}/licenses/deactivate?license_key=${licenseKey}&instance_id=${instanceId}`,
      {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/x-www-form-urlencoded',
          'Access-Control-Allow-Origin': '*',
        },
      }
    )
      .then((response) => response.json())
      .then((data) => {
        if (data.error) throw new Error(data.error)
        if (data.deactivated) {
          parent.postMessage(
            {
              pluginMessage: {
                type: 'DELETE_DATA',
                items: [
                  'user_license_key',
                  'user_license_instance_id',
                  'user_license_instance_name',
                ],
              },
            },
            '*'
          )
          return resolve(data.valid)
        }
      })
      .catch((error) => reject(error))
  })
}

export default desactivateUserLicenseKey
