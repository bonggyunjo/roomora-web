<template>
  <div v-if="recipe" class="max-w-3xl mx-auto space-y-8">
    <article class="bg-white rounded-3xl border border-zinc-200/80 overflow-hidden">
      <div v-if="recipe.images.length" class="aspect-[16/10] bg-zinc-200">
        <img :src="recipe.images[0]" :alt="recipe.title" class="w-full h-full object-cover" />
      </div>

      <div class="p-6 md:p-10 space-y-6">
        <div class="flex flex-wrap gap-2 text-xs">
          <span class="px-3 py-1 rounded-full bg-zinc-100 text-zinc-800 font-medium">
            {{ recipe.housingType }} · {{ recipe.areaPyeong }}평 · {{ recipe.contractType }}
          </span>
          <span v-if="recipe.isNoDrill" class="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 font-medium">
            무타공
          </span>
          <span class="px-3 py-1 rounded-full bg-[#FAF9F6] border border-zinc-200 text-zinc-900 font-semibold">
            예산 {{ recipe.budget.toLocaleString() }}원
          </span>
        </div>

        <h1 class="text-2xl md:text-3xl font-bold tracking-tight text-zinc-900 break-words">
          {{ recipe.title }}
        </h1>

        <div class="flex flex-wrap items-center justify-between gap-3 py-4 border-y border-zinc-100 text-sm">
          <NuxtLink :to="`/users/${recipe.authorId}`" class="font-semibold text-zinc-800 hover:text-[#8C583A]">
            by {{ recipe.authorNickname }}
          </NuxtLink>
          <div class="flex items-center gap-2">
            <button
              type="button"
              class="px-3.5 py-1.5 rounded-full border text-xs font-semibold active:scale-[0.98] transition"
              :class="recipe.likedByMe ? 'bg-rose-50 border-rose-300 text-rose-700' : 'border-zinc-300 text-zinc-700 hover:bg-zinc-50'"
              @click="toggleLike"
            >
              ♥ 좋아요 {{ recipe.likeCount }}
            </button>
            <button
              type="button"
              class="px-3.5 py-1.5 rounded-full border text-xs font-semibold active:scale-[0.98] transition"
              :class="recipe.scrappedByMe ? 'bg-zinc-900 border-zinc-900 text-white' : 'border-zinc-300 text-zinc-700 hover:bg-zinc-50'"
              @click="toggleScrap"
            >
              ★ 북마크 {{ recipe.scrapCount }}
            </button>
            <button
              v-if="auth.user?.id === recipe.authorId"
              type="button"
              class="px-3.5 py-1.5 rounded-full border border-red-200 text-xs font-semibold text-red-600 hover:bg-red-50 active:scale-[0.98]"
              @click="deleteRecipe"
            >
              삭제
            </button>
          </div>
        </div>

        <div class="whitespace-pre-line text-zinc-700 leading-relaxed text-sm md:text-base break-words">
          {{ recipe.content }}
        </div>

        <div v-if="recipe.items.length" class="pt-4 space-y-3">
          <h2 class="text-base font-bold text-zinc-900">사용한 가구·소품</h2>
          <div class="divide-y divide-zinc-100 border border-zinc-200 rounded-2xl">
            <div
              v-for="item in recipe.items"
              :key="item.id || item.itemName"
              class="px-4 py-3 flex justify-between text-sm gap-4"
            >
              <span class="min-w-0 break-words text-zinc-800">
                <span class="text-xs text-[#8C583A] font-semibold mr-1.5">[{{ item.category }}]</span>
                {{ item.itemName }}
              </span>
              <span class="font-semibold text-zinc-900 shrink-0">{{ item.price.toLocaleString() }}원</span>
            </div>
          </div>
        </div>
      </div>
    </article>

    <!-- Comments -->
    <CommentSection :endpoint="`/api/recipes/${id}/comments`" />
  </div>
</template>

<script setup lang="ts">
import type { RecipeDetail } from '~/types/api'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()
const ui = useUiStore()
const { request, baseUrl } = useApi()

const id = route.params.id
const { data: recipe } = await useFetch<RecipeDetail>(`${baseUrl}/api/recipes/${id}`)

async function toggleLike() {
  if (!auth.isLoggedIn) {
    ui.toast('로그인 후 좋아요를 누를 수 있어요.', 'info')
    return router.push('/login')
  }
  const res = await request<{ active: boolean; count: number }>(`/api/recipes/${id}/like`, { method: 'POST' })
  if (recipe.value) {
    recipe.value.likedByMe = res.active
    recipe.value.likeCount = res.count
  }
  ui.toast(res.active ? '좋아요를 눌렀습니다.' : '좋아요를 취소했습니다.', 'info')
}

async function toggleScrap() {
  if (!auth.isLoggedIn) {
    ui.toast('로그인 후 북마크할 수 있어요.', 'info')
    return router.push('/login')
  }
  const res = await request<{ active: boolean; count: number }>(`/api/recipes/${id}/scrap`, { method: 'POST' })
  if (recipe.value) {
    recipe.value.scrappedByMe = res.active
    recipe.value.scrapCount = res.count
  }
  ui.toast(res.active ? '북마크함에 저장했습니다.' : '북마크를 해제했습니다.', 'info')
}

async function deleteRecipe() {
  const ok = await ui.confirm('레시피 삭제', '이 레시피를 삭제하시겠습니까? 삭제 후 복구할 수 없습니다.')
  if (!ok) return
  await request(`/api/recipes/${id}`, { method: 'DELETE' })
  ui.toast('레시피가 삭제되었습니다.', 'info')
  await router.push('/recipes')
}
</script>
