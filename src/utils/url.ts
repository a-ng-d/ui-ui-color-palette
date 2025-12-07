export const getProxiedUrl = (
  url: string,
  customHeaders?: Record<string, string>
): string => {
  const isLocalhost = url.includes('localhost') || url.includes('127.0.0.1')

  if (isLocalhost) return url

  let proxyUrl = `https://corsproxy.io/?${encodeURIComponent(url)}`

  if (customHeaders)
    Object.entries(customHeaders).forEach(([header, value]) => {
      const headerParam = `${header}:${value}`
      proxyUrl += `&headers[]=${encodeURIComponent(headerParam)}`
    })

  return proxyUrl
}
