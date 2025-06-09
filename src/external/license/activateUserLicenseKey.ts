const activateUserLicenseKey = async (
  storeApiUrl: string,
  licenseKey: string
) => {
  return new Promise((resolve, reject) => {
    fetch(
      `${storeApiUrl}/licenses/activate?license_key=${licenseKey}&instance_name=ui_color_palette_plugin`,
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
        if (data.error) return reject(new Error(data.error))
        parent.postMessage(
          {
            pluginMessage: {
              type: 'SET_DATA',
              items: [
                {
                  key: 'user_license_key',
                  value: data.license_key.key,
                },
                {
                  key: 'user_license_status',
                  value: data.license_key.status,
                },
                {
                  key: 'user_license_instance_id',
                  value: data.instance.id,
                },
              ],
            },
          },
          '*'
        )
        return resolve(data)
      })
      .catch((error) => reject(error))
  })
}

export default activateUserLicenseKey
