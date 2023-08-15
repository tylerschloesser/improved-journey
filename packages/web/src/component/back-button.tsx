import { useNavigate } from 'react-router-dom'

export function BackButton({ className }: { className: string | undefined }) {
  const navigate = useNavigate()
  return (
    <button
      className={className}
      onPointerUp={() => {
        navigate(-1)
      }}
    >
      Back
    </button>
  )
}
