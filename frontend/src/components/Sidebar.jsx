import React from 'react'
import { NavLink } from 'react-router-dom'
import { useClerk, useUser } from '@clerk/clerk-react'
import { 
  Eraser, FileText, Hash, House, 
  Image, Scissors, SquarePen, Users, LogOut,
  Code2, AlignLeft, Mail, SpellCheck, Share2, Languages
} from 'lucide-react'

// Navigation configuration
const navItems = [
  { to: '/ai', label: 'Dashboard', Icon: House },
  { to: '/ai/write-article', label: 'Write Article', Icon: SquarePen },
  { to: '/ai/blog-titles', label: 'Blog Titles', Icon: Hash },
  { to: '/ai/generate-images', label: 'Generate Images', Icon: Image },
  { to: '/ai/remove-background', label: 'Remove Background', Icon: Eraser },
  { to: '/ai/remove-object', label: 'Remove Object', Icon: Scissors },
  { to: '/ai/review-resume', label: 'Review Resume', Icon: FileText },
  { to: '/ai/review-code', label: 'AI Code Review', Icon: Code2 },
  { to: '/ai/summarize-text', label: 'Summarize Text', Icon: AlignLeft },
  { to: '/ai/email-writer', label: 'Email Writer', Icon: Mail },
  { to: '/ai/grammar-improver', label: 'Grammar Improver', Icon: SpellCheck },
  { to: '/ai/social-content', label: 'Social Content', Icon: Share2 },
  { to: '/ai/translate', label: 'AI Translator', Icon: Languages },
  { to: '/ai/community', label: 'Community', Icon: Users },
]

const Sidebar = ({ sidebar, setSidebar }) => {
  const { user } = useUser()
  const { signOut, openUserProfile } = useClerk()

  return (
    <div className={`w-64 bg-white border-r border-gray-200 flex flex-col justify-between items-center max-sm:absolute top-14 bottom-0 ${sidebar ? 'translate-x-0' : 'max-sm:-translate-x-full'} transition-all duration-300 ease-in-out z-50 h-[calc(100vh-3.5rem)]`}>
      
      <div className='my-4 w-full flex-1 overflow-y-auto'>
        {/* User Header Section  */}
        <img 
          src={user?.imageUrl} 
          alt="User avatar" 
          className='w-12 h-12 rounded-full mx-auto' 
        />
        <h1 className='mt-1 text-center font-medium text-slate-800 text-sm'>{user?.fullName}</h1>

        {/* Navigation Links  */}
        <div className='mt-6 px-3 flex flex-col gap-1.5 pb-4'>
          {navItems.map(({ to, label, Icon }) => (
            <NavLink 
              key={to} 
              to={to} 
              end={to === '/ai'}
              onClick={() => setSidebar(false)} 
              className={({ isActive }) => 
                `px-3 py-2 flex items-center gap-3 rounded-lg transition-all ${
                  isActive 
                  ? 'bg-gradient-to-r from-[#3C81F6] to-[#9234EA] text-white shadow-sm' 
                  : 'text-gray-600 hover:bg-gray-50'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-gray-500'}`} />
                  <span className='text-xs font-medium truncate'>{label}</span>
                </>
              )}
            </NavLink>
          ))}
        </div>
      </div>

      {/* Footer Profile & Logout Section [cite: 7] */}
      <div className='mb-7 w-full px-4 flex items-center justify-between border-t pt-4'>
        <div 
          onClick={openUserProfile} 
          className='flex gap-2 items-center cursor-pointer'
        >
          <img src={user?.imageUrl} className='w-8 rounded-full' alt="" />
          <div>
            <h1 className='text-sm font-medium'>{user?.fullName}</h1>
            <p className='text-xs text-gray-500'>Free Plan</p>
          </div>
        </div>
        
        <LogOut 
          onClick={signOut} 
          className='w-4.5 text-gray-400 hover:text-gray-700 transition cursor-pointer' 
        />
      </div>
    </div>
  )
}

export default Sidebar