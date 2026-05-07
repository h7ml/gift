import assert from 'node:assert/strict'
import { test } from 'node:test'

import {
  formatDisplayChineseMoney,
  formatDisplayMoney,
} from '../lib/money-display.js'

test('formatDisplayMoney returns plaintext money when unmasked', () => {
  assert.equal(formatDisplayMoney(12345, false), '¥12,345')
})

test('formatDisplayMoney masks money when requested', () => {
  assert.equal(formatDisplayMoney(12345, true), '¥***')
})

test('formatDisplayChineseMoney returns plaintext uppercase money when unmasked', () => {
  assert.equal(formatDisplayChineseMoney(1200, false), '壹仟贰佰元整')
})

test('formatDisplayChineseMoney masks uppercase money when requested', () => {
  assert.equal(formatDisplayChineseMoney(1200, true), '***')
})
