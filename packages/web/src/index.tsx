import React from 'react'
import { createRoot } from 'react-dom/client'
import invariant from 'tiny-invariant'
import { World } from './component/world.js'
import './index.scss'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { WorldControls } from './component/world-controls.js'

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
    ],
  },
])

root.render(<RouterProvider router={router} />)
