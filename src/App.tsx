import {
  BrowserRouter,
  Routes,
  Route
} from 'react-router-dom'

import './ts/css/main.scss'

import DataCatalog from './ts/pages/DataCatalog/DataCatalog'

const App = () => (
  <div>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<DataCatalog />} />
      </Routes>
    </BrowserRouter>
  </div>
)

export default App
