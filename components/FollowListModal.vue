<template>
  <div
    v-if="open"
    class="fixed inset-0 z-50 bg-zinc-900/40 backdrop-blur-xs flex items-center justify-center p-4"
    @click.self="$emit('close')"
  >
    <div class="bg-white rounded-3xl border border-zinc-200 w-full max-w-md max-h-[80vh] flex flex-col overflow-hidden shadow-xl">
      <div class="px-6 py-4 border-b border-zinc-100 flex items-center justify-between">
        <h3 class="text-base font-bold text-zinc-900">
          {{ mode === 'followers' ? '팔로워' : '팔로잉' }}
        </h3>
        <button
          type="button"
          class="text-xs font-semibold text-zinc-500 hover:text-zinc-900"
          @click="$emit('close')"
        >
          닫기
        </button>
      </div>

      <div class="p-4 overflow-y-auto space-y-2 flex-1">
        <div v-if="loading && !items.length" class="space-y-2 py-2">
          <div v-for="i in 3" :key="i" class="h-14 rounded-2xl bg-zinc-100 animate-pulse" />
        </div>

        <div v-else-if="items.length" class="space-y-2">
          <NuxtLink
            v-for="u in items"
            :key="u.userId"
            :to="`/users/${u.userId}`"
            class="flex items-center justify-between gap-3 p-3.5 rounded-2xl bg-[#FAF9F6] border border-zinc-200/70 hover:border-zinc-400 transition"
            @click="$emit('close')"
          >
            <div class="min-w-0">
              <p class="text-sm font-semibold text-zinc-900 truncate">{{ u.nickname }}</p>
              <p v-if="u.bio" class="text-xs text-zinc-500 truncate mt-0.5">{{ u.bio }}</p>
            </div>
            <span class="text-xs font-medium text-[#8C583A] shrink-0">프로필 →</span>
          </NuxtLink>

          <button
            v-if="hasNext"
            type="button"
            :disabled="loading"
            class="w-full py-2.5 rounded-xl border border-zinc-300 text-xs font-semibold text-zinc-700 hover:bg-zinc-50 disabled:opacity-40"
            @click="loadMore"
          >
            {{ loading ? '불러오는 중...' : '더 보기' }}
          </button>
        </div>

        <p v-else class="text-xs text-zinc-400 text-center py-8">
          {{ mode === 'followers' ? '아직 팔로워가 없습니다.' : '아직 팔로우한 사용자가 없습니다.' }}
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { FollowUserItem, PagedListResponse } from '~/types/api'

const props = defineProps<{
  open: boolean
  userId: number | string
  mode: 'followers' | 'followings'
}>()

defineEmits<{
  close: []
}>()

const { request } = useApi()
const items = ref<FollowUserItem[]>([])
const page = ref(0)
const hasNext = ref(false)
const loading = ref(false)

async function fetchPage(targetPage: number, append: boolean) {
  if (!props.userId) return
  loading.value = true
  try {
    const res = await request<PagedListResponse<FollowUserItem>>(
      `/api/users/${props.userId}/${props.mode}?page=${targetPage}&size=20`
    )
    items.value = append ? [...items.value, ...res.items] : res.items
    page.value = res.page
    hasNext.value = res.hasNext
  } finally {
    loading.value = false
  }
}

function loadMore() {
  fetchPage(page.value + 1, true)
}

watch(
  () => [props.open, props.mode, props.userId] as const,
  ([isOpen]: readonly [boolean, 'followers' | 'followings', number | string]) => {
    if (isOpen) {
      items.value = []
      fetchPage(0, false)
    }
  }
)
</script>
