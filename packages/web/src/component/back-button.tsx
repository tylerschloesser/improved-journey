import React from 'react'
import { useNavigate } from 'react-router-dom'

export function BackButton({ className }: { className: string }) {
  const navigate = useNavigate()
  return (
    <button
      className={className}
      onPointerUp={() => {
        navigate('..')
      }}
    >
      Back
    </button>
  )
}
