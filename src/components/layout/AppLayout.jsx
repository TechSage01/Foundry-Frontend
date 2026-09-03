import Sidebar from './Sidebar'
import Topbar from './Topbar'

export default function AppLayout({ children }) {
  return <div><Topbar /><Sidebar /><main>{children}</main></div>
}
