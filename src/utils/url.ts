export const getProxiedUrl = (url: string): string => {
  const isLocalhost = url.includes('localhost') || url.includes('127.0.0.1')

  return isLocalhost ? url : `https://corsproxy.io/?${encodeURIComponent(url)}`
}
