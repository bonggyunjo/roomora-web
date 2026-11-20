import { defineStore } from 'pinia'
import type { AuthTokenResponse, UserSummary } from '~/types/api'

export const useAuthStore = defineStore('auth', () => {
  const accessToken = useCookie<string | null>('roomora_at', { default: () => null })
  const refreshToken = useCookie<string | null>('roomora_rt', { default: () => null })
  const user = ref<UserSummary | null>(null)

  const isLoggedIn = computed(() => Boolean(accessToken.value))

  function setSession(res: AuthTokenResponse) {
    accessToken.value = res.accessToken
    refreshToken.value = res.refreshToken
    user.value = res.user
  }

  function setTokens(at: string, rt: string) {
    accessToken.value = at
    refreshToken.value = rt
  }

  function clearSession() {
    accessToken.value = null
    refreshToken.value = null
    user.value = null
  }

  return {
    accessToken,
    refreshToken,
    user,
    isLoggedIn,
    setSession,
    setTokens,
    clearSession
  }
})
