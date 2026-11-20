export function useApi() {
  const config = useRuntimeConfig()
  const auth = useAuthStore()

  async function request<T>(path: string, options: Parameters<typeof $fetch<T>>[1] = {}): Promise<T> {
    const headers: Record<string, string> = {
      ...(options?.headers as Record<string, string> || {})
    }
    if (auth.accessToken) {
      headers.Authorization = `Bearer ${auth.accessToken}`
    }

    return await $fetch<T>(`${config.public.apiBaseUrl}${path}`, {
      ...options,
      headers
    })
  }

  return {
    request,
    baseUrl: config.public.apiBaseUrl
  }
}
