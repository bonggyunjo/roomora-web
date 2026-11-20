<template>
  <div class="min-h-screen bg-[#FAF9F6] text-zinc-900 flex flex-col font-['Pretendard',sans-serif] antialiased">
    <header class="sticky top-0 z-30 bg-[#FAF9F6]/90 backdrop-blur-md border-b border-zinc-200/80">
      <div class="max-w-6xl mx-auto px-4 md:px-6 h-16 flex items-center justify-between gap-4">
        <NuxtLink to="/" class="flex items-center gap-2.5 group">
          <span class="font-bold text-xl tracking-tight text-zinc-900">Roomora</span>
          <span class="hidden sm:inline-block text-[11px] font-medium px-2 py-0.5 rounded-full bg-zinc-900/5 text-[#8C583A]">
            공간 레시피
          </span>
        </NuxtLink>

        <nav class="flex items-center gap-5 md:gap-7 text-sm font-medium text-zinc-600">
          <NuxtLink to="/search" class="hover:text-zinc-900 transition">공간 찾기</NuxtLink>
          <NuxtLink to="/recipes" class="hover:text-zinc-900 transition">레시피</NuxtLink>
          <NuxtLink to="/contest" class="hover:text-zinc-900 transition">콘테스트</NuxtLink>
          <template v-if="auth.isLoggedIn">
            <NuxtLink to="/mypage" class="hover:text-zinc-900 transition">내 공간</NuxtLink>
            <button
              type="button"
              class="px-3.5 py-1.5 rounded-full border border-zinc-300 text-xs font-medium text-zinc-700 hover:bg-zinc-100 active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-zinc-900 transition"
              @click="handleLogout"
            >
              로그아웃
            </button>
          </template>
          <NuxtLink
            v-else
            to="/login"
            class="px-4 py-2 rounded-full bg-zinc-900 text-white text-xs font-semibold hover:bg-zinc-800 active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-zinc-900 transition"
          >
            시작하기
          </NuxtLink>
        </nav>
      </div>
    </header>

    <main class="flex-1 max-w-6xl w-full mx-auto px-4 md:px-6 py-8 md:py-12">
      <slot />
    </main>

    <footer class="border-t border-zinc-200/80 bg-white/60 py-8 text-center text-xs text-zinc-500">
      Roomora · 전세·월세·무타공 조건에 맞는 우리 집 레시피 아카이브
    </footer>

    <!-- Global Toast -->
    <div class="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm">
      <div
        v-for="t in ui.toasts"
        :key="t.id"
        class="px-4 py-3 rounded-xl shadow-lg text-xs md:text-sm font-medium text-white transition-all"
        :class="{
          'bg-zinc-900': t.type === 'success' || t.type === 'info',
          'bg-red-600': t.type === 'error'
        }"
      >
        {{ t.text }}
      </div>
    </div>

    <!-- Global Confirm Modal -->
    <div
      v-if="ui.confirmState.open"
      class="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4"
    >
      <div class="bg-white rounded-2xl max-w-sm w-full p-6 space-y-4 shadow-xl">
        <h3 class="text-base font-bold text-zinc-900">{{ ui.confirmState.title }}</h3>
        <p class="text-sm text-zinc-600 leading-relaxed">{{ ui.confirmState.message }}</p>
        <div class="flex gap-2 pt-2">
          <button
            type="button"
            class="flex-1 py-2.5 rounded-xl border border-zinc-300 text-sm font-medium text-zinc-700 hover:bg-zinc-50 active:scale-[0.98]"
            @click="ui.resolveConfirm(false)"
          >
            취소
          </button>
          <button
            type="button"
            class="flex-1 py-2.5 rounded-xl bg-red-600 text-white text-sm font-semibold hover:bg-red-700 active:scale-[0.98]"
            @click="ui.resolveConfirm(true)"
          >
            {{ ui.confirmState.confirmLabel }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const auth = useAuthStore()
const ui = useUiStore()
const { request } = useApi()
const router = useRouter()

async function handleLogout() {
  try {
    await request('/api/auth/logout', { method: 'POST' })
  } catch {
    // ignore expired token
  } finally {
    auth.clearSession()
    ui.toast('로그아웃되었습니다.', 'info')
    await router.push('/')
  }
}
</script>
