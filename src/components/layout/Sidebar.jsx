import React from 'react'
// import Header from './Header'
import { NavLink } from 'react-router-dom'
import {
    Home,
    User,
    Compass,
    MessageSquare,
    Bell,
    Briefcase,
    // Settings,
    // LogOut,
    Users,
} from 'lucide-react'
const navItems = [
    {name: 'Home',            icon: Home,               path: "/"},
    {name: 'Discover',        icon: Compass,            path: "/discover"},
    {name: "Messages",        icon: MessageSquare,      path: "/messages"}, 
    {name: 'Opportunities',  icon: Briefcase,          path: "/opportunities"},
    {name: 'Communities',     icon: Users,              path: "/communities"},
    {name: 'Notifications',   icon: Bell,               path: "/notifications"},
    {name: 'Profile',         icon: User,               path: '/profile'}
]
const Sidebar = () => {
  return (
    <nav className='space-y-1'>
        {navItems.map((item) => {
            const Icon = item.icon;
            return(
                <NavLink key={item.name}
                to={item.path}
                className={({ isActive })=>
                    `flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-colors ${isActive
                        ? 'bg-[#D97757] text-white shadow-sm'
                        : 'text-[#2D2D2D] hover:bg-[#E5E5E5]/50'
                    }`
                }
                >
                    <Icon className="w-5 h-5"/>
                    <span>{item.name}</span>
                </NavLink>
            );
        })}
    </nav>
  )
}

export default Sidebar