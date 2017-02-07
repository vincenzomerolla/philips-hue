import React from 'react';
import { render } from 'react-dom';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import Lights from './pages/Lights';

import {
  BrowserRouter as Router,
  Route
} from 'react-router-dom'

const App = () => (
  <Router>
    <div>
      <Route exact path="/" component={Home}/>
      <Route exact path="/dashboard" component={Dashboard} />
      <Route path="/lights" component={Lights}/>
    </div>
  </Router>
)

render(
  <App />,
  document.getElementById('root')
);
