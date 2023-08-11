import { createBrowserRouter } from 'react-router-dom'
import { BuildEntity } from './component/build-entity.js'
import { Build } from './component/build.js'
import { Connection } from './component/connection.js'
import { Debug } from './component/debug.js'
import { Entity } from './component/entity.js'
import { Select } from './component/select.js'
import { WorldControls } from './component/world-controls.js'
import { World } from './component/world.js'
import './index.scss'

export const router = createBrowserRouter([
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
        path: 'debug',
        element: <Debug />,
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
      {
        path: 'select',
        element: <Select />,
      },
    ],
  },
])
