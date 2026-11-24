<template>
  <div class="space-y-8">
    <div v-if="profile" class="bg-white rounded-3xl border border-zinc-200/80 p-6 md:p-8 flex flex-wrap items-center justify-between gap-4">
      <div>
        <p class="text-xs font-semibold text-[#8C583A] mb-1">MY SPACE</p>
        <h1 class="text-2xl font-bold text-zinc-900">{{ profile.nickname }}</h1>
        <p class="text-xs text-zinc-500 mt-0.5">
          {{ profile.email }} · {{ providerLabel(profile.provider) }}
        </p>
        <p v-if="profile.bio" class="text-sm text-zinc-700 mt-2">{{ profile.bio }}</p>
      </div>
      <div class="flex gap-8 text-center">
        <button type="button" class="hover:opacity-75 transition" @click="openFollowModal('followers')">
          <div class="font-bold text-xl text-zinc-900">{{ profile.followerCount }}</div>
          <div class="text-xs text-zinc-500">팔로워</div>
        </button>
        <button type="button" class="hover:opacity-75 transition" @click="openFollowModal('followings')">
          <div class="font-bold text-xl text-zinc-900">{{ profile.followingCount }}</div>
          <div class="text-xs text-zinc-500">팔로잉</div>
        </button>
      </div>
    </div>

    <FollowListModal
      v-if="profile"
      :open="followModalOpen"
      :user-id="profile.id"
      :mode="followModalMode"
      @close="followModalOpen = false"
    />

    <!-- Tabs -->
    <div class="flex flex-wrap gap-2 border-b border-zinc-200 pb-3 text-xs md:text-sm font-medium">
      <button
        v-for="tab in tabs"
        :key="tab.key"
        type="button"
        class="px-4 py-2 rounded-full active:scale-[0.98] transition"
        :class="activeTab === tab.key ? 'bg-zinc-900 text-white' : 'bg-white border border-zinc-200 text-zinc-600 hover:text-zinc-900'"
        @click="selectTab(tab.key)"
      >
        {{ tab.label }}
      </button>
    </div>

    <!-- Checklists -->
    <div v-if="activeTab === 'checklists'" class="space-y-4">
      <div v-if="!checklists.length" class="bg-white rounded-3xl border border-zinc-200 p-12 text-center space-y-3">
        <p class="text-sm text-zinc-600">아직 담아둔 체크리스트가 없습니다.</p>
        <NuxtLink to="/search" class="inline-block px-5 py-2.5 rounded-full bg-zinc-900 text-white text-xs font-semibold">
          내 조건으로 공간 찾으러 가기
        </NuxtLink>
      </div>

      <div
        v-for="cl in checklists"
        :key="cl.id"
        class="bg-white rounded-3xl border border-zinc-200/80 p-6 space-y-4"
      >
        <div class="flex items-start justify-between gap-4">
          <div class="min-w-0">
            <h3 class="font-bold text-base text-zinc-900 line-clamp-1">{{ cl.title }}</h3>
            <p class="text-xs text-zinc-500 mt-0.5">
              완료 {{ cl.progressPercent }}% ({{ cl.completedCount }}/{{ cl.totalCount }})
            </p>
          </div>
          <div class="flex items-center gap-3 shrink-0">
            <button
              type="button"
              class="text-xs font-semibold text-zinc-800 hover:underline"
              @click="loadChecklistDetail(cl.id)"
            >
              {{ selectedChecklist?.id === cl.id ? '접기' : '항목 열기' }}
            </button>
            <button
              type="button"
              class="text-xs font-semibold text-red-600 hover:underline"
              @click="deleteChecklist(cl.id)"
            >
              삭제
            </button>
          </div>
        </div>

        <div class="w-full h-2 bg-zinc-100 rounded-full overflow-hidden">
          <div class="h-full bg-zinc-900 transition-all duration-300" :style="{ width: `${cl.progressPercent}%` }" />
        </div>

        <ul v-if="selectedChecklist?.id === cl.id" class="space-y-2 pt-2">
          <li
            v-for="item in selectedChecklist.items"
            :key="item.id"
            class="flex items-center justify-between gap-3 p-3.5 rounded-2xl bg-[#FAF9F6] border border-zinc-200/70 text-sm"
          >
            <label class="flex items-center gap-2.5 cursor-pointer min-w-0">
              <input
                type="checkbox"
                :checked="item.isChecked"
                @change="toggleChecklistItem(cl.id, item.id, !item.isChecked)"
              />
              <span class="break-words" :class="{ 'line-through text-zinc-400': item.isChecked }">
                [{{ item.category }}] {{ item.content }}
              </span>
            </label>
            <span class="text-xs font-medium text-zinc-500 shrink-0">{{ item.estimatedCost.toLocaleString() }}원</span>
          </li>
        </ul>
      </div>
    </div>

    <!-- Activity Lists -->
    <div v-else class="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
      <div
        v-for="entry in listItems"
        :key="entry.id || entry.postId"
        class="bg-white rounded-2xl border border-zinc-200/80 p-5 space-y-1.5"
      >
        <div class="font-semibold text-sm text-zinc-900 line-clamp-2">{{ entry.title }}</div>
        <div class="text-xs text-zinc-500">
          {{ entry.budget ? `${entry.budget.toLocaleString()}원` : entry.authorNickname || '' }}
        </div>
      </div>
      <div v-if="!listItems.length" class="col-span-full bg-white rounded-3xl border border-zinc-200 p-12 text-center text-sm text-zinc-500">
        아직 기록된 활동이 없습니다.
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ChecklistDetail, ChecklistSummary } from '~/types/api'

