<template>
  <div v-if="profile" class="max-w-3xl mx-auto space-y-6">
    <div class="bg-white rounded-3xl border border-zinc-200/80 p-6 md:p-8 flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-zinc-900">{{ profile.nickname }}</h1>
        <p v-if="profile.bio" class="text-sm text-zinc-600 mt-1">{{ profile.bio }}</p>
        <div class="flex items-center gap-3 text-xs text-zinc-500 mt-2">
          <button type="button" class="hover:text-zinc-900 font-medium" @click="openFollowModal('followers')">
            팔로워 <span class="text-zinc-900 font-semibold">{{ profile.followerCount }}</span>
          </button>
          <span>·</span>
          <button type="button" class="hover:text-zinc-900 font-medium" @click="openFollowModal('followings')">
            팔로잉 <span class="text-zinc-900 font-semibold">{{ profile.followingCount }}</span>
          </button>
        </div>
      </div>
      <button
        type="button"
        class="px-5 py-2.5 rounded-full text-xs font-semibold active:scale-[0.98] transition"
        :class="profile.followedByMe ? 'bg-zinc-200 text-zinc-800' : 'bg-zinc-900 text-white hover:bg-zinc-800'"
        @click="toggleFollow"
      >
        {{ profile.followedByMe ? '팔로잉' : '팔로우' }}
      </button>
    </div>

    <FollowListModal
      :open="followModalOpen"
      :user-id="profile.id"
      :mode="followModalMode"
      @close="followModalOpen = false"
    />
  </div>
</template>

<script setup lang="ts">
interface PublicProfile {
  id: number
  nickname: string
  bio: string | null
  followerCount: number
  followingCount: number
  followedByMe: boolean
}

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()
const ui = useUiStore()
const { request, baseUrl } = useApi()

const userId = route.params.id
const { data: profile } = await useFetch<PublicProfile>(`${baseUrl}/api/users/${userId}`)
const followModalOpen = ref(false)
const followModalMode = ref<'followers' | 'followings'>('followers')

function openFollowModal(mode: 'followers' | 'followings') {
  followModalMode.value = mode
  followModalOpen.value = true
}

async function toggleFollow() {
  if (!auth.isLoggedIn) {
    ui.toast('로그인 후 팔로우할 수 있어요.', 'info')
    return router.push('/login')
  }
  try {
    const res = await request<{ following: boolean; followerCount: number }>(`/api/users/${userId}/follow`, {
      method: 'POST'
    })
    if (profile.value) {
      profile.value.followedByMe = res.following
      profile.value.followerCount = res.followerCount
    }
    ui.toast(res.following ? '팔로우했습니다.' : '팔로우를 취소했습니다.', 'info')
  } catch (err: any) {
    ui.toast(err?.data?.message || '요청을 처리할 수 없습니다.', 'error')
  }
}
</script>
