export function getCsrfToken(): string | null {
  if (typeof document === 'undefined') {
    return null
  }

  const match = document.cookie.match(/(^|;)\s*csrftoken=([^;]+)/)
  if (match && match[2]) {
    return decodeURIComponent(match[2])
  }

  return null
}
