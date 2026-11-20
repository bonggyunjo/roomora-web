<template>
  <div class="max-w-md mx-auto bg-white rounded-2xl border border-stone-200 p-8 text-center space-y-4">
    <h1 class="text-xl font-bold text-stone-900">소셜 로그인 처리 중</h1>
    <div v-if="needsOnboarding" class="space-y-3 text-left">
      <p class="text-sm text-stone-600">Roomora에서 사용할 닉네임을 설정해 주세요.</p>
      <input
        v-model="nickname"
        type="text"
        minlength="2"
        placeholder="닉네임 (2~30자)"
        class="w-full px-4 py-2.5 rounded-xl border border-stone-300 text-sm"
      />
      <button
        type="button"
        class="w-full py-2.5 rounded-xl bg-amber-700 text-white text-sm font-semibold"
        @click="finishOnboarding"
      >
        시작하기
      </button>
    </div>
    <p v-else class="text-sm text-stone-500">잠시만 기다려 주세요...</p>
  </div>
</template>

<script setup lang="ts">
const route = useRoute()
const router = useRouter()
const auth = useAuthStore()
const { request } = useApi()

const needsOnboarding = ref(false)
const nickname = ref('')

onMounted(async () => {
  const at = route.query.accessToken as string | undefined
  const rt = route.query.refreshToken as string | undefined
  const onboard = route.query.needsOnboarding === 'true'
  if (at && rt) {
    auth.setTokens(at, rt)
    if (onboard) {
      needsOnboarding.value = true
    } else {
      await router.push('/mypage')
    }
  } else {
    await router.push('/login')
  }
})

async function finishOnboarding() {
  if (!nickname.value.trim()) return
  await request('/api/auth/onboarding', {
    method: 'PATCH',
    body: { nickname: nickname.value.trim() }
  })
  await router.push('/mypage')
}
</script>
