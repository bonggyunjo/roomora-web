<template>
  <div class="max-w-2xl mx-auto bg-white rounded-3xl border border-zinc-200/80 p-6 md:p-10 space-y-6">
    <div>
      <p class="text-xs font-semibold text-[#8C583A] mb-1">SHARE YOUR SPACE</p>
      <h1 class="text-2xl font-bold text-zinc-900">내 방 레시피 올리기</h1>
    </div>

    <form class="space-y-5 text-sm" @submit.prevent="submitRecipe">
      <div>
        <label class="block font-medium text-zinc-800 mb-1.5">제목</label>
        <input
          v-model="form.title"
          placeholder="예: 전세 6평 원룸 40만원 무타공 꾸미기"
          class="w-full px-4 py-2.5 rounded-xl border border-zinc-300 focus:outline-none focus:border-zinc-900"
        />
        <p v-if="errors.title" class="text-xs text-red-600 mt-1">{{ errors.title }}</p>
      </div>

      <div class="grid grid-cols-2 gap-4">
        <div>
          <label class="block font-medium text-zinc-800 mb-1.5">주거형태</label>
          <select v-model="form.housingType" class="w-full px-3 py-2.5 rounded-xl border border-zinc-300 bg-white">
            <option value="ONE_ROOM">원룸</option>
            <option value="TWO_ROOM">투룸</option>
            <option value="OFFICETEL">오피스텔</option>
            <option value="APARTMENT">아파트</option>
          </select>
        </div>
        <div>
          <label class="block font-medium text-zinc-800 mb-1.5">평수</label>
          <input v-model.number="form.areaPyeong" type="number" class="w-full px-3 py-2.5 rounded-xl border border-zinc-300" />
          <p v-if="errors.areaPyeong" class="text-xs text-red-600 mt-1">{{ errors.areaPyeong }}</p>
        </div>
        <div>
          <label class="block font-medium text-zinc-800 mb-1.5">계약형태</label>
          <select v-model="form.contractType" class="w-full px-3 py-2.5 rounded-xl border border-zinc-300 bg-white">
            <option value="JEONSE">전세</option>
            <option value="MONTHLY">월세</option>
            <option value="OWNED">자가</option>
          </select>
        </div>
        <div>
          <label class="block font-medium text-zinc-800 mb-1.5">총 예산 (원)</label>
          <input v-model.number="form.budget" type="number" class="w-full px-3 py-2.5 rounded-xl border border-zinc-300" />
          <p v-if="errors.budget" class="text-xs text-red-600 mt-1">{{ errors.budget }}</p>
        </div>
      </div>

      <div class="flex items-center gap-4">
        <select v-model="form.styleTag" class="px-3 py-2 rounded-xl border border-zinc-300 bg-white">
          <option value="WOOD">우드</option>
          <option value="MINIMAL">미니멀</option>
          <option value="MODERN">모던</option>
          <option value="NATURAL">내추럴</option>
        </select>
        <label class="flex items-center gap-2 cursor-pointer select-none">
          <input v-model="form.isNoDrill" type="checkbox" />
          <span>무타공 시공</span>
        </label>
      </div>

      <div>
        <label class="block font-medium text-zinc-800 mb-1.5">공간 설명 및 배치 팁</label>
        <textarea
          v-model="form.content"
          rows="6"
          placeholder="조명, 커튼, 수납 등 어떤 기준으로 꾸몄는지 자유롭게 적어주세요."
          class="w-full px-4 py-2.5 rounded-xl border border-zinc-300 focus:outline-none focus:border-zinc-900"
        />
        <p v-if="errors.content" class="text-xs text-red-600 mt-1">{{ errors.content }}</p>
      </div>

      <button
        type="submit"
        :disabled="submitting"
        class="w-full py-3 rounded-xl bg-zinc-900 text-white font-semibold hover:bg-zinc-800 active:scale-[0.98] disabled:opacity-40 transition"
      >
        {{ submitting ? '등록 중...' : '레시피 등록하기' }}
      </button>
    </form>
  </div>
</template>

<script setup lang="ts">
const auth = useAuthStore()
const ui = useUiStore()
const router = useRouter()
const { request } = useApi()

const form = reactive({
  title: '',
  content: '',
  housingType: 'ONE_ROOM',
  areaPyeong: 6,
  contractType: 'JEONSE',
  isNoDrill: true,
  budget: 500000,
  styleTag: 'WOOD'
})

const errors = reactive({ title: '', areaPyeong: '', budget: '', content: '' })
const submitting = ref(false)

function validate() {
  errors.title = form.title.trim().length < 2 ? '제목을 2자 이상 입력해 주세요.' : ''
  errors.areaPyeong = form.areaPyeong <= 0 ? '평수는 1평 이상이어야 합니다.' : ''
  errors.budget = form.budget < 0 ? '예산은 0원 이상이어야 합니다.' : ''
  errors.content = form.content.trim().length < 10 ? '본문을 10자 이상 작성해 주세요.' : ''
  return !errors.title && !errors.areaPyeong && !errors.budget && !errors.content
}

async function submitRecipe() {
  if (!auth.isLoggedIn) {
    ui.toast('로그인 후 작성할 수 있습니다.', 'info')
    return router.push('/login')
  }
  if (!validate()) return
  submitting.value = true
  try {
    const created = await request<{ id: number }>('/api/recipes', {
      method: 'POST',
      body: { ...form, images: [], items: [] }
    })
    ui.toast('레시피가 등록되었습니다!')
    await router.push(`/recipes/${created.id}`)
  } catch (err: any) {
    ui.toast(err?.data?.message || '등록에 실패했습니다.', 'error')
  } finally {
    submitting.value = false
  }
}
</script>
