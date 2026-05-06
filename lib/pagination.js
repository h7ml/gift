export const PAGE_SIZE_OPTIONS = [10, 20, 50, 100]

export function getPaginationState({ totalItems, page, pageSize }) {
  const safePageSize = PAGE_SIZE_OPTIONS.includes(pageSize) ? pageSize : 10
  const pageCount = Math.max(1, Math.ceil(totalItems / safePageSize))
  const safePage = Math.min(Math.max(1, page), pageCount)

  return {
    page: safePage,
    pageCount,
    pageSize: safePageSize,
    totalItems,
  }
}

export function paginateItems(items, { page, pageSize }) {
  const state = getPaginationState({
    totalItems: items.length,
    page,
    pageSize,
  })
  const start = (state.page - 1) * state.pageSize

  return items.slice(start, start + state.pageSize)
}
