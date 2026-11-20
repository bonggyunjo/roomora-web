<template>
  <div class="space-y-8">
    <!-- Search Header -->
    <section class="bg-white rounded-3xl border border-zinc-200/80 p-6 md:p-8 space-y-4">
      <div class="space-y-1">
        <p class="text-xs font-semibold text-[#8C583A]">SPACE FINDER</p>
        <h1 class="text-2xl md:text-3xl font-bold tracking-tight text-zinc-900">내 조건으로 공간 찾기</h1>
      </div>

      <form class="space-y-3" @submit.prevent="runSearch">
        <div class="flex flex-col md:flex-row gap-3">
          <input
            v-model="queryInput"
            type="text"
            placeholder="예: 전세 6평 북향 원룸, 무타공으로 50만원 안에 따뜻하게"
            class="flex-1 px-4 py-3 rounded-xl border border-zinc-300 text-sm focus:outline-none focus:border-zinc-900"
          />
          <button
            type="submit"
            :disabled="loading"
            class="px-6 py-3 rounded-xl bg-zinc-900 text-white font-semibold text-sm hover:bg-zinc-800 active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed focus-visible:ring-2 focus-visible:ring-zinc-900 transition"
          >
            {{ loading ? '공간을 찾는 중...' : '레시피 찾기' }}
          </button>
        </div>
        <p v-if="validationError" class="text-xs text-red-600">{{ validationError }}</p>
      </form>

      <div class="flex flex-wrap gap-2.5 text-xs pt-1">
        <select v-model="housingType" class="px-3 py-2 rounded-lg border border-zinc-300 bg-white">
          <option value="">주거형태 (자동)</option>
          <option value="ONE_ROOM">원룸</option>
          <option value="TWO_ROOM">투룸</option>
          <option value="OFFICETEL">오피스텔</option>
          <option value="APARTMENT">아파트</option>
        </select>
        <input
          v-model.number="maxBudget"
          type="number"
          min="0"
          placeholder="최대 예산(원)"
          class="w-36 px-3 py-2 rounded-lg border border-zinc-300"
        />
        <label class="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-zinc-300 cursor-pointer select-none">
          <input v-model="isNoDrill" type="checkbox" />
          <span>무타공만</span>
        </label>
      </div>
    </section>

    <!-- Loading Skeleton State -->
    <div v-if="loading" class="space-y-6 animate-pulse">
      <div class="h-36 bg-zinc-200/70 rounded-2xl" />
      <div class="grid md:grid-cols-2 gap-6">
        <div class="h-64 bg-zinc-200/70 rounded-2xl" />
        <div class="h-64 bg-zinc-200/70 rounded-2xl" />
      </div>
    </div>

    <!-- Error State with Retry -->
    <div v-else-if="errorMsg" class="bg-white rounded-2xl border border-red-200 p-8 text-center space-y-3">
      <p class="text-sm font-medium text-red-600">{{ errorMsg }}</p>
      <button
        type="button"
        class="px-4 py-2 rounded-xl bg-zinc-900 text-white text-xs font-semibold hover:bg-zinc-800 active:scale-[0.98]"
        @click="runSearch"
      >
        다시 시도
      </button>
    </div>

    <!-- Results -->
    <div v-else-if="result" class="space-y-8">
      <div v-if="result.fallback" class="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs md:text-sm">
        현재 조건과 일치하는 레시피를 모았어요.
      </div>

      <!-- Proposal & Warnings -->
      <div class="bg-white rounded-3xl border border-zinc-200/80 p-6 md:p-8 space-y-4">
        <div class="flex items-center justify-between gap-2">
          <h2 class="text-lg md:text-xl font-bold text-zinc-900">이 조건에 어울리는 공간 제안</h2>
          <span v-if="result.relaxed" class="px-2.5 py-1 rounded-full bg-zinc-100 text-zinc-700 text-xs font-medium">
            유사 조건 포함
          </span>
        </div>
        <p class="text-zinc-700 leading-relaxed text-sm md:text-base">{{ result.summary }}</p>

        <div v-if="result.warnings.length" class="space-y-2 pt-2">
          <div
            v-for="(warn, idx) in result.warnings"
            :key="idx"
            class="px-4 py-3 rounded-xl bg-[#FAF9F6] border border-zinc-200 text-zinc-700 text-xs md:text-sm"
          >
            <span class="font-semibold text-[#B45309] mr-1.5">체크포인트</span> {{ warn }}
          </div>
        </div>
      </div>

      <!-- Budget Visual Bar + Checklist -->
      <div class="grid md:grid-cols-2 gap-6">
        <div class="bg-white rounded-3xl border border-zinc-200/80 p-6 md:p-8 space-y-5">
          <div>
            <h3 class="text-lg font-bold text-zinc-900">추천 예산 배분</h3>
            <p class="text-xs text-zinc-500 mt-0.5">유사한 방 사례들의 지출 비율을 반영했어요.</p>
          </div>

          <div v-if="result.budgetBreakdown.length" class="space-y-4">
            <!-- Stacked Visual Bar -->
            <div class="h-3 w-full rounded-full overflow-hidden flex bg-zinc-100">
              <div
                v-for="(b, idx) in result.budgetBreakdown"
                :key="b.category"
                :style="{ width: `${budgetPercent(b.amount)}%` }"
                :class="barColors[idx % barColors.length]"
              />
            </div>

            <div class="space-y-2.5">
              <div
                v-for="(b, idx) in result.budgetBreakdown"
                :key="b.category"
                class="flex items-center justify-between text-sm py-1.5 border-b border-zinc-100 last:border-none"
              >
                <div class="flex items-center gap-2">
                  <span class="w-2.5 h-2.5 rounded-full" :class="barColors[idx % barColors.length]" />
                  <span class="font-medium text-zinc-700">{{ b.category }}</span>
                  <span class="text-xs text-zinc-400">{{ budgetPercent(b.amount) }}%</span>
                </div>
                <span class="font-semibold text-zinc-900">{{ b.amount.toLocaleString() }}원</span>
              </div>
            </div>
          </div>
          <p v-else class="text-sm text-zinc-500">예산 배분 정보가 아직 없습니다.</p>
        </div>

        <div class="bg-white rounded-3xl border border-zinc-200/80 p-6 md:p-8 space-y-5">
          <div class="flex items-start justify-between gap-3">
            <div>
              <h3 class="text-lg font-bold text-zinc-900">실행 체크리스트</h3>
              <p class="text-xs text-zinc-500 mt-0.5">내 공간에 담아두고 하나씩 완료해 보세요.</p>
            </div>
            <button
              v-if="result.checklistDraft.length"
              type="button"
              :disabled="savingChecklist || Boolean(savedChecklistId)"
              class="px-4 py-2 rounded-full bg-zinc-900 text-white text-xs font-semibold hover:bg-zinc-800 active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed transition shrink-0"
              @click="saveAsChecklist"
            >
              {{ savedChecklistId ? '담기 완료' : savingChecklist ? '저장 중...' : '내 체크리스트로 담기' }}
            </button>
          </div>

          <ul v-if="result.checklistDraft.length" class="space-y-2.5">
            <li
              v-for="step in result.checklistDraft"
              :key="step.stepOrder"
              class="p-3.5 rounded-2xl bg-[#FAF9F6] border border-zinc-200/70 text-sm flex justify-between gap-3"
            >
              <div class="min-w-0">
                <span class="font-semibold text-[#8C583A] mr-1.5">{{ step.stepOrder }}.</span>
                <span class="text-zinc-800">{{ step.content }}</span>
              </div>
              <span class="text-xs font-medium text-zinc-500 shrink-0">
                {{ step.estimatedCost.toLocaleString() }}원
              </span>
            </li>
          </ul>
          <p v-else class="text-sm text-zinc-500">체크리스트 초안이 없습니다.</p>
        </div>
      </div>

      <!-- Real Room Citations -->
      <div class="bg-white rounded-3xl border border-zinc-200/80 p-6 md:p-8 space-y-5">
        <h3 class="text-lg font-bold text-zinc-900">비슷한 조건의 실제 방 사례</h3>
        <div v-if="result.citations.length" class="grid sm:grid-cols-2 md:grid-cols-3 gap-5">
          <NuxtLink
            v-for="c in result.citations"
            :key="`${c.sourceType}-${c.sourceId}`"
            :to="c.sourceType === 'RECIPE' ? `/recipes/${c.sourceId}` : '/recipes'"
            class="group block rounded-2xl border border-zinc-200 overflow-hidden hover:border-zinc-900 transition"
          >
            <div v-if="c.thumbnailUrl" class="aspect-[4/3] bg-zinc-200 overflow-hidden">
              <img :src="c.thumbnailUrl" :alt="c.title" class="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
            </div>
            <div class="p-4 space-y-1 min-w-0">
              <span class="text-[11px] font-semibold text-[#8C583A]">
                {{ c.sourceType === 'RECIPE' ? '실제 방 레시피' : '스타일 가이드' }}
              </span>
              <h4 class="font-semibold text-sm text-zinc-900 line-clamp-2">{{ c.title }}</h4>
              <p v-if="c.budget !== null" class="text-xs font-medium text-zinc-500 pt-1">
                예산 {{ c.budget.toLocaleString() }}원
              </p>
            </div>
          </NuxtLink>
        </div>
        <div v-else class="text-center py-8 space-y-3">
          <p class="text-sm text-zinc-500">아직 등록된 유사 사례가 없습니다.</p>
          <NuxtLink to="/recipes" class="inline-block px-4 py-2 rounded-full border border-zinc-300 text-xs font-semibold">
            전체 레시피 둘러보기
          </NuxtLink>
        </div>
      </div>
    </div>

    <!-- Initial Empty Guide -->
    <div v-else class="bg-white rounded-3xl border border-zinc-200/80 p-12 text-center space-y-3">
      <p class="text-sm text-zinc-600">평수, 계약 형태(전세·월세), 예산을 입력하면 딱 맞는 방 레시피를 찾아드려요.</p>
      <button
        type="button"
        class="px-4 py-2 rounded-full bg-zinc-100 text-xs font-semibold text-zinc-800 hover:bg-zinc-200"
        @click="queryInput = '전세 6평 북향 원룸 무타공 50만원 따뜻하게'; runSearch()"
      >
        예시 조건으로 바로 찾아보기
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { RagSearchResponse } from '~/types/api'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()
const ui = useUiStore()
const { request } = useApi()

