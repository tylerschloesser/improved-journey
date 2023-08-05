import { Subscribe } from '@react-rxjs/core'
import React, { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'
import invariant from 'tiny-invariant'
import './index.scss'
import { router } from './router.js'

const worker = new Worker(new URL('./worker/index.js', import.meta.url))

const container = document.getElementById('root')
invariant(container)
const root = createRoot(container)

root.render(
  <StrictMode>
    <Subscribe>
      <RouterProvider router={router} />
    </Subscribe>
  </StrictMode>,
)
