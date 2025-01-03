import React from 'react'

import {
  BrowserRouter,
  Routes,
  Route
} from 'react-router'

import DataCatalog from './ts/pages/DataCatalog/DataCatalog'

if (import.meta.env.MODE === 'development') {
  import('./ts/css/main.scss')
}

const App = () => (
  <div>
    <BrowserRouter>
      <Routes>
        <Route path="*" element={<DataCatalog />} />
      </Routes>
    </BrowserRouter>
  </div>
)

export default App
