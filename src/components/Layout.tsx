import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'

function Layout() {
  return (
    <div className="layout">
      <Sidebar />
      <main className="content">
        <div className="content__inner">
          <Outlet />
        </div>
      </main>
    </div>
  )
}

export default Layout
