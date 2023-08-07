import { Subscribe } from '@react-rxjs/core'
import React from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'
import invariant from 'tiny-invariant'
import './index.scss'
import { router } from './router.js'

const container = document.getElementById('root')
invariant(container)
const root = createRoot(container)

const development = true

const StrictMode = ({ children }: React.PropsWithChildren) => {
  if (development) {
    console.warn('strict mode enabled, components will render twice')
    return <React.StrictMode>{children}</React.StrictMode>
  }
  return <>{children}</>
}

root.render(
  <StrictMode>
    <Subscribe>
      <RouterProvider router={router} />
    </Subscribe>
  </StrictMode>,
)
