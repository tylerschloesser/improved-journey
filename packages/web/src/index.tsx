import React from 'react'
import { createRoot } from 'react-dom/client'
import invariant from 'tiny-invariant'
import { World } from './component/world.js'
import './index.scss'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { WorldControls } from './component/world-controls.js'
import { Cursor } from './component/cursor.js'
import { Build } from './component/build.js'
import { Entity } from './component/entity.js'

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
        path: 'cursor',
        element: <Cursor />,
      },
      {
        path: 'build',
        element: <Build />,
      },
      {
        path: 'entity/:id',
        element: <Entity />,
      },
    ],
  },
])

root.render(<RouterProvider router={router} />)
