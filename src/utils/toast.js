export const toast = {
  success: (msg) => window.dispatchEvent(new CustomEvent('ieee-toast', { detail: { msg, type: 'success' } })),
  error:   (msg) => window.dispatchEvent(new CustomEvent('ieee-toast', { detail: { msg, type: 'error' } })),
  info:    (msg) => window.dispatchEvent(new CustomEvent('ieee-toast', { detail: { msg, type: 'info' } })),
}
