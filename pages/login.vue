<template>
  <div class="max-w-md mx-auto bg-white rounded-3xl border border-zinc-200/80 p-8 space-y-6">
    <div class="text-center space-y-1.5">
      <h1 class="text-2xl font-bold text-zinc-900">{{ isSignup ? 'Roomora 시작하기' : '다시 오셨군요' }}</h1>
      <p class="text-xs text-zinc-500">체험 계정: curator@roomora.local / password123!</p>
    </div>

    <form class="space-y-3.5 text-sm" @submit.prevent="submit">
      <div>
        <input
          v-model="email"
          type="email"
          placeholder="이메일"
          class="w-full px-4 py-3 rounded-xl border border-zinc-300 focus:outline-none focus:border-zinc-900"
        />
        <p v-if="errors.email" class="text-xs text-red-600 mt-1">{{ errors.email }}</p>
      </div>

      <div v-if="isSignup">
        <input
          v-model="nickname"
          type="text"
          placeholder="닉네임 (2~30자)"
          class="w-full px-4 py-3 rounded-xl border border-zinc-300 focus:outline-none focus:border-zinc-900"
        />
        <p v-if="errors.nickname" class="text-xs text-red-600 mt-1">{{ errors.nickname }}</p>
      </div>

      <div>
        <input
          v-model="password"
          type="password"
          placeholder="비밀번호 (8자 이상)"
          class="w-full px-4 py-3 rounded-xl border border-zinc-300 focus:outline-none focus:border-zinc-900"
        />
        <p v-if="errors.password" class="text-xs text-red-600 mt-1">{{ errors.password }}</p>
      </div>

      <button
        type="submit"
        :disabled="submitting"
        class="w-full py-3 rounded-xl bg-zinc-900 text-white font-semibold hover:bg-zinc-800 active:scale-[0.98] disabled:opacity-40 transition"
      >
        {{ submitting ? '처리 중...' : isSignup ? '가입하고 시작하기' : '로그인' }}
      </button>
    </form>

    <div class="space-y-2.5 pt-3 border-t border-zinc-100 text-sm">
      <a
        :href="`${baseUrl}/oauth2/authorization/kakao`"
        class="block w-full py-3 rounded-xl bg-[#FEE500] text-zinc-900 font-semibold text-center hover:brightness-95 transition"
      >
        카카오로 3초 만에 시작하기
      </a>
      <a
        :href="`${baseUrl}/oauth2/authorization/google`"
        class="block w-full py-3 rounded-xl border border-zinc-300 text-zinc-800 font-semibold text-center hover:bg-zinc-50 transition"
      >
        Google 계정으로 계속하기
      </a>
    </div>

    <button
      type="button"
      class="w-full text-xs text-zinc-500 hover:text-zinc-900"
      @click="isSignup = !isSignup"
    >
      {{ isSignup ? '이미 계정이 있으신가요? 로그인' : '처음이신가요? 이메일로 가입하기' }}
    </button>
  </div>
</template>

<script setup lang="ts">
import type { AuthTokenResponse } from '~/types/api'

const auth = useAuthStore()
const ui = useUiStore()
const router = useRouter()
const { request, baseUrl } = useApi()

const isSignup = ref(false)
const email = ref('')
const nickname = ref('')
const password = ref('')
const submitting = ref(false)
const errors = reactive({ email: '', nickname: '', password: '' })

function validate() {
  errors.email = !email.value.includes('@') ? '올바른 이메일 형식을 입력해 주세요.' : ''
  errors.nickname = isSignup.value && nickname.value.trim().length < 2 ? '닉네임을 2자 이상 입력해 주세요.' : ''
  errors.password = password.value.length < 8 ? '비밀번호는 8자 이상이어야 합니다.' : ''
  return !errors.email && !errors.nickname && !errors.password
}

async function submit() {
  if (!validate()) return
  submitting.value = true
  try {
    if (isSignup.value) {
      await request('/api/auth/signup', {
        method: 'POST',
        body: { email: email.value, password: password.value, nickname: nickname.value }
      })
    }
    const res = await request<AuthTokenResponse>('/api/auth/login', {
      method: 'POST',
      body: { email: email.value, password: password.value }
    })
    auth.setSession(res)
    ui.toast(`${res.user.nickname}님, 환영합니다!`)
    await router.push('/mypage')
  } catch (err: any) {
    ui.toast(err?.data?.message || '이메일 또는 비밀번호를 확인해 주세요.', 'error')
  } finally {
    submitting.value = false
  }
}
</script>
