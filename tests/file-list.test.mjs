import assert from 'node:assert/strict'
import { test } from 'node:test'

import { filesFromDataTransfer, filesFromFileList } from '../lib/file-list.js'

test('filesFromFileList returns files from nullable file lists', () => {
  const first = new File(['a'], 'a.txt')
  const second = new File(['b'], 'b.txt')

  assert.deepEqual(filesFromFileList([first, second]), [first, second])
  assert.deepEqual(filesFromFileList(null), [])
})

test('filesFromDataTransfer reads file items and ignores non-file items', () => {
  const file = new File(['a'], 'a.txt')
  const dataTransfer = {
    items: [
      { kind: 'string', getAsFile: () => null },
      { kind: 'file', getAsFile: () => file },
      { kind: 'file', getAsFile: () => null },
    ],
    files: [],
  }

  assert.deepEqual(filesFromDataTransfer(dataTransfer), [file])
})

test('filesFromDataTransfer falls back to files when item list is empty', () => {
  const file = new File(['a'], 'a.txt')
  const dataTransfer = {
    items: [],
    files: [file],
  }

  assert.deepEqual(filesFromDataTransfer(dataTransfer), [file])
})
