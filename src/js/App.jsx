import React from 'react'

import {
  BrowserRouter as Router,
  Route,
  Switch
} from 'react-router-dom'
import DataCatalog from './pages/DataCatalog/DataCatalog'

export const DataCatalogRoot = () => (
  <div>
    <Router>
      <Switch>
        <Route path="/" component={DataCatalog} />
      </Switch>
    </Router>
  </div>
)
