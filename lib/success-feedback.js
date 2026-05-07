import { toast } from 'sonner'

export function notifySuccess(message, options = {}) {
  toast.success(message)
  speakSuccessMessage(message, globalThis.window, options.voiceURI)
}

export function speakSuccessMessage(
  message,
  targetWindow = globalThis.window,
  voiceURI = null
) {
  if (
    !targetWindow?.speechSynthesis ||
    !targetWindow?.SpeechSynthesisUtterance
  ) {
    return
  }

  const utterance = new targetWindow.SpeechSynthesisUtterance(message)
  utterance.lang = 'zh-CN'
  utterance.rate = 1
  const voice = findSpeechVoice(targetWindow, voiceURI)

  if (voice) {
    utterance.voice = voice
    utterance.lang = voice.lang || utterance.lang
  }

  targetWindow.speechSynthesis.cancel()
  targetWindow.speechSynthesis.speak(utterance)
}

function findSpeechVoice(targetWindow, voiceURI) {
  if (!voiceURI || typeof targetWindow.speechSynthesis.getVoices !== 'function') {
    return null
  }

  return (
    targetWindow.speechSynthesis
      .getVoices()
      .find((voice) => voice.voiceURI === voiceURI) ?? null
  )
}
