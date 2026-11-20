<template>
  <div class="space-y-16">
    <!-- Hero: Editorial Interactive Space Finder -->
    <section class="relative overflow-hidden rounded-3xl bg-white border border-zinc-200/80 p-8 md:p-14 shadow-sm">
      <div class="max-w-3xl mx-auto text-center space-y-6">
        <p class="text-xs font-semibold tracking-widest uppercase text-[#8C583A]">
          Curated Living Recipes
        </p>
        <h1 class="text-3xl md:text-5xl font-bold tracking-tight text-zinc-900 leading-[1.2]">
          전세·무타공·예산에 맞는<br>우리 집 인테리어 레시피
        </h1>
        <p class="text-zinc-500 text-sm md:text-base max-w-xl mx-auto leading-relaxed">
          내 방 평수와 예산을 그대로 적어보세요. 비슷한 조건을 가진 사람들의 실제 방 사진과 품목별 견적, 실행 체크리스트까지 한 번에 모아드립니다.
        </p>

        <!-- Interactive Condition Bar -->
        <form class="max-w-2xl mx-auto space-y-3 pt-2" @submit.prevent="goSearch">
          <div class="flex flex-col sm:flex-row gap-2.5 p-2 rounded-2xl bg-[#FAF9F6] border border-zinc-200 focus-within:border-zinc-900 transition">
            <input
              v-model="query"
              type="text"
              placeholder="예: 전세 6평 북향 원룸, 무타공으로 50만원 안에 따뜻하게"
              class="flex-1 px-4 py-3 bg-transparent text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none"
            />
            <button
              type="submit"
              class="px-6 py-3 rounded-xl bg-zinc-900 text-white font-semibold text-sm hover:bg-zinc-800 active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-zinc-900 focus-visible:ring-offset-2 transition shrink-0"
            >
              공간 찾기
            </button>
          </div>
          <p v-if="inputError" class="text-xs text-red-600 text-left px-2">{{ inputError }}</p>
        </form>

        <!-- Quick Condition Chips -->
        <div class="flex flex-wrap justify-center gap-2 pt-1">
          <button
            v-for="preset in presets"
            :key="preset.label"
            type="button"
            class="px-3.5 py-1.5 rounded-full bg-zinc-100/80 text-xs font-medium text-zinc-700 hover:bg-zinc-900 hover:text-white active:scale-[0.98] transition"
            @click="applyPreset(preset.query)"
          >
            {{ preset.label }}
          </button>
        </div>
      </div>
    </section>

    <!-- Weekly Contest Highlight -->
    <section class="space-y-6">
      <div class="flex items-end justify-between border-b border-zinc-200 pb-4">
        <div>
          <p class="text-xs font-semibold text-[#8C583A] mb-1">WEEKLY CONTEST</p>
          <h2 class="text-xl md:text-2xl font-bold tracking-tight text-zinc-900">이번 주 인기 공간</h2>
          <p v-if="activeRound" class="text-xs text-zinc-500 mt-1">{{ activeRound.title }}</p>
        </div>
        <NuxtLink to="/contest" class="text-xs font-semibold text-zinc-700 hover:text-zinc-900">
          전체 순위 보기 →
        </NuxtLink>
      </div>

      <div v-if="ranking.length" class="grid md:grid-cols-3 gap-6">
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
            <span class="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-zinc-900/85 text-white text-xs font-semibold backdrop-blur-xs">
              {{ item.rank }}위 · {{ item.voteCount }}표
            </span>
          </div>
          <div class="min-w-0">
            <h3 class="font-semibold text-sm md:text-base text-zinc-900 line-clamp-1 group-hover:text-[#8C583A] transition">
              {{ item.title }}
            </h3>
            <p class="text-xs text-zinc-500 mt-0.5">{{ item.authorNickname }}</p>
          </div>
        </NuxtLink>
      </div>
      <div v-else class="bg-white rounded-2xl border border-zinc-200 p-10 text-center space-y-3">
        <p class="text-sm text-zinc-500">아직 등록된 콘테스트 출품작이 없습니다.</p>
        <NuxtLink
          to="/contest"
          class="inline-block px-4 py-2 rounded-full bg-zinc-900 text-white text-xs font-semibold hover:bg-zinc-800"
        >
          콘테스트 구경하기
        </NuxtLink>
      </div>
    </section>

    <!-- Curated Recipes Grid -->
    <section class="space-y-6">
      <div class="flex items-end justify-between border-b border-zinc-200 pb-4">
        <div>
          <p class="text-xs font-semibold text-[#8C583A] mb-1">REAL ROOM ARCHIVE</p>
          <h2 class="text-xl md:text-2xl font-bold tracking-tight text-zinc-900">조건별 방 꾸미기 레시피</h2>
        </div>
        <NuxtLink to="/recipes" class="text-xs font-semibold text-zinc-700 hover:text-zinc-900">
          필터로 더 찾기 →
        </NuxtLink>
      </div>

      <div v-if="recipes.length" class="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <NuxtLink
          v-for="recipe in recipes"
          :key="recipe.id"
          :to="`/recipes/${recipe.id}`"
          class="group block space-y-3"
        >
          <div class="aspect-[4/3] rounded-2xl overflow-hidden bg-zinc-200 relative">
            <img
              v-if="recipe.thumbnailUrl"
              :src="recipe.thumbnailUrl"
              :alt="recipe.title"
              class="w-full h-full object-cover group-hover:scale-105 transition duration-500"
            />
            <span
              v-if="recipe.isNoDrill"
              class="absolute bottom-3 left-3 px-2.5 py-1 rounded-full bg-white/90 text-zinc-800 text-[11px] font-medium backdrop-blur-xs"
            >
              무타공
            </span>
          </div>
          <div class="space-y-1 min-w-0">
            <h3 class="font-semibold text-sm text-zinc-900 line-clamp-2 leading-snug group-hover:text-[#8C583A] transition">
              {{ recipe.title }}
            </h3>
            <p class="text-xs text-zinc-500">
              {{ formatHousing(recipe.housingType) }} · {{ recipe.areaPyeong }}평 ·
              <span class="font-semibold text-zinc-800">{{ (recipe.budget / 10000).toLocaleString() }}만 원</span>
            </p>
          </div>
        </NuxtLink>
      </div>
      <div v-else class="bg-white rounded-2xl border border-zinc-200 p-10 text-center text-sm text-zinc-500">
        등록된 레시피가 없습니다. 첫 번째 공간 레시피를 올려보세요!
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import type { ContestRankingItem, ContestRound, RecipePageResponse, RecipeSummary } from '~/types/api'

