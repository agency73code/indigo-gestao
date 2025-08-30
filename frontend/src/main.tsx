import React from 'react'
import ReactDOM from 'react-dom/client'
import SignIn from './screens/screen-signin'

import './global.css'

ReactDOM.createRoot (document.getElementById('root')!).render(
  <React.StrictMode>
    <SignIn />
  </React.StrictMode>,
)
