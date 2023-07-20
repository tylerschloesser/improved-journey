import React from 'react'
import { createRoot } from 'react-dom/client'
import invariant from 'tiny-invariant'
import { Home } from './component/home.js'

console.log('hi')

const container = document.getElementById('root')
invariant(container)
const root = createRoot(container)

root.render(<Home />)
