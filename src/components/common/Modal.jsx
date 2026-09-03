export default function Modal({ open, title, children, onClose }) {
  if (!open) return null
  return <dialog open><h2>{title}</h2>{children}<button type="button" onClick={onClose}>Close</button></dialog>
}
