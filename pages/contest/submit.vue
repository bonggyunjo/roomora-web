<template>
  <div class="max-w-2xl mx-auto space-y-6">
    <div v-if="activeRound" class="bg-white rounded-3xl border border-zinc-200/80 p-6 md:p-10 space-y-6">
      <div class="space-y-1.5 border-b border-zinc-100 pb-4">
        <p class="text-xs font-semibold text-[#8C583A]">ROUND {{ activeRound.roundNo }} · {{ activeRound.title }}</p>
        <h1 class="text-2xl font-bold text-zinc-900">콘테스트 출품하기</h1>
        <p class="text-xs text-zinc-500">{{ activeRound.themeDescription }}</p>
      </div>

      <form class="space-y-5 text-sm" @submit.prevent="submit">
        <div>
          <label class="block text-xs font-semibold text-zinc-700 mb-1.5">제목 *</label>
          <input
            v-model="form.title"
            type="text"
            maxlength="120"
            placeholder="예) 북향 6평 자취방, 3000K 간접조명으로 채운 겨울 아지트"
            class="w-full px-4 py-3 rounded-xl border border-zinc-300 focus:outline-none focus:border-zinc-900"
          />
          <p v-if="errors.title" class="text-xs text-red-600 mt-1">{{ errors.title }}</p>
        </div>

        <div>
          <label class="block text-xs font-semibold text-zinc-700 mb-1.5">공간 소개 *</label>
          <textarea
            v-model="form.content"
            rows="6"
            placeholder="공간의 제약 조건, 스타일링 포인트, 사용한 아이템과 팁을 자유롭게 소개해 주세요."
            class="w-full px-4 py-3 rounded-xl border border-zinc-300 focus:outline-none focus:border-zinc-900"
          />
          <p v-if="errors.content" class="text-xs text-red-600 mt-1">{{ errors.content }}</p>
        </div>

        <div class="space-y-2">
          <div class="flex items-center justify-between">
            <label class="text-xs font-semibold text-zinc-700">사진 URL (최대 5장, 첫 사진이 대표 썸네일)</label>
            <button
              v-if="form.images.length < 5"
              type="button"
              class="text-xs font-semibold text-[#8C583A] hover:underline"
              @click="form.images.push('')"
            >
              + 사진 추가
            </button>
          </div>
          <div v-for="(_, idx) in form.images" :key="idx" class="flex gap-2">
            <input
              v-model="form.images[idx]"
              type="url"
              placeholder="https://images.unsplash.com/..."
              class="flex-1 px-4 py-2.5 rounded-xl border border-zinc-300 text-xs focus:outline-none focus:border-zinc-900"
            />
            <button
              v-if="form.images.length > 1"
              type="button"
              class="px-3 py-2 rounded-xl border border-zinc-200 text-xs text-zinc-500 hover:text-red-600"
              @click="form.images.splice(idx, 1)"
            >
              삭제
            </button>
          </div>
          <p v-if="errors.images" class="text-xs text-red-600">{{ errors.images }}</p>

          <div v-if="previewUrl" class="aspect-[16/10] rounded-2xl overflow-hidden bg-zinc-100 border border-zinc-200 mt-2">
            <img :src="previewUrl" alt="출품작 미리보기" class="w-full h-full object-cover" />
          </div>
        </div>

        <div class="flex gap-3 pt-2">
          <NuxtLink
            to="/contest"
            class="px-5 py-3 rounded-xl border border-zinc-300 text-zinc-700 font-semibold hover:bg-zinc-50 transition"
          >
            취소
          </NuxtLink>
          <button
            type="submit"
            :disabled="submitting"
            class="flex-1 py-3 rounded-xl bg-zinc-900 text-white font-semibold hover:bg-zinc-800 active:scale-[0.98] disabled:opacity-40 transition"
          >
            {{ submitting ? '출품 중...' : '콘테스트 출품 완료하기' }}
          </button>
        </div>
      </form>
    </div>

    <div v-else class="bg-white rounded-3xl border border-zinc-200 p-12 text-center space-y-3">
      <p class="text-sm text-zinc-600">현재 진행 중인 콘테스트 회차가 없습니다.</p>
      <NuxtLink to="/contest" class="inline-block px-5 py-2.5 rounded-full bg-zinc-900 text-white text-xs font-semibold">
        콘테스트 홈으로 돌아가기
      </NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ContestPostDetail, ContestRound } from '~/types/api'

const router = useRouter()
const auth = useAuthStore()
const ui = useUiStore()
const { request, baseUrl } = useApi()

const { data: activeRound } = await useFetch<ContestRound | null>(`${baseUrl}/api/contests/rounds/active`, {
  default: () => null
})

const form = reactive({
  title: '',
  content: '',
  images: ['']
})
const errors = reactive({
  title: '',
  content: '',
  images: ''
})
const submitting = ref(false)

const previewUrl = computed(() => form.images.find((u: string) => u.trim().startsWith('http')) || '')

onMounted(() => {
  if (!auth.isLoggedIn) {
    ui.toast('로그인 후 콘테스트에 출품할 수 있어요.', 'info')
    router.push('/login')
  }
})

function validate() {
  errors.title = !form.title.trim() ? '제목을 입력해 주세요.' : ''
  errors.content = !form.content.trim() ? '공간 소개를 입력해 주세요.' : ''
  const validImages = form.images.map((u: string) => u.trim()).filter(Boolean)
  errors.images = validImages.length === 0 ? '최소 1장의 사진 URL을 입력해 주세요.' : ''
  return !errors.title && !errors.content && !errors.images
}

async function submit() {
  if (!activeRound.value) return
  if (!validate()) return
  const validImages = form.images.map((u: string) => u.trim()).filter(Boolean)
  submitting.value = true
  try {
    const created = await request<ContestPostDetail>(`/api/contests/rounds/${activeRound.value.id}/posts`, {
      method: 'POST',
      body: {
        title: form.title.trim(),
        content: form.content.trim(),
        thumbnailUrl: validImages[0],
        images: validImages
      }
    })
    ui.toast('콘테스트 출품이 완료되었습니다!')
    await router.push(`/contest/${created.id}`)
  } catch (err: any) {
    ui.toast(err?.data?.message || '출품에 실패했습니다.', 'error')
  } finally {
    submitting.value = false
  }
}
</script>
