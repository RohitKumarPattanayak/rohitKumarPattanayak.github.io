import { useState, useEffect, lazy, Suspense } from "react"
import { Outlet, NavLink, useLocation } from "react-router-dom"
import { useUserStore } from "../store/user.store"
import LoadingFallback from "../components/shared/LoadingFallback"
const OnboardingModal = lazy(() => import("../features/Onboarding/OnboardingModal"))
import { MessageSquare, LayoutDashboard, Settings, UserCircle, Zap, Menu, X, Sun, Moon } from "lucide-react"

const DashboardLayout = () => {
  const { username } = useUserStore()
  const location = useLocation()

  // Theme state
  const [isDarkMode, setIsDarkMode] = useState(true)

  // Sidebar state
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)

  // Toggle dark mode on document body
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Close sidebar on mobile when route changes
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setIsSidebarOpen(false)
      } else {
        setIsSidebarOpen(true)
      }
    }

    // Initial check
    handleResize()

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Close sidebar on navigation (mobile)
  useEffect(() => {
    if (window.innerWidth < 768) {
      setIsSidebarOpen(false)
    }
  }, [location.pathname])

  return (
    <div className="flex h-screen w-full overflow-hidden font-sans text-gray-900 bg-gray-50 dark:text-gray-100 dark:bg-[#030303] selection:bg-indigo-500/30 transition-colors duration-500 pointer-events-auto">
      {/* Background - Light Mode: Clean glass, Dark mode: Cosmic */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        {/* Dark Mode Cosmic glow */}
        <div className="hidden dark:block">
          <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-900/20 blur-[120px]" />
          <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-emerald-900/10 blur-[120px]" />
        </div>
        {/* Light Mode Soft glow */}
        <div className="block dark:hidden">
          <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-200/40 blur-[120px]" />
          <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-emerald-100/40 blur-[120px]" />
        </div>
      </div>

      {!username && (
        <Suspense fallback={<LoadingFallback message="Loading Onboarding..." />}>
          <OnboardingModal />
        </Suspense>
      )}

      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/20 dark:bg-black/60 backdrop-blur-sm z-20 transition-opacity"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar - Heavily Glassmorphic & Responsive */}
      <aside
        className={`fixed md:relative flex-shrink-0 w-[260px] h-full border-r border-gray-200 bg-white/70 dark:border-white/[0.04] dark:bg-black/40 backdrop-blur-3xl flex flex-col items-center py-8 pb-6 z-30 transition-transform duration-300 ease-in-out ${isSidebarOpen ? "translate-x-0" : "-translate-x-full md:hidden"
          }`}
      >
        <div className="mb-10 px-6 w-full flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="absolute inset-0 bg-indigo-400 dark:bg-indigo-500 blur-lg opacity-40 rounded-xl" />
              <div className="relative bg-gradient-to-b from-indigo-500 to-indigo-600 dark:from-indigo-500 dark:to-indigo-700 p-2.5 rounded-xl border border-indigo-300/50 dark:border-indigo-400/30 shadow-xl dark:shadow-2xl">
                <Zap size={20} className="text-white fill-white/20" strokeWidth={2} />
              </div>
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight text-gray-900 dark:text-white">Nexus</h1>
              <p className="text-[10px] uppercase font-bold tracking-widest text-indigo-600 dark:text-indigo-400/80">Command</p>
            </div>
          </div>
          <button
            className="md:hidden p-1.5 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/10 rounded-lg transition-colors"
            onClick={() => setIsSidebarOpen(false)}
          >
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 w-full px-4 space-y-2 overflow-y-auto scrollbar-hide">
          <NavLink
            to="/dashboard"
            end
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-200 group ${isActive ? "bg-white dark:bg-white/[0.08] text-indigo-700 dark:text-white border border-gray-200 dark:border-white/[0.05] shadow-sm dark:shadow-lg dark:shadow-black/20 font-medium" : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/[0.03]"
              }`
            }
          >
            <LayoutDashboard size={18} className="transition-transform group-hover:scale-110" />
            <span className="text-sm">Overview</span>
          </NavLink>
          <NavLink
            to="/dashboard/chat"
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-200 group ${isActive ? "bg-white dark:bg-white/[0.08] text-indigo-700 dark:text-white border border-gray-200 dark:border-white/[0.05] shadow-sm dark:shadow-lg dark:shadow-black/20 font-medium" : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/[0.03]"
              }`
            }
          >
            <MessageSquare size={18} className="transition-transform group-hover:scale-110" />
            <span className="text-sm">Action Board</span>
          </NavLink>
        </nav>

        {/* Theme Toggle Button */}
        <div className="w-full px-4 mb-3">
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl border border-gray-200 dark:border-white/5 bg-white/50 dark:bg-black/20 hover:bg-white dark:hover:bg-white/5 text-gray-600 dark:text-gray-400 transition-all duration-300"
          >
            <span className="text-xs font-medium uppercase tracking-wider">{isDarkMode ? 'Dark Mode' : 'Light Mode'}</span>
            {isDarkMode ? <Moon size={14} className="text-indigo-400" /> : <Sun size={14} className="text-amber-500" />}
          </button>
        </div>

        <div className="w-full px-4 mt-auto">
          <div className="p-3.5 rounded-2xl bg-white dark:bg-white/[0.02] border border-gray-200 dark:border-white/[0.05] flex items-center gap-3 hover:bg-gray-50 dark:hover:bg-white/[0.04] transition-all cursor-pointer group shadow-sm dark:shadow-none dark:hover:shadow-xl dark:hover:shadow-black/20 relative overflow-hidden">
            {/* Hover shine effect */}
            <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/40 dark:via-white/5 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />

            <div className="h-9 w-9 flex-shrink-0 bg-gradient-to-b from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-900 rounded-full flex items-center justify-center border border-gray-300 dark:border-white/10 shadow-inner">
              <UserCircle className="text-gray-500 dark:text-gray-300" size={20} strokeWidth={1.5} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 dark:text-gray-200 truncate group-hover:text-indigo-600 dark:group-hover:text-white transition-colors">{username || "Commander"}</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)] dark:shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
                <p className="text-[10px] text-gray-500 font-medium tracking-wide">SYSTEM ACTIVE</p>
              </div>
            </div>
            <Settings size={16} className="text-gray-400 dark:text-gray-500 group-hover:text-gray-700 dark:group-hover:text-white transition-colors group-hover:rotate-45 duration-300" />
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className={`flex-1 h-full relative z-10 flex flex-col bg-transparent transition-all duration-300 w-full`}>
        {/* Top Navbar for Hamburger Menu */}
        <div className="absolute top-4 left-4 z-50 flex items-center">
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2.5 bg-white/80 dark:bg-black/40 hover:bg-white dark:hover:bg-black/60 backdrop-blur-md border border-gray-200 dark:border-white/[0.08] text-gray-800 dark:text-white rounded-xl shadow-sm dark:shadow-lg transition-all group"
          >
            <Menu size={20} className="text-gray-600 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white transition-colors" />
          </button>
        </div>

        {username ? <Outlet /> : null}
      </main>
    </div>
  )
}

export default DashboardLayout