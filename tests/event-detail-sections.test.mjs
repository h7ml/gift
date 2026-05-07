import assert from 'node:assert/strict'
import { test } from 'node:test'

import { getEventDetailSections } from '../lib/event-detail-sections.js'

test('overview combines gift entry and gift records in the ledger workspace', () => {
  assert.deepEqual(getEventDetailSections('overview'), {
    showWorkspace: true,
    showStatistics: true,
    showNotes: true,
    showRecords: false,
    showSectionLinks: true,
  })
})

test('records section keeps the full records management table', () => {
  assert.deepEqual(getEventDetailSections('records'), {
    showWorkspace: false,
    showStatistics: false,
    showNotes: false,
    showRecords: true,
    showSectionLinks: false,
  })
})

test('notes section only shows event notes content', () => {
  assert.deepEqual(getEventDetailSections('notes'), {
    showWorkspace: false,
    showStatistics: false,
    showNotes: true,
    showRecords: false,
    showSectionLinks: false,
  })
})
