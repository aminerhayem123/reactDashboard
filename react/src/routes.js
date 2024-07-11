import React from 'react'

const Dashboard = React.lazy(() => import('./views/dashboard/Dashboard'))
const items = React.lazy(() => import('./views/pages/items/items'))
const packs = React.lazy(() => import('./views/pages/packs/packs'))
const Transactions = React.lazy(() => import('./views/pages/Transactions/Transactions'))
const Profile = React.lazy(() => import('./views/pages/Profile/profile'))




const routes = [
  { path: '/', exact: true, name: 'Home' },
  { path: '/dashboard', name: 'Dashboard', element: Dashboard },
  { path: '/items', name: 'items', element: items },
  { path: '/packs', name: 'packs', element: packs },
  { path: '/Transactions', name: 'Transactions', element: Transactions },
  { path: '/Profile', name: 'Profile', element: Profile },
]

export default routes
