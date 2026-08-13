import axios, { AxiosHeaders } from 'axios'
import type { ApiEnvelope, ApiProblem } from '@/types/hrs'

export const hrsClient = axios.create({
  baseURL: import.meta.env.VITE_HRS_API_BASE_URL || '/api/hrs/v1',
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
})

hrsClient.interceptors.request.use((config) => {
  const headers = AxiosHeaders.from(config.headers)
  headers.set('Accept-Language', localStorage.getItem('locale') ?? 'ja-JP')
  headers.set('X-Request-Id', crypto.randomUUID())
  config.headers = headers
  return config
})

export function isApiProblem(value: unknown): value is ApiProblem {
  return Boolean(
    value &&
      typeof value === 'object' &&
      'success' in value &&
      (value as { success?: unknown }).success === false &&
      'requestId' in value,
  )
}

export function unwrapEnvelope<T>(response: ApiEnvelope<T>): T {
  return response.data
}
