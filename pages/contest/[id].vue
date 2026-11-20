<template>
  <div v-if="post" class="max-w-3xl mx-auto bg-white rounded-3xl border border-zinc-200/80 overflow-hidden">
    <div v-if="post.images.length" class="aspect-[16/10] bg-zinc-200">
      <img :src="post.images[0]" :alt="post.title" class="w-full h-full object-cover" />
    </div>
    <div class="p-6 md:p-10 space-y-6">
      <div class="flex items-center justify-between">
        <span class="text-xs font-semibold px-3 py-1 rounded-full bg-zinc-100 text-zinc-800">
          콘테스트 출품작 · {{ post.voteCount }}표
        </span>
        <NuxtLink :to="`/users/${post.authorId}`" class="text-sm font-medium text-zinc-700 hover:text-[#8C583A]">
          by {{ post.authorNickname }}
        </NuxtLink>
      </div>

      <h1 class="text-2xl md:text-3xl font-bold text-zinc-900 break-words">{{ post.title }}</h1>
      <p class="text-zinc-700 whitespace-pre-line text-sm md:text-base leading-relaxed">{{ post.content }}</p>

      <div class="flex gap-3 pt-4 border-t border-zinc-100">
        <button
          type="button"
          :disabled="post.votedByMe"
          class="flex-1 py-3 rounded-xl font-semibold text-sm active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed transition"
          :class="post.votedByMe ? 'bg-zinc-200 text-zinc-700' : 'bg-zinc-900 text-white hover:bg-zinc-800'"
          @click="handleVote"
        >
          {{ post.votedByMe ? '이번 회차 투표 완료' : '이 공간에 투표하기 (회차당 1표)' }}
        </button>
        <button
          type="button"
          class="px-5 py-3 rounded-xl border border-zinc-300 text-sm font-semibold hover:bg-zinc-50 active:scale-[0.98] transition"
          @click="handleScrap"
        >
          ★ 북마크 {{ post.scrapCount }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ContestPostDetail } from '~/types/api'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()
const ui = useUiStore()
const { request, baseUrl } = useApi()

const id = route.params.id
const { data: post } = await useFetch<ContestPostDetail>(`${baseUrl}/api/contests/posts/${id}`)

async function handleVote() {
  if (!auth.isLoggedIn) {
    ui.toast('로그인 후 투표할 수 있어요.', 'info')
    return router.push('/login')
  }
  try {
    const res = await request<{ voteCount: number }>(`/api/contests/posts/${id}/vote`, { method: 'POST' })
    if (post.value) {
      post.value.voteCount = res.voteCount
      post.value.votedByMe = true
    }
    ui.toast('소중한 한 표가 반영되었습니다!')
  } catch (err: any) {
    ui.toast(err?.data?.message || '투표할 수 없습니다.', 'error')
  }
}

async function handleScrap() {
  if (!auth.isLoggedIn) {
    ui.toast('로그인 후 북마크할 수 있어요.', 'info')
    return router.push('/login')
  }
  const res = await request<{ active: boolean; count: number }>(`/api/contests/posts/${id}/scrap`, { method: 'POST' })
  if (post.value) {
    post.value.scrappedByMe = res.active
    post.value.scrapCount = res.count
  }
  ui.toast(res.active ? '콘테스트 북마크에 담았습니다.' : '북마크를 해제했습니다.', 'info')
}
</script>
