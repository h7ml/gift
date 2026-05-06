import assert from 'node:assert/strict'
import { test } from 'node:test'

import { formatChineseMoney } from '../lib/chinese-money.js'

test('formatChineseMoney converts integer yuan to uppercase RMB text', () => {
  assert.equal(formatChineseMoney(800), '捌佰元整')
  assert.equal(formatChineseMoney(1002003), '壹佰万零贰仟零叁元整')
})

test('formatChineseMoney converts decimal amounts', () => {
  assert.equal(formatChineseMoney(12.3), '壹拾贰元叁角')
  assert.equal(formatChineseMoney(12.05), '壹拾贰元零伍分')
  assert.equal(formatChineseMoney(0.5), '伍角')
})

test('formatChineseMoney rejects invalid amounts', () => {
  assert.equal(formatChineseMoney(Number.NaN), '')
  assert.equal(formatChineseMoney(-1), '')
})
