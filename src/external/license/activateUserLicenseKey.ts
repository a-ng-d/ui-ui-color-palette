const activateUserLicenseKey = async (
  storeApiUrl: string,
  licenseKey: string
) => {
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
    .then((response) => {
      if (response.status === 200) return response.json()
      else throw new Error()
    })
    .then((data) => {
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
    })
    .catch((error) => console.error(error))
}

export default activateUserLicenseKey
