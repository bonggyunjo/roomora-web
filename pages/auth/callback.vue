<template>
  <div class="max-w-md mx-auto bg-white rounded-3xl border border-zinc-200/80 p-8 text-center space-y-5">
    <div class="space-y-1">
      <p class="text-xs font-semibold text-[#8C583A]">SOCIAL LOGIN</p>
      <h1 class="text-xl font-bold text-zinc-900">
        {{ needsOnboarding ? '닉네임 설정' : '소셜 로그인 처리 중' }}
      </h1>
    </div>

    <div v-if="needsOnboarding" class="space-y-3 text-left">
      <p class="text-xs text-zinc-600">Roomora에서 사용할 닉네임을 설정해 주세요. (2~30자)</p>
      <input
        v-model="nickname"
        type="text"
        maxlength="30"
        placeholder="예) 북향자취러"
        class="w-full px-4 py-3 rounded-xl border border-zinc-300 text-sm focus:outline-none focus:border-zinc-900"
      />
      <p v-if="errorMsg" class="text-xs text-red-600">{{ errorMsg }}</p>
      <button
        type="button"
        :disabled="submitting"
        class="w-full py-3 rounded-xl bg-zinc-900 text-white text-sm font-semibold hover:bg-zinc-800 active:scale-[0.98] disabled:opacity-40 transition"
        @click="finishOnboarding"
      >
        {{ submitting ? '저장 중...' : '시작하기' }}
      </button>
    </div>

    <p v-else class="text-sm text-zinc-500 py-4">잠시만 기다려 주세요...</p>
  </div>
</template>

<script setup lang="ts">
const route = useRoute()
const router = useRouter()
const auth = useAuthStore()
const ui = useUiStore()
const { request } = useApi()

const needsOnboarding = ref(false)
const nickname = ref('')
const errorMsg = ref('')
const submitting = ref(false)

onMounted(async () => {
  const err = route.query.error as string | undefined
  if (err) {
    ui.toast('소셜 로그인에 실패했습니다. 다시 시도해 주세요.', 'error')
    await router.push('/login')
    return
  }

  const at = route.query.accessToken as string | undefined
  const rt = route.query.refreshToken as string | undefined
  const onboard = route.query.needsOnboarding === 'true'
  if (at && rt) {
    auth.setTokens(at, rt)
    await auth.fetchMe()
    if (onboard) {
      needsOnboarding.value = true
    } else {
      ui.toast('로그인되었습니다.')
      await router.push('/mypage')
    }
  } else {
    await router.push('/login')
  }
})

async function finishOnboarding() {
  const trimmed = nickname.value.trim()
  if (trimmed.length < 2) {
    errorMsg.value = '닉네임을 2자 이상 입력해 주세요.'
    return
  }
  errorMsg.value = ''
  submitting.value = true
  try {
    await request('/api/auth/onboarding', {
      method: 'PATCH',
      body: { nickname: trimmed }
    })
    await auth.fetchMe()
    ui.toast('환영합니다! Roomora가 준비되었습니다.')
    await router.push('/mypage')
  } catch (err: any) {
    errorMsg.value = err?.data?.message || '닉네임 설정에 실패했습니다.'
  } finally {
    submitting.value = false
  }
}
</script>
