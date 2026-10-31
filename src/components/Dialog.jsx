import { useEffect, useRef } from 'react'

export function Dialog({ title, children, onClose }) {
  const ref = useRef(null)

  const closeRef = useRef(onClose)
  closeRef.current = onClose

  useEffect(() => {
    const node = ref.current
    const previous = document.activeElement
    node?.querySelector('button, a, input')?.focus()
    const onKey = (event) => {
      if (event.key === 'Escape') closeRef.current()
    }
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', onKey)
      if (previous instanceof HTMLElement) previous.focus()
    }
  }, [])

  return (
    <div className="dialog-backdrop" onMouseDown={onClose}>
      <div
        className="dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="dialogo-titulo"
        ref={ref}
        onMouseDown={(event) => event.stopPropagation()}
      >
        <h2 id="dialogo-titulo">{title}</h2>
        {children}
      </div>
    </div>
  )
}
