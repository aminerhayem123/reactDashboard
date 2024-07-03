import React from 'react'

const Dashboard = React.lazy(() => import('./views/dashboard/Dashboard'))
const Tables = React.lazy(() => import('./views/base/tables/Tables'))
const items = React.lazy(() => import('./views/pages/items/items'))
const packs = React.lazy(() => import('./views/pages/packs/packs'))




const routes = [
  { path: '/', exact: true, name: 'Home' },
  { path: '/dashboard', name: 'Dashboard', element: Dashboard },
  { path: '/base/tables', name: 'Tables', element: Tables },
  { path: '/items', name: 'items', element: items },
  { path: '/packs', name: 'packs', element: packs },
]

export default routes
