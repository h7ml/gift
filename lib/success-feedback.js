import { toast } from 'sonner'

export function notifySuccess(message) {
  toast.success(message)
  speakSuccessMessage(message)
}

export function speakSuccessMessage(message, targetWindow = globalThis.window) {
  if (
    !targetWindow?.speechSynthesis ||
    !targetWindow?.SpeechSynthesisUtterance
  ) {
    return
  }

  const utterance = new targetWindow.SpeechSynthesisUtterance(message)
  utterance.lang = 'zh-CN'
  utterance.rate = 1

  targetWindow.speechSynthesis.cancel()
  targetWindow.speechSynthesis.speak(utterance)
}
