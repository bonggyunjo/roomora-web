<template>
  <section class="bg-white rounded-3xl border border-zinc-200/80 p-6 md:p-8 space-y-5">
    <h2 class="text-base font-bold text-zinc-900">댓글 ({{ comments.length }})</h2>

    <form class="flex gap-2" @submit.prevent="submitComment(null)">
      <input
        v-model="commentInput"
        type="text"
        placeholder="공간에 대한 궁금한 점을 남겨보세요"
        class="flex-1 px-4 py-2.5 rounded-xl border border-zinc-300 text-sm focus:outline-none focus:border-zinc-900"
      />
      <button
        type="submit"
        :disabled="submitting"
        class="px-4 py-2.5 rounded-xl bg-zinc-900 text-white text-sm font-semibold hover:bg-zinc-800 active:scale-[0.98] disabled:opacity-40 transition"
      >
        등록
      </button>
    </form>

    <div v-if="rootComments.length" class="space-y-3">
      <div v-for="parent in rootComments" :key="parent.id" class="space-y-2">
        <div class="p-4 rounded-2xl bg-[#FAF9F6] border border-zinc-200/70 text-sm space-y-2">
          <div class="flex items-center justify-between gap-2 text-xs text-zinc-500">
            <span class="font-semibold text-zinc-800">{{ parent.authorNickname }}</span>
            <div class="flex items-center gap-3">
              <span>{{ new Date(parent.createdAt).toLocaleDateString() }}</span>
              <button
                type="button"
                class="font-semibold text-[#8C583A] hover:underline"
                @click="toggleReply(parent.id)"
              >
                {{ replyingToId === parent.id ? '취소' : '답글' }}
              </button>
              <button
                v-if="auth.user?.id && parent.authorId === auth.user.id"
                type="button"
                class="font-semibold text-red-600 hover:underline"
                @click="deleteComment(parent.id)"
              >
                삭제
              </button>
            </div>
          </div>
          <p class="text-zinc-800 break-words">{{ parent.content }}</p>

          <form
            v-if="replyingToId === parent.id"
            class="flex gap-2 pt-2"
            @submit.prevent="submitComment(parent.id)"
          >
            <input
              v-model="replyInput"
              type="text"
              placeholder="답글을 입력해 주세요"
              class="flex-1 px-3.5 py-2 rounded-xl border border-zinc-300 bg-white text-xs focus:outline-none focus:border-zinc-900"
            />
            <button
              type="submit"
              :disabled="submitting"
              class="px-3.5 py-2 rounded-xl bg-zinc-900 text-white text-xs font-semibold hover:bg-zinc-800 active:scale-[0.98] disabled:opacity-40 transition"
            >
              답글 등록
            </button>
          </form>
        </div>

        <!-- 2-Depth Replies -->
        <div
          v-for="reply in repliesByParent(parent.id)"
          :key="reply.id"
          class="ml-8 p-4 rounded-2xl bg-[#FAF9F6] border border-zinc-200/70 text-sm space-y-1.5"
        >
          <div class="flex items-center justify-between gap-2 text-xs text-zinc-500">
            <span class="font-semibold text-zinc-800">↳ {{ reply.authorNickname }}</span>
            <div class="flex items-center gap-3">
              <span>{{ new Date(reply.createdAt).toLocaleDateString() }}</span>
              <button
                v-if="auth.user?.id && reply.authorId === auth.user.id"
                type="button"
                class="font-semibold text-red-600 hover:underline"
                @click="deleteComment(reply.id)"
              >
                삭제
              </button>
            </div>
          </div>
          <p class="text-zinc-800 break-words">{{ reply.content }}</p>
        </div>
      </div>
    </div>
    <p v-else class="text-xs text-zinc-400 text-center py-4">첫 댓글을 남겨보세요.</p>
  </section>
</template>

<script setup lang="ts">
import type { CommentItem } from '~/types/api'

const props = defineProps<{
  endpoint: string
}>()

const router = useRouter()
const auth = useAuthStore()
const ui = useUiStore()
const { request } = useApi()

const comments = ref<CommentItem[]>([])
const commentInput = ref('')
const replyInput = ref('')
const replyingToId = ref<number | null>(null)
const submitting = ref(false)

const rootComments = computed(() => comments.value.filter((c: CommentItem) => !c.parentId))

function repliesByParent(parentId: number) {
  return comments.value.filter((c: CommentItem) => c.parentId === parentId)
}

function toggleReply(parentId: number) {
  if (!auth.isLoggedIn) {
    ui.toast('로그인 후 답글을 작성할 수 있어요.', 'info')
    router.push('/login')
    return
  }
  replyingToId.value = replyingToId.value === parentId ? null : parentId
  replyInput.value = ''
}

async function loadComments() {
  comments.value = await request<CommentItem[]>(props.endpoint)
}

async function submitComment(parentId: number | null) {
  if (!auth.isLoggedIn) {
    ui.toast('로그인 후 댓글을 작성할 수 있어요.', 'info')
    return router.push('/login')
  }
  const text = (parentId ? replyInput.value : commentInput.value).trim()
  if (!text) {
    ui.toast('댓글 내용을 입력해 주세요.', 'error')
    return
  }
  submitting.value = true
  try {
    await request(props.endpoint, {
      method: 'POST',
      body: { parentId, content: text }
    })
    if (parentId) {
      replyInput.value = ''
      replyingToId.value = null
    } else {
      commentInput.value = ''
    }
    ui.toast(parentId ? '답글을 등록했습니다.' : '댓글을 등록했습니다.')
    await loadComments()
  } catch (err: any) {
    ui.toast(err?.data?.message || '댓글 등록에 실패했습니다.', 'error')
  } finally {
    submitting.value = false
  }
}

async function deleteComment(commentId: number) {
  const ok = await ui.confirm('댓글 삭제', '이 댓글을 삭제하시겠습니까?')
  if (!ok) return
  try {
    await request(`${props.endpoint}/${commentId}`, { method: 'DELETE' })
    ui.toast('댓글이 삭제되었습니다.', 'info')
    await loadComments()
  } catch (err: any) {
    ui.toast(err?.data?.message || '댓글을 삭제할 수 없습니다.', 'error')
  }
}

onMounted(loadComments)
</script>
