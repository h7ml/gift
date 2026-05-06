export const PAGE_SIZE_OPTIONS: number[]

export interface PaginationInput {
  totalItems: number
  page: number
  pageSize: number
}

export interface PaginationState {
  page: number
  pageCount: number
  pageSize: number
  totalItems: number
}

export function getPaginationState(input: PaginationInput): PaginationState

export function paginateItems<T>(
  items: T[],
  input: { page: number; pageSize: number }
): T[]
