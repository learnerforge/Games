import { Outlet } from 'react-router-dom'
import Header from './Header'

export default function Layout() {
  return (
    <>
      <Header />
      <main className="flex-1 px-4 py-6 max-w-6xl mx-auto w-full">
        <Outlet />
      </main>
    </>
  )
}