const { baseUrl } = useApi()
const router = useRouter()

const query = ref('')
const inputError = ref('')

const presets = [
  { label: '전세 6평 · 무타공 · 50만 원', query: '전세 6평 북향 원룸 무타공 50만원 따뜻하게' },
  { label: '오피스텔 · 데스크테리어 · 30만 원', query: '월세 7평 오피스텔 30만원 미니멀 데스크테리어' },
  { label: '5평 자취방 · 25만 원 가성비', query: '5평 자취방 25만원 가성비 코지 침실' }
]

const { data: recipePage } = await useFetch<RecipePageResponse>(`${baseUrl}/api/recipes?size=4`, {
  default: () => ({ items: [], nextCursor: null, hasNext: false })
})
const { data: activeRound } = await useFetch<ContestRound | null>(`${baseUrl}/api/contests/rounds/active`, {
  default: () => null
})

const ranking = ref<ContestRankingItem[]>([])
if (activeRound.value?.id) {
  const { data: top3 } = await useFetch<ContestRankingItem[]>(
    `${baseUrl}/api/contests/rounds/${activeRound.value.id}/ranking?limit=3`,
    { default: () => [] }
  )
  ranking.value = top3.value || []
}

const recipes = computed<RecipeSummary[]>(() => recipePage.value?.items || [])

function formatHousing(type: string) {
  const map: Record<string, string> = {
    ONE_ROOM: '원룸',
    TWO_ROOM: '투룸',
    OFFICETEL: '오피스텔',
    APARTMENT: '아파트'
  }
  return map[type] || type
}

function goSearch() {
  if (!query.value.trim()) {
    inputError.value = '찾고 싶은 방의 조건이나 예산을 입력해 주세요.'
    return
  }
  inputError.value = ''
  router.push({ path: '/search', query: { q: query.value.trim() } })
}

function applyPreset(presetQuery: string) {
  query.value = presetQuery
  goSearch()
}
</script>