const queryInput = ref((route.query.q as string) || '')
const housingType = ref('')
const maxBudget = ref<number | undefined>(undefined)
const isNoDrill = ref<boolean | undefined>(undefined)

const loading = ref(false)
const validationError = ref('')
const errorMsg = ref('')
const result = ref<RagSearchResponse | null>(null)
const savingChecklist = ref(false)
const savedChecklistId = ref<number | null>(null)

const barColors = ['bg-zinc-900', 'bg-[#8C583A]', 'bg-amber-600', 'bg-stone-400']

const totalBreakdown = computed(() =>
  result.value?.budgetBreakdown.reduce((acc: number, b: { amount: number }) => acc + b.amount, 0) || 0
)

function budgetPercent(amount: number) {
  if (!totalBreakdown.value) return 0
  return Math.round((amount / totalBreakdown.value) * 100)
}

async function runSearch() {
  if (!queryInput.value.trim()) {
    validationError.value = '찾고 싶은 방의 조건을 입력해 주세요.'
    return
  }
  validationError.value = ''
  loading.value = true
  errorMsg.value = ''
  savedChecklistId.value = null
  try {
    const filters: Record<string, unknown> = {}
    if (housingType.value) filters.housingType = housingType.value
    if (maxBudget.value !== undefined && maxBudget.value >= 0) filters.maxBudget = maxBudget.value
    if (isNoDrill.value) filters.isNoDrill = true

    result.value = await request<RagSearchResponse>('/api/search/rag', {
      method: 'POST',
      body: {
        query: queryInput.value.trim(),
        filters: Object.keys(filters).length ? filters : null
      }
    })
  } catch (err: any) {
    errorMsg.value = err?.data?.message || '공간을 찾는 중 일시적인 오류가 발생했습니다.'
  } finally {
    loading.value = false
  }
}

async function saveAsChecklist() {
  if (!auth.isLoggedIn) {
    ui.toast('로그인 후 내 체크리스트에 담을 수 있어요.', 'info')
    await router.push('/login')
    return
  }
  if (!result.value) return
  savingChecklist.value = true
  try {
    const created = await request<{ id: number }>('/api/checklists', {
      method: 'POST',
      body: {
        title: queryInput.value.trim().slice(0, 120),
        querySummary: result.value.summary.slice(0, 280),
        targetBudget: maxBudget.value ?? null,
        housingType: housingType.value || null,
        isNoDrill: isNoDrill.value ?? null,
        items: result.value.checklistDraft
      }
    })
    savedChecklistId.value = created.id
    ui.toast('내 공간 체크리스트에 저장했습니다!')
  } catch (err: any) {
    ui.toast(err?.data?.message || '체크리스트 저장에 실패했습니다.', 'error')
  } finally {
    savingChecklist.value = false
  }
}

onMounted(() => {
  if (queryInput.value.trim()) {
    runSearch()
  }
})
</script>
