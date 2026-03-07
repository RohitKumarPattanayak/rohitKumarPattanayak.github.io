import { useState, useEffect } from "react"
import { useUserStore } from "../../store/user.store"
import { useNavigate } from "react-router-dom"
import { onboardingCreateUser, onboardingFetchAllUsersInfinite, onboardingUpdateUser } from '../../react-queries/OnboardingQueries'

const OnboardingModal = () => {
  const [isFirstTime, setIsFirstTime] = useState<boolean | null>(null)
  const [username, setName] = useState("")
  const [mode, setMode] = useState<"recruiter" | "candidate">("candidate")

  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<any>(null)

  const [search, setSearch] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search)
    }, 500)
    return () => clearTimeout(handler)
  }, [search])

  const setUser = useUserStore((s) => s.setUser)
  const navigate = useNavigate()

  const { mutateAsync: createMutation, isPending: isCreatePending, isError: isCreateError, error: createError } = onboardingCreateUser()
  const { mutateAsync: updateMutation, isPending: isUpdatePending, isError: isUpdateError, error: updateError } = onboardingUpdateUser()

  // Since we fetch users directly, handleLogin just sets the store state locally.
  const handleLogin = async () => {
    if (!username.trim()) return
    let user: any = await updateMutation({ user_id: selectedUser.id, mode })
    setUser(user.id, user.username, user.mode)
    navigate("/dashboard/chat")
  }

  const handleCreate = async () => {
    if (!username.trim()) return
    let user: any = await createMutation({ username, mode })
    setUser(user.id, user.username, user.mode)
    navigate("/dashboard/chat")
  }

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } = onboardingFetchAllUsersInfinite(debouncedSearch, 10)
  const users = data?.pages.flatMap(page => page.items) || [];

  const handleScroll = (e: React.UIEvent<HTMLUListElement>) => {
    const bottom = Math.abs(e.currentTarget.scrollHeight - e.currentTarget.scrollTop - e.currentTarget.clientHeight) < 10;
    if (bottom && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }

  const handleSelectUser = (user: any) => {
    setSelectedUser(user)
    setName(user.username)
    setMode(user.mode)
    setIsDropdownOpen(false)
  }

  return (
    <div className="fixed inset-0 z-[9999] bg-white/80 dark:bg-black/80 backdrop-blur-md flex justify-center items-center p-4 transition-colors duration-500">
      <div className="w-full max-w-md bg-white border border-gray-200 dark:bg-[#0a0a0c]/90 dark:border-white/10 p-8 rounded-[2rem] shadow-2xl relative backdrop-blur-xl text-gray-900 dark:text-gray-100 transition-colors duration-500">

        {/* Decorative background glow */}
        <div className="absolute top-[-50%] left-[-50%] w-[200%] h-[200%] bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-indigo-100/50 dark:from-indigo-500/10 via-transparent to-transparent pointer-events-none" />

        <div className="relative z-10 flex flex-col gap-6">
          {isFirstTime === null && (
            <div className="text-center animate-in fade-in zoom-in duration-500">
              <div className="mx-auto w-16 h-16 bg-gradient-to-tr from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-[0_0_30px_rgba(99,102,241,0.2)] dark:shadow-[0_0_30px_rgba(99,102,241,0.3)] mb-6">
                <span className="text-3xl text-white">👋</span>
              </div>
              <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white mb-2">Welcome to Nexus</h2>
              <p className="text-gray-500 dark:text-gray-400 mb-8 text-sm">Is this your first time accessing the system?</p>

              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => setIsFirstTime(true)}
                  className="py-3 px-4 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 hover:bg-gray-100 dark:hover:bg-white/10 transition-all font-medium text-gray-700 dark:text-white shadow-sm dark:shadow-none active:scale-95"
                >
                  Yes, I'm new
                </button>
                <button
                  onClick={() => setIsFirstTime(false)}
                  className="py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 transition-all font-medium text-white shadow-[0_4px_14px_0_rgb(0,118,255,0.39)] hover:shadow-[0_6px_20px_rgba(0,118,255,0.23)] dark:shadow-[0_0_20px_rgba(79,70,229,0.3)] dark:hover:shadow-[0_0_30px_rgba(79,70,229,0.5)] active:scale-95 border border-indigo-500"
                >
                  No, login
                </button>
              </div>
            </div>
          )}

          {isFirstTime === true && (
            <div className="animate-in slide-in-from-right-8 fade-in duration-500">
              <h3 className="text-xl font-bold tracking-tight text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                <span className="w-2 h-6 bg-indigo-500 rounded-full inline-block"></span>
                Create Profile
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wider">Unique Name</label>
                  <input
                    placeholder="Enter username..."
                    value={username}
                    onChange={(e) => {
                      const value = e.target.value
                      if (/^[a-zA-Z0-9]*$/.test(value)) {
                        setName(value)
                      }
                    }}
                    className="w-full bg-gray-50 dark:bg-black/50 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wider">Access Mode</label>
                  <select
                    value={mode}
                    onChange={(e) => setMode(e.target.value as any)}
                    className="w-full bg-gray-50 dark:bg-black/50 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all appearance-none cursor-pointer"
                  >
                    <option value="candidate" className="bg-white dark:bg-[#0a0a0c]">Candidate</option>
                    <option value="recruiter" className="bg-white dark:bg-[#0a0a0c]">Recruiter</option>
                  </select>
                </div>

                <div className="pt-2">
                  <button
                    onClick={handleCreate}
                    disabled={isCreatePending || !username.trim()}
                    className="w-full py-3.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-400 dark:disabled:bg-indigo-600/50 disabled:cursor-not-allowed transition-all font-medium text-white shadow-[0_4px_14px_0_rgb(0,118,255,0.39)] dark:shadow-[0_0_20px_rgba(79,70,229,0.3)] border border-indigo-500 flex justify-center items-center"
                  >
                    {isCreatePending ? (
                      <span className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                        Initializing...
                      </span>
                    ) : "Initialize Profile"}
                  </button>
                </div>

                {isCreateError && (
                  <div className="p-3 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-xl text-red-600 dark:text-red-400 text-sm">
                    ⚠️ Failed to create user: {createError?.message}
                  </div>
                )}

                <button
                  onClick={() => setIsFirstTime(null)}
                  className="w-full text-center text-xs text-gray-500 hover:text-gray-800 dark:hover:text-white transition-colors mt-4"
                >
                  ← Back to welcome
                </button>
              </div>
            </div>
          )}

          {isFirstTime === false && (
            <div className="animate-in slide-in-from-left-8 fade-in duration-500">
              <h3 className="text-xl font-bold tracking-tight text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                <span className="w-2 h-6 bg-emerald-500 rounded-full inline-block"></span>
                System Login
              </h3>

              <div className="space-y-4">
                <div className="relative">
                  <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wider">Select Identity</label>
                  <div
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="w-full bg-gray-50 dark:bg-black/50 border border-gray-200 dark:border-white/10 hover:border-gray-300 dark:hover:border-white/20 rounded-xl px-4 py-3 text-gray-700 dark:text-gray-300 cursor-pointer flex items-center justify-between transition-all"
                  >
                    <span className={selectedUser ? "text-gray-900 dark:text-white" : "text-gray-400 dark:text-gray-500"}>
                      {selectedUser ? selectedUser.username : "Choose your profile..."}
                    </span>
                    <span className="text-gray-400 dark:text-gray-600 text-xs">▼</span>
                  </div>

                  {isDropdownOpen && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-[#121216] border border-gray-200 dark:border-white/10 rounded-xl shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                      <div className="p-2 border-b border-gray-100 dark:border-white/5 bg-gray-50 dark:bg-black/40">
                        <input
                          autoFocus
                          value={search}
                          onChange={(e) => setSearch(e.target.value)}
                          placeholder="Search users..."
                          className="w-full bg-white dark:bg-black/40 border border-gray-200 dark:border-white/5 rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-600 focus:outline-none focus:ring-1 focus:ring-indigo-500/50"
                        />
                      </div>
                      <ul
                        onScroll={handleScroll}
                        className="max-h-48 overflow-y-auto w-full scrollbar-hide py-1"
                      >
                        {isLoading && <li className="px-4 py-3 text-sm text-indigo-600 dark:text-indigo-400 flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full border-2 border-indigo-200 dark:border-indigo-400/30 border-t-indigo-600 dark:border-t-indigo-400 animate-spin" />
                          Loading directory...
                        </li>}
                        {users.map((u: any) => (
                          <li
                            key={u.id}
                            onClick={() => handleSelectUser(u)}
                            className="px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:text-gray-900 hover:bg-gray-50 dark:hover:text-white dark:hover:bg-white/5 cursor-pointer transition-colors flex items-center justify-between group"
                          >
                            <span>{u.username}</span>
                            <span className="text-[10px] uppercase tracking-wider text-gray-400 dark:text-gray-600 group-hover:text-indigo-500 dark:group-hover:text-indigo-400">{u.mode}</span>
                          </li>
                        ))}
                        {isFetchingNextPage && <li className="px-4 py-3 text-sm text-gray-500 flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full border-2 border-gray-200 dark:border-gray-500/30 border-t-gray-500 animate-spin" />
                          Indexing...
                        </li>}
                        {!hasNextPage && !isLoading && users.length > 0 && <li className="px-4 py-3 text-[11px] text-center text-gray-400 dark:text-white/20 uppercase tracking-widest font-semibold bg-gray-50 dark:bg-black/20">End of directory</li>}
                        {!isLoading && users.length === 0 && <li className="px-4 py-4 text-sm text-center text-gray-500">No matching identities</li>}
                      </ul>
                    </div>
                  )}
                </div>

                {selectedUser && (
                  <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                    <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wider mt-4">Access Mode</label>
                    <select
                      value={mode}
                      onChange={(e) => setMode(e.target.value as any)}
                      className="w-full bg-gray-50 dark:bg-black/50 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all appearance-none cursor-pointer"
                    >
                      <option value="candidate" className="bg-white dark:bg-[#0a0a0c]">Candidate</option>
                      <option value="recruiter" className="bg-white dark:bg-[#0a0a0c]">Recruiter</option>
                    </select>

                    <div className="pt-6">
                      <button
                        onClick={handleLogin}
                        disabled={isUpdatePending}
                        className="w-full py-3.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:bg-emerald-400 dark:disabled:bg-emerald-600/50 disabled:cursor-not-allowed transition-all font-medium text-white shadow-[0_4px_14px_0_rgba(16,185,129,0.39)] dark:shadow-[0_0_20px_rgba(16,185,129,0.3)] border border-emerald-500 flex justify-center items-center"
                      >
                        {isUpdatePending ? (
                          <span className="flex items-center gap-2">
                            <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                            Authenticating...
                          </span>
                        ) : "Access System"}
                      </button>
                    </div>

                    {isUpdateError && (
                      <div className="mt-3 p-3 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-xl text-red-600 dark:text-red-400 text-sm">
                        ⚠️ Authentication failed: {updateError?.message}
                      </div>
                    )}
                  </div>
                )}

                <button
                  onClick={() => {
                    setIsFirstTime(null);
                    setSelectedUser(null);
                  }}
                  className="w-full text-center text-xs text-gray-500 hover:text-gray-800 dark:hover:text-white transition-colors mt-6"
                >
                  ← Back to welcome
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default OnboardingModal