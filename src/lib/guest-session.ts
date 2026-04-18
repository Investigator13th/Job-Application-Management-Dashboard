const GUEST_MODE_KEY = 'job-board.guest-mode'

export const GUEST_USER_ID = 'guest-local'
export const GUEST_VIEWER_LABEL = '游客模式'

function canUseLocalStorage() {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined'
}

export function isGuestModeEnabled() {
  if (!canUseLocalStorage()) return false
  return window.localStorage.getItem(GUEST_MODE_KEY) === 'true'
}

export function enableGuestMode() {
  if (!canUseLocalStorage()) return
  window.localStorage.setItem(GUEST_MODE_KEY, 'true')
}

export function disableGuestMode() {
  if (!canUseLocalStorage()) return
  window.localStorage.removeItem(GUEST_MODE_KEY)
}
