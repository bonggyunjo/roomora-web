<template>
  <div class="space-y-8">
    <div class="flex flex-wrap items-end justify-between gap-4 border-b border-zinc-200 pb-4">
      <div>
        <p class="text-xs font-semibold text-[#8C583A] mb-1">REAL ROOM ARCHIVE</p>
        <h1 class="text-2xl md:text-3xl font-bold tracking-tight text-zinc-900">조건별 방 꾸미기 레시피</h1>
      </div>
      <NuxtLink
        to="/recipes/write"
        class="px-5 py-2.5 rounded-full bg-zinc-900 text-white text-xs font-semibold hover:bg-zinc-800 active:scale-[0.98] transition"
      >
        + 내 방 레시피 올리기
      </NuxtLink>
    </div>

    <!-- Filter Bar -->
    <div class="bg-white p-4 rounded-2xl border border-zinc-200/80 flex flex-wrap gap-2.5 items-center text-xs md:text-sm">
      <select v-model="filters.housingType" class="px-3 py-2 rounded-xl border border-zinc-300 bg-white">
        <option value="">전체 주거형태</option>
        <option value="ONE_ROOM">원룸</option>
        <option value="TWO_ROOM">투룸</option>
        <option value="OFFICETEL">오피스텔</option>
        <option value="APARTMENT">아파트</option>
      </select>
      <input
        v-model.number="filters.maxBudget"
        type="number"
        min="0"
        placeholder="최대 예산(원)"
        class="w-36 px-3 py-2 rounded-xl border border-zinc-300"
      />
      <select v-model="filters.styleTag" class="px-3 py-2 rounded-xl border border-zinc-300 bg-white">
        <option value="">전체 스타일</option>
        <option value="WOOD">우드</option>
        <option value="MINIMAL">미니멀</option>
        <option value="MODERN">모던</option>
        <option value="NATURAL">내추럴</option>
      </select>
      <label class="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-zinc-300 cursor-pointer select-none">
        <input v-model="filters.isNoDrill" type="checkbox" />
        <span>무타공만</span>
      </label>
      <select v-model="filters.sort" class="px-3 py-2 rounded-xl border border-zinc-300 bg-white">
        <option value="LATEST">최신순</option>
        <option value="LIKES">좋아요순</option>
        <option value="SCRAPS">북마크순</option>
        <option value="BUDGET_ASC">예산 낮은순</option>
      </select>
      <button
        type="button"
        class="px-4 py-2 rounded-xl bg-zinc-900 text-white font-semibold hover:bg-zinc-800 active:scale-[0.98] transition"
        @click="fetchRecipes(true)"
      >
        적용하기
      </button>
    </div>

    <!-- Loading Skeleton -->
    <div v-if="loading && !items.length" class="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
      <div v-for="n in 6" :key="n" class="space-y-3">
        <div class="aspect-[4/3] rounded-2xl bg-zinc-200/70" />
        <div class="h-4 w-3/4 bg-zinc-200/70 rounded" />
        <div class="h-3 w-1/2 bg-zinc-200/70 rounded" />
      </div>
    </div>

    <!-- Error State -->
    <div v-else-if="errorMsg" class="bg-white rounded-2xl border border-red-200 p-10 text-center space-y-3">
      <p class="text-sm text-red-600">{{ errorMsg }}</p>
      <button
        type="button"
        class="px-4 py-2 rounded-xl bg-zinc-900 text-white text-xs font-semibold"
        @click="fetchRecipes(true)"
      >
        다시 불러오기
      </button>
    </div>

    <!-- Empty State -->
    <div v-else-if="!items.length" class="bg-white rounded-2xl border border-zinc-200 p-12 text-center space-y-3">
      <p class="text-sm text-zinc-600">선택한 조건에 맞는 레시피가 아직 없습니다.</p>
      <button
        type="button"
        class="px-4 py-2 rounded-full border border-zinc-300 text-xs font-semibold hover:bg-zinc-50"
        @click="resetFilters"
      >
        필터 초기화
      </button>
    </div>

    <!-- Grid -->
    <div v-else class="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
      <NuxtLink
        v-for="r in items"
        :key="r.id"
        :to="`/recipes/${r.id}`"
        class="group block space-y-3"
      >
        <div class="aspect-[4/3] rounded-2xl overflow-hidden bg-zinc-200 relative">
          <img
            v-if="r.thumbnailUrl"
            :src="r.thumbnailUrl"
            :alt="r.title"
            class="w-full h-full object-cover group-hover:scale-105 transition duration-500"
          />
          <span
            v-if="r.isNoDrill"
            class="absolute bottom-3 left-3 px-2.5 py-1 rounded-full bg-white/90 text-zinc-800 text-[11px] font-medium"
          >
            무타공
          </span>
        </div>
        <div class="space-y-1 min-w-0">
          <h2 class="font-semibold text-sm md:text-base text-zinc-900 line-clamp-2 leading-snug group-hover:text-[#8C583A] transition">
            {{ r.title }}
          </h2>
          <div class="flex items-center justify-between text-xs text-zinc-500">
            <span>{{ r.areaPyeong }}평 · <strong class="text-zinc-800">{{ (r.budget / 10000).toLocaleString() }}만 원</strong></span>
            <span>♥ {{ r.likeCount }} · ★ {{ r.scrapCount }}</span>
          </div>
        </div>
      </NuxtLink>
    </div>

    <div v-if="hasNext" class="text-center pt-4">
      <button
        type="button"
        :disabled="loading"
        class="px-6 py-2.5 rounded-full border border-zinc-300 bg-white text-xs font-semibold hover:bg-zinc-50 active:scale-[0.98] disabled:opacity-40"
        @click="fetchRecipes(false)"
      >
        {{ loading ? '불러오는 중...' : '레시피 더 보기' }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { RecipePageResponse, RecipeSummary } from '~/types/api'

const { request } = useApi()
const filters = reactive({
  housingType: '',
  maxBudget: undefined as number | undefined,
  styleTag: '',
  isNoDrill: false,
  sort: 'LATEST'
})

const items = ref<RecipeSummary[]>([])
const nextCursor = ref<number | null>(null)
const hasNext = ref(false)
const loading = ref(false)
const errorMsg = ref('')

async function fetchRecipes(reset: boolean) {
  loading.value = true
  errorMsg.value = ''
  if (reset) {
    items.value = []
    nextCursor.value = null
  }
  try {
    const params = new URLSearchParams()
    if (filters.housingType) params.set('housingType', filters.housingType)
    if (filters.isNoDrill) params.set('isNoDrill', 'true')
    if (filters.maxBudget !== undefined && filters.maxBudget >= 0) params.set('maxBudget', String(filters.maxBudget))
    if (filters.styleTag) params.set('styleTag', filters.styleTag)
    params.set('sort', filters.sort)
    params.set('size', '12')
    if (!reset && nextCursor.value) params.set('lastId', String(nextCursor.value))

    const res = await request<RecipePageResponse>(`/api/recipes?${params.toString()}`)
    items.value.push(...res.items)
    nextCursor.value = res.nextCursor
    hasNext.value = res.hasNext
  } catch {
    errorMsg.value = '레시피 목록을 불러오지 못했습니다.'
  } finally {
    loading.value = false
  }
}

function resetFilters() {
  filters.housingType = ''
  filters.maxBudget = undefined
  filters.styleTag = ''
  filters.isNoDrill = false
  filters.sort = 'LATEST'
  fetchRecipes(true)
}

onMounted(() => fetchRecipes(true))
</script>