interface ProfileMe {
  id: number
  email: string
  nickname: string
  bio: string | null
  provider: string
  followerCount: number
  followingCount: number
}

const auth = useAuthStore()
const ui = useUiStore()
const router = useRouter()
const { request } = useApi()

const profile = ref<ProfileMe | null>(null)
const activeTab = ref('checklists')
const checklists = ref<ChecklistSummary[]>([])
const selectedChecklist = ref<ChecklistDetail | null>(null)
const listItems = ref<any[]>([])

const tabs = [
  { key: 'checklists', label: '내 체크리스트' },
  { key: 'recipes', label: '내가 쓴 레시피' },
  { key: 'likes', label: '좋아요한 글' },
  { key: 'scraps_recipe', label: '레시피 북마크' },
  { key: 'scraps_contest', label: '콘테스트 북마크' }
]

async function selectTab(key: string) {
  activeTab.value = key
  if (key === 'checklists') {
    checklists.value = await request<ChecklistSummary[]>('/api/checklists')
  } else if (key === 'recipes') {
    const res = await request<{ items: any[] }>('/api/mypage/recipes')
    listItems.value = res.items
  } else if (key === 'likes') {
    const res = await request<{ items: any[] }>('/api/mypage/likes/recipes')
    listItems.value = res.items
  } else if (key === 'scraps_recipe') {
    const res = await request<{ items: any[] }>('/api/mypage/scraps?type=RECIPE')
    listItems.value = res.items
  } else if (key === 'scraps_contest') {
    const res = await request<{ items: any[] }>('/api/mypage/scraps?type=CONTEST')
    listItems.value = res.items
  }
}

async function loadChecklistDetail(id: number) {
  if (selectedChecklist.value?.id === id) {
    selectedChecklist.value = null
    return
  }
  selectedChecklist.value = await request<ChecklistDetail>(`/api/checklists/${id}`)
}

async function toggleChecklistItem(checklistId: number, itemId: number, isChecked: boolean) {
  selectedChecklist.value = await request<ChecklistDetail>(`/api/checklists/${checklistId}/items/${itemId}`, {
    method: 'PATCH',
    body: { isChecked }
  })
  checklists.value = await request<ChecklistSummary[]>('/api/checklists')
  ui.toast(isChecked ? '항목을 완료했습니다!' : '완료 상태를 해제했습니다.', 'info')
}

async function deleteChecklist(id: number) {
  const ok = await ui.confirm('체크리스트 삭제', '저장된 체크리스트를 삭제하시겠습니까?')
  if (!ok) return
  await request(`/api/checklists/${id}`, { method: 'DELETE' })
  checklists.value = checklists.value.filter((c: ChecklistSummary) => c.id !== id)
  if (selectedChecklist.value?.id === id) selectedChecklist.value = null
  ui.toast('체크리스트를 삭제했습니다.', 'info')
}

const followModalOpen = ref(false)
const followModalMode = ref<'followers' | 'followings'>('followers')

function openFollowModal(mode: 'followers' | 'followings') {
  followModalMode.value = mode
  followModalOpen.value = true
}

function providerLabel(provider: string) {
  const map: Record<string, string> = { LOCAL: '이메일 가입', KAKAO: '카카오', GOOGLE: 'Google' }
  return map[provider] || provider
}

onMounted(async () => {
  if (!auth.isLoggedIn) {
    await router.push('/login')
    return
  }
  profile.value = await request<ProfileMe>('/api/users/me')
  await selectTab('checklists')
})
</script>
