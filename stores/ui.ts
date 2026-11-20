import { defineStore } from 'pinia'

export interface ToastMessage {
  id: number
  text: string
  type: 'success' | 'error' | 'info'
}

export const useUiStore = defineStore('ui', () => {
  const toasts = ref<ToastMessage[]>([])
  let nextId = 1

  const confirmState = reactive({
    open: false,
    title: '',
    message: '',
    confirmLabel: '확인',
    resolve: null as ((val: boolean) => void) | null
  })

  function toast(text: string, type: ToastMessage['type'] = 'success') {
    const id = nextId++
    toasts.value.push({ id, text, type })
    setTimeout(() => {
      toasts.value = toasts.value.filter((t: ToastMessage) => t.id !== id)
    }, 3000)
  }

  function confirm(title: string, message: string, confirmLabel = '삭제'): Promise<boolean> {
    confirmState.title = title
    confirmState.message = message
    confirmState.confirmLabel = confirmLabel
    confirmState.open = true
    return new Promise((resolve) => {
      confirmState.resolve = resolve
    })
  }

  function resolveConfirm(result: boolean) {
    confirmState.open = false
    if (confirmState.resolve) {
      confirmState.resolve(result)
      confirmState.resolve = null
    }
  }

  return {
    toasts,
    confirmState,
    toast,
    confirm,
    resolveConfirm
  }
})
