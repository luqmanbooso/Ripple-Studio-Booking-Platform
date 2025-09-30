import React from 'react'
import { Outlet } from 'react-router-dom'
import SimpleStudioNavbar from './SimpleStudioNavbar'

const SimpleStudioLayout = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <SimpleStudioNavbar />
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  )
}

export default SimpleStudioLayout
