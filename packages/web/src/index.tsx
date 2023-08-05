import React, { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import invariant from 'tiny-invariant'
import { World } from './component/world.js'
import './index.scss'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { WorldControls } from './component/world-controls.js'
import { Entity } from './component/entity.js'
import { Subscribe } from '@react-rxjs/core'
import { Connection } from './component/connection.js'
import { BuildEntity } from './component/build-entity.js'
import { Build } from './component/build.js'

const container = document.getElementById('root')
invariant(container)
const root = createRoot(container)

const router = createBrowserRouter([
  {
    path: '/',
    element: <div>TODO add root/home</div>,
  },
  {
    path: '/world/:id',
    element: <World />,
    children: [
      {
        path: '',
        element: <WorldControls />,
      },
      {
        path: 'build',
        element: <Build />,
      },
      {
        path: 'build/:type',
        element: <BuildEntity />,
      },
      {
        path: 'entity/:id',
        element: <Entity />,
      },
      {
        path: 'entity/:id/connection',
        element: <Connection />,
      },
    ],
  },
])

root.render(
  <StrictMode>
    <Subscribe>
      <RouterProvider router={router} />
    </Subscribe>
  </StrictMode>,
)
