import { Subscribe } from '@react-rxjs/core'
import React from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'
import invariant from 'tiny-invariant'
import './index.scss'
import { installBitmapFont } from './pixi/text.js'
import { router } from './router.js'

const container = document.getElementById('root')
invariant(container)
const root = createRoot(container)

// strict mode breaks entity 404s, which redirect
// to '..' on mount. In strict mode this happens twice
// so we end up navigate up two levels...
const development = false

const StrictMode = ({ children }: React.PropsWithChildren) => {
  if (development) {
    console.warn('strict mode enabled, components will render twice')
    return <React.StrictMode>{children}</React.StrictMode>
  }
  return <>{children}</>
}

installBitmapFont()

root.render(
  <StrictMode>
    <Subscribe>
      <RouterProvider router={router} />
    </Subscribe>
  </StrictMode>,
)
