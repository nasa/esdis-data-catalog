import React from 'react'

import {
  BrowserRouter,
  Routes,
  Route
} from 'react-router-dom'

import DataCatalog from './pages/DataCatalog/DataCatalog'
import './css/main.scss'

export const App = () => (
  <div>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<DataCatalog />} />
      </Routes>
    </BrowserRouter>
  </div>
)
export default App
