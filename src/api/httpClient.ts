import axios, { AxiosHeaders } from 'axios'

export const httpClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
})

httpClient.interceptors.request.use((config) => {
  const csrfToken = getCookieValue('AAM_CSRF')

  if (csrfToken) {
    const headers = AxiosHeaders.from(config.headers)
    headers.set('X-CSRF-Token', csrfToken)
    config.headers = headers
  }

  return config
})

function getCookieValue(name: string): string | undefined {
  const cookie = document.cookie
    .split('; ')
    .find((item) => item.startsWith(`${encodeURIComponent(name)}=`))

  return cookie ? decodeURIComponent(cookie.split('=').slice(1).join('=')) : undefined
}
