import { NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { LogOut, Menu, X, Sun, Moon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import { useTheme } from '../context/ThemeContext';
import Avatar from '../components/common/Avatar';
import Logo from '../components/common/Logo';
import {
  HomeIcon, CompassIcon, ChatBubbleIcon, HeartIcon, UserPersonIcon, PlusSquareIcon, GearIcon,
} from '../components/common/icons';
import { useState } from 'react';
import CreatePostModal from '../components/feed/CreatePostModal';

const navItems = [
  { to: '/', icon: HomeIcon, label: 'Home' },
  { to: '/explore', icon: CompassIcon, label: 'Explore' },
  { to: '/messages', icon: ChatBubbleIcon, label: 'Messages', badge: 'messages' },
  { to: '/notifications', icon: HeartIcon, label: 'Notifications', badge: 'notifications' },
  { to: '/profile', icon: UserPersonIcon, label: 'Profile' },
];

function SidebarNavItem({ to, icon: Icon, label, count, onClick }) {
  return (
    <NavLink
      to={to}
      end={to === '/'}
      onClick={onClick}
      className={({ isActive }) =>
        `group flex items-center gap-3 px-3.5 py-2.5 rounded-2xl transition-all duration-200 relative
        ${isActive ? 'neu-pill-active font-semibold' : 'text-text-secondary hover:text-text-primary neu-pressable'}`
      }
    >
      {({ isActive }) => (
        <>
          <div className="relative flex-shrink-0">
            <Icon size={20} filled={isActive} />
            {count > 0 && (
              <span className="absolute -top-1.5 -right-1.5 min-w-[16px] h-4 px-1 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center ring-2 ring-surface">
                {count > 9 ? '9+' : count}
              </span>
            )}
          </div>
          <span className="text-sm hidden lg:block">{label}</span>
        </>
      )}
    </NavLink>
  );
}

export default function MainLayout({ children }) {
  const { logout, user } = useAuth();
  const { unreadCount, unreadMessageCount } = useApp();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [createPostOpen, setCreatePostOpen] = useState(false);

  const handleLogout = () => { logout(); navigate('/login'); };

  if (!user) return null;

  const badgeCount = (key) => (key === 'notifications' ? unreadCount : key === 'messages' ? unreadMessageCount : 0);

  return (
    <div className="min-h-screen bg-app-bg flex">
      {/* Desktop Floating Sidebar */}
      <aside className="hidden md:flex flex-col w-[84px] lg:w-64 flex-shrink-0 h-screen sticky top-0 p-3 lg:p-4">
        <div className="flex flex-col flex-1 neu-raised float-nav rounded-[28px] p-3 lg:p-4">
          {/* Logo */}
          <NavLink to="/" className="flex items-center gap-2.5 px-2 mb-6 mt-1 group justify-center lg:justify-start">
            <Logo size={30} className="flex-shrink-0 transition-transform group-hover:scale-110 duration-300" />
            <span className="text-xl font-bold gradient-text hidden lg:block tracking-tight">Bondly</span>
          </NavLink>

          <nav className="flex-1 space-y-2">
            {navItems.map(item => (
              <SidebarNavItem key={item.to} {...item} count={badgeCount(item.badge)} />
            ))}
            <NavLink to="/settings" className={({ isActive }) =>
              `group flex items-center gap-3 px-3.5 py-2.5 rounded-2xl transition-all duration-200 relative
              ${isActive ? 'neu-pill-active font-semibold' : 'text-text-secondary hover:text-text-primary neu-pressable'}`
            }>
              <GearIcon size={20} />
              <span className="text-sm hidden lg:block">Settings</span>
            </NavLink>
          </nav>

          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            className="w-full flex items-center justify-center lg:justify-start gap-3 px-3.5 py-2.5 mb-2 rounded-2xl text-text-secondary hover:text-text-primary transition-all neu-pressable"
          >
            {isDark ? <Sun size={19} /> : <Moon size={19} />}
            <span className="hidden lg:block text-sm font-medium">{isDark ? 'Light mode' : 'Dark mode'}</span>
          </button>

          {/* Create Post */}
          <button
            onClick={() => setCreatePostOpen(true)}
            className="w-full flex items-center justify-center lg:justify-start gap-3 px-3.5 py-3 mb-3 rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-medium text-sm hover:from-violet-500 hover:to-indigo-500 transition-all shadow-lg shadow-violet-900/30 card-3d"
          >
            <PlusSquareIcon size={18} />
            <span className="hidden lg:block">Create post</span>
          </button>

          {/* User Footer */}
          <div className="flex items-center gap-3 px-2 py-2 rounded-2xl hover:bg-surface-3 cursor-pointer group transition-colors">
            <NavLink to="/profile">
              <Avatar src={user.avatar} alt={user.name} size="sm" />
            </NavLink>
            <div className="hidden lg:flex flex-col flex-1 min-w-0">
              <span className="text-sm font-medium text-text-primary truncate">{user.name}</span>
              <span className="text-xs text-text-muted truncate">@{user.username}</span>
            </div>
            <button onClick={handleLogout} className="hidden lg:flex p-1 rounded-lg opacity-0 group-hover:opacity-100 text-text-muted hover:text-red-400 transition-all">
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile Floating Top Nav */}
      <div className="md:hidden fixed top-3 left-3 right-3 z-40 flex items-center justify-between px-4 h-14 neu-raised float-nav rounded-2xl">
        <NavLink to="/" className="flex items-center gap-2">
          <Logo size={26} />
          <span className="font-bold text-text-primary">Bondly</span>
        </NavLink>
        <div className="flex items-center gap-1">
          <button onClick={toggleTheme} className="p-2 text-text-secondary hover:text-text-primary transition-colors rounded-full neu-pressable">
            {isDark ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          <button onClick={() => setMobileOpen(true)} className="p-2 text-text-secondary hover:text-text-primary transition-colors rounded-full neu-pressable">
            <Menu size={22} />
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="md:hidden fixed inset-0 bg-black/60 z-50" onClick={() => setMobileOpen(false)} />
            <motion.div initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="md:hidden fixed left-3 top-3 bottom-3 w-72 neu-raised float-nav rounded-[28px] z-50 flex flex-col p-6">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-2.5">
                  <Logo size={28} />
                  <span className="font-bold text-text-primary text-lg">Bondly</span>
                </div>
                <button onClick={() => setMobileOpen(false)} className="text-text-muted hover:text-text-primary"><X size={20} /></button>
              </div>
              <NavLink to="/profile" onClick={() => setMobileOpen(false)} className="flex items-center gap-3 mb-8 pb-6 border-b border-border-base">
                <Avatar src={user.avatar} alt={user.name} size="md" ring />
                <div>
                  <p className="font-medium text-text-primary">{user.name}</p>
                  <p className="text-sm text-text-muted">@{user.username}</p>
                </div>
              </NavLink>
              <nav className="flex-1 space-y-2">
                {navItems.map(item => (
                  <SidebarNavItem key={item.to} {...item} count={badgeCount(item.badge)} onClick={() => setMobileOpen(false)} />
                ))}
                <NavLink to="/settings" onClick={() => setMobileOpen(false)} className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-2xl transition-all ${isActive ? 'neu-pill-active font-semibold' : 'text-text-secondary hover:text-text-primary neu-pressable'}`
                }>
                  <GearIcon size={20} />
                  <span className="text-sm">Settings</span>
                </NavLink>
              </nav>
              <button onClick={() => { setCreatePostOpen(true); setMobileOpen(false); }}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-medium text-sm mt-4 mb-3">
                <PlusSquareIcon size={16} /> Create post
              </button>
              <button onClick={handleLogout} className="flex items-center gap-2 px-3 py-2 text-red-400 hover:bg-red-500/10 rounded-xl text-sm transition-colors">
                <LogOut size={16} /> Sign out
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main content */}
      <main className="flex-1 min-w-0 pt-20 md:pt-0 pb-24 md:pb-0">
        {children}
      </main>

      {/* Mobile Floating Bottom Nav — pill capsule style matching reference */}
      <nav className="md:hidden fixed bottom-3 left-3 right-3 z-40 flex items-center gap-1.5 neu-raised float-nav rounded-full py-2 px-2">
        {navItems.map(item => (
          <NavLink key={item.to} to={item.to} end={item.to === '/'} className="flex-1">
            {({ isActive }) => (
              <motion.div
                layout
                className={`flex items-center justify-center gap-1.5 py-2.5 rounded-full transition-colors relative
                  ${isActive ? 'neu-pill-active' : 'text-text-muted'}`}
              >
                <div className="relative flex-shrink-0">
                  <item.icon size={19} filled={isActive} />
                  {badgeCount(item.badge) > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 w-3.5 h-3.5 bg-rose-500 rounded-full ring-2 ring-surface" />
                  )}
                </div>
                <AnimatePresence>
                  {isActive && (
                    <motion.span
                      initial={{ width: 0, opacity: 0 }}
                      animate={{ width: 'auto', opacity: 1 }}
                      exit={{ width: 0, opacity: 0 }}
                      className="text-xs font-semibold whitespace-nowrap overflow-hidden"
                    >
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.div>
            )}
          </NavLink>
        ))}
        <button onClick={() => setCreatePostOpen(true)}
          className="flex-shrink-0 p-3 rounded-full bg-gradient-to-br from-violet-600 to-indigo-600 text-white card-3d">
          <PlusSquareIcon size={18} />
        </button>
      </nav>

      <CreatePostModal isOpen={createPostOpen} onClose={() => setCreatePostOpen(false)} />
    </div>
  );
}
