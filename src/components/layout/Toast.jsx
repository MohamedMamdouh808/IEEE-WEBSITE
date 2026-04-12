import { useState, useEffect, useCallback } from 'react'

let _nextId = 0

export function ToastContainer() {
  const [toasts, setToasts] = useState([])

  const remove = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])

  useEffect(() => {
    const handler = (e) => {
      const { msg, type } = e.detail
      const id = ++_nextId
      setToasts(prev => [...prev, { id, msg, type }])
      setTimeout(() => remove(id), 3200)
    }
    window.addEventListener('ieee-toast', handler)
    return () => window.removeEventListener('ieee-toast', handler)
  }, [remove])

  const icons = { success: 'fa-check-circle', error: 'fa-exclamation-circle', info: 'fa-info-circle' }

  return (
    <div className="toast-container">
      {toasts.map(t => (
        <div key={t.id} className={`toast toast--${t.type}`} onClick={() => remove(t.id)}>
          <i className={`fas ${icons[t.type]}`} />
          <span>{t.msg}</span>
        </div>
      ))}
    </div>
  )
}
