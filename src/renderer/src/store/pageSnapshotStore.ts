import { create } from 'zustand'

type PageSnapshot = {
  data?: any
  error?: string | null
  updatedAt?: string
}

type PageSnapshotStore = {
  pages: Record<string, PageSnapshot>
  setPageSnapshot: (key: string, snapshot: PageSnapshot) => void
}

export const usePageSnapshotStore = create<PageSnapshotStore>((set) => ({
  pages: {},
  setPageSnapshot: (key, snapshot) =>
    set((state) => ({
      pages: {
        ...state.pages,
        [key]: {
          ...state.pages[key],
          ...snapshot
        }
      }
    }))
}))

