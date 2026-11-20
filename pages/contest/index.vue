<template>
  <div class="space-y-10">
    <div v-if="activeRound" class="rounded-3xl bg-zinc-900 text-white p-8 md:p-12 space-y-3">
      <span class="inline-block text-[11px] font-semibold tracking-wider px-3 py-1 rounded-full bg-white/10 text-amber-200">
        ROUND {{ activeRound.roundNo }} · 진행 중
      </span>
      <h1 class="text-2xl md:text-4xl font-bold tracking-tight">{{ activeRound.title }}</h1>
      <p class="text-zinc-300 text-sm md:text-base max-w-2xl">{{ activeRound.themeDescription }}</p>
    </div>

    <section class="space-y-6">
      <div class="border-b border-zinc-200 pb-4">
        <p class="text-xs font-semibold text-[#8C583A] mb-1">REALTIME RANKING</p>
        <h2 class="text-xl font-bold text-zinc-900">실시간 인기 출품작</h2>
      </div>

      <div v-if="ranking.length" class="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <NuxtLink
          v-for="item in ranking"
          :key="item.postId"
          :to="`/contest/${item.postId}`"
          class="group block space-y-3"
        >
          <div class="aspect-[4/3] rounded-2xl overflow-hidden bg-zinc-200 relative">
            <img
              v-if="item.thumbnailUrl"
              :src="item.thumbnailUrl"
              :alt="item.title"
              class="w-full h-full object-cover group-hover:scale-105 transition duration-500"
            />
            <span class="absolute top-3 left-3 px-3 py-1 rounded-full bg-zinc-900/85 text-white text-xs font-semibold">
              {{ item.rank }}위 · {{ item.voteCount }}표
            </span>
          </div>
          <div class="min-w-0">
            <h3 class="font-semibold text-base text-zinc-900 line-clamp-1 group-hover:text-[#8C583A] transition">
              {{ item.title }}
            </h3>
            <p class="text-xs text-zinc-500 mt-0.5">{{ item.authorNickname }}</p>
          </div>
        </NuxtLink>
      </div>
      <div v-else class="bg-white rounded-2xl border border-zinc-200 p-12 text-center text-sm text-zinc-500">
        아직 등록된 출품작이 없습니다.
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import type { ContestRankingItem, ContestRound } from '~/types/api'

const { baseUrl } = useApi()
const { data: activeRound } = await useFetch<ContestRound | null>(`${baseUrl}/api/contests/rounds/active`, {
  default: () => null
})

const ranking = ref<ContestRankingItem[]>([])
if (activeRound.value?.id) {
  const { data } = await useFetch<ContestRankingItem[]>(
    `${baseUrl}/api/contests/rounds/${activeRound.value.id}/ranking?limit=20`,
    { default: () => [] }
  )
  ranking.value = data.value || []
}
</script>
