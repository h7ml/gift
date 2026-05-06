import assert from 'node:assert/strict'
import { test } from 'node:test'

import { APP_TITLE, buildPageTitle } from '../lib/page-title.js'

test('buildPageTitle returns app title when page title is empty', () => {
  assert.equal(buildPageTitle(''), APP_TITLE)
  assert.equal(buildPageTitle('   '), APP_TITLE)
})

test('buildPageTitle appends app title for specific pages', () => {
  assert.equal(buildPageTitle('登录'), '登录 - 中国礼薄')
  assert.equal(buildPageTitle('婚礼礼薄'), '婚礼礼薄 - 中国礼薄')
})
