export interface UserSummary {
  id: number
  email: string
  nickname: string
  profileImageUrl: string | null
  provider: 'LOCAL' | 'KAKAO' | 'GOOGLE'
  role: 'USER' | 'ADMIN'
}

export interface AuthTokenResponse {
  accessToken: string
  refreshToken: string
  user: UserSummary
}

export interface RecipeSummary {
  id: number
  authorId: number
  authorNickname: string
  title: string
  housingType: string
  areaPyeong: number
  contractType: string
  isNoDrill: boolean
  budget: number
  styleTag: string
  thumbnailUrl: string | null
  likeCount: number
  scrapCount: number
  viewCount: number
  createdAt: string
}

export interface RecipePageResponse {
  items: RecipeSummary[]
  nextCursor: number | null
  hasNext: boolean
}

export interface RecipeItemDto {
  id?: number
  itemName: string
  category: string
  price: number
  purchaseNote?: string | null
}

export interface RecipeDetail extends RecipeSummary {
  content: string
  images: string[]
  items: RecipeItemDto[]
  likedByMe: boolean
  scrappedByMe: boolean
  updatedAt: string
}

export interface RagCitation {
  sourceType: 'RECIPE' | 'GUIDE' | 'CONTEST'
  sourceId: number
  title: string
  thumbnailUrl: string | null
  budget: number | null
}

export interface BudgetAllocation {
  category: string
  amount: number
}

export interface ChecklistDraftItem {
  stepOrder: number
  category: string
  content: string
  estimatedCost: number
}

export interface RagSearchResponse {
  fallback: boolean
  relaxed: boolean
  summary: string
  warnings: string[]
  budgetBreakdown: BudgetAllocation[]
  citations: RagCitation[]
  checklistDraft: ChecklistDraftItem[]
}

export interface ContestRound {
  id: number
  roundNo: number
  title: string
  themeDescription: string
  status: 'UPCOMING' | 'ACTIVE' | 'CLOSED'
  startAt: string
  endAt: string
}

export interface ContestRankingItem {
  rank: number
  postId: number
  title: string
  thumbnailUrl: string | null
  authorId: number
  authorNickname: string
  voteCount: number
}

export interface ContestPostDetail {
  id: number
  roundId: number
  authorId: number
  authorNickname: string
  title: string
  content: string
  thumbnailUrl: string | null
  images: string[]
  voteCount: number
  scrapCount: number
  finalRank: number | null
  votedByMe: boolean
  scrappedByMe: boolean
  createdAt: string
}

export interface ChecklistSummary {
  id: number
  title: string
  querySummary: string | null
  targetBudget: number | null
  housingType: string | null
  isNoDrill: boolean | null
  completedCount: number
  totalCount: number
  progressPercent: number
  createdAt: string
}

export interface ChecklistItem {
  id: number
  stepOrder: number
  category: string
  content: string
  estimatedCost: number
  isChecked: boolean
  memo: string | null
}

export interface ChecklistDetail extends ChecklistSummary {
  items: ChecklistItem[]
}

export interface CommentItem {
  id: number
  parentId: number | null
  authorId?: number
  authorNickname: string
  content: string
  createdAt: string
}

export interface FollowUserItem {
  userId: number
  nickname: string
  profileImageUrl: string | null
  bio: string | null
}

export interface PagedListResponse<T> {
  items: T[]
  page: number
  size: number
  totalElements: number
  hasNext: boolean
}
