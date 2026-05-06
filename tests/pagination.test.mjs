import assert from 'node:assert/strict'
import { test } from 'node:test'

import { getPaginationState, paginateItems } from '../lib/pagination.js'

test('getPaginationState clamps page and calculates page count', () => {
  assert.deepEqual(getPaginationState({ totalItems: 95, page: 20, pageSize: 20 }), {
    page: 5,
    pageCount: 5,
    pageSize: 20,
    totalItems: 95,
  })
})

test('paginateItems returns the current page slice', () => {
  assert.deepEqual(
    paginateItems([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11], {
      page: 2,
      pageSize: 10,
    }),
    [11]
  )
})
