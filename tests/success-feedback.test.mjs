import assert from 'node:assert/strict'
import { test } from 'node:test'

import { speakSuccessMessage } from '../lib/success-feedback.js'

test('speakSuccessMessage does nothing without speech synthesis support', () => {
  assert.doesNotThrow(() => speakSuccessMessage('保存成功', {}))
})

test('speakSuccessMessage speaks the success message when supported', () => {
  const spoken = []
  const speech = {
    cancel() {
      spoken.push('cancel')
    },
    speak(utterance) {
      spoken.push(utterance)
    },
  }
  const win = {
    speechSynthesis: speech,
    SpeechSynthesisUtterance: class {
      constructor(text) {
        this.text = text
      }
    },
  }

  speakSuccessMessage('保存成功', win)

  assert.equal(spoken[0], 'cancel')
  assert.equal(spoken[1].text, '保存成功')
  assert.equal(spoken[1].lang, 'zh-CN')
  assert.equal(spoken[1].rate, 1)
})
