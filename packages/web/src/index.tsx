import React from 'react'
import { createRoot } from 'react-dom/client'
import invariant from 'tiny-invariant'
import { World } from './component/world.js'
import './index.scss'

const container = document.getElementById('root')
invariant(container)
const root = createRoot(container)

root.render(<World />)
