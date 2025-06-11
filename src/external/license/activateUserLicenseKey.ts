import { Platform } from '../../types/app'

const activateUserLicenseKey = async ({
  storeApiUrl,
  licenseKey,
  instanceName,
  platform,
}: {
  storeApiUrl: string
  licenseKey: string
  instanceName: string
  platform: Platform
}): Promise<{
  license_key: string
  instance_id: string
  instance_name: string
}> => {
  return new Promise((resolve, reject) => {
    fetch(
      `${storeApiUrl}/licenses/activate?license_key=${licenseKey}&instance_name=${encodeURI(instanceName + ' - ' + platform)}`,
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
        if (data.activated) {
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
                    key: 'user_license_instance_id',
                    value: data.instance.id,
                  },
                  {
                    key: 'user_license_instance_name',
                    value: instanceName,
                  },
                ],
              },
            },
            '*'
          )
          return resolve({
            license_key: data.license_key.key,
            instance_id: data.instance.id,
            instance_name: instanceName,
          })
        }
      })
      .catch((error) => reject(error))
  })
}

export default activateUserLicenseKey
