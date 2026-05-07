export interface SuccessFeedbackOptions {
  voiceURI?: string | null
}

export function notifySuccess(
  message: string,
  options?: SuccessFeedbackOptions
): void

export function speakSuccessMessage(
  message: string,
  targetWindow?: Window | typeof globalThis,
  voiceURI?: string | null
): void
