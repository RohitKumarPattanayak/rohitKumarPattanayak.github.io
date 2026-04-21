import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react"
import { useUserStore } from "../../store/user.store"
import { useNavigate } from "react-router-dom"
import { onboardingCreateUser, onboardingFetchAllUsersInfinite, onboardingLoginUser, onboardingFetchActiveResume, onboardingGetLoggedUser } from '../../react-queries/OnboardingQueries'
import TypingHeading from "../../components/shared/onboarding/TypeHeading"

type UserMode = "recruiter" | "candidate"

type UserItem = {
  id: number
  username: string
  mode: UserMode
}

const DebouncedSearchInput = memo(({ onDebouncedChange }: { onDebouncedChange: (v: string) => void }) => {
  const [local, setLocal] = useState("");
  const debounceRef = useRef<number | null>(null);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setLocal(val);
    if (debounceRef.current !== null) window.clearTimeout(debounceRef.current);
    debounceRef.current = window.setTimeout(() => {
      onDebouncedChange(val);
    }, 300);
  }, [onDebouncedChange]);

  return (
    <div className="p-2 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-black">
      <input
        autoFocus
        value={local}
        onChange={handleChange}
        placeholder="Search users..."
        className="w-full bg-white dark:bg-black border border-gray-300 dark:border-gray-700 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 outline-none"
      />
    </div>
  )
})

const UserRow = memo(({ user, onSelect }: { user: UserItem, onSelect: (user: UserItem) => void }) => {
  const handleClick = useCallback(() => onSelect(user), [onSelect, user])

  return (
    <li
      onClick={handleClick}
      className="px-4 py-3 text-sm text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer flex items-center justify-between border-b border-gray-100 dark:border-gray-800 last:border-0"
    >
      <span>{user.username}</span>
      <span className="text-[10px] uppercase text-gray-500">{user.mode}</span>
    </li>
  )
})

const UserDropdown = memo(({
  isOpen,
  onSearchChange,
  users,
  isLoading,
  isFetchingNextPage,
  hasNextPage,
  onScroll,
  onSelectUser,
}: any) => {
  if (!isOpen) return null

  return (
    <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-[#121216] border border-gray-200 dark:border-gray-800 shadow-md z-50">
      <DebouncedSearchInput onDebouncedChange={onSearchChange} />
      <ul
        onScroll={onScroll}
        className="max-h-48 overflow-y-auto w-full py-0 m-0 list-none"
      >
        {isLoading && <li className="px-4 py-3 text-sm text-gray-500">Loading directory...</li>}
        {users.map((u: UserItem) => (
          <UserRow key={u.id} user={u} onSelect={onSelectUser} />
        ))}
        {isFetchingNextPage && <li className="px-4 py-3 text-sm text-gray-500">Indexing...</li>}
        {!hasNextPage && !isLoading && users.length > 0 && <li className="px-4 py-3 text-[11px] text-center text-gray-400 uppercase font-bold bg-gray-50 dark:bg-gray-900">End of directory</li>}
        {!isLoading && users.length === 0 && <li className="px-4 py-4 text-sm text-center text-gray-500">No matching identities</li>}
      </ul>
    </div>
  )
})

const WelcomeView = memo(({ onModeSelect }: { onModeSelect: (mode: 'welcome' | 'signup' | 'login' | 'hidden') => void }) => {
  const { data: activeResume, error: activeResumeError, isLoading: isActiveResumeLoading } = onboardingFetchActiveResume()
  const [isTypingComplete, setIsTypingComplete] = useState(false)
  const [showGuestPrompt, setShowGuestPrompt] = useState(false)

  const setUser = useUserStore((s) => s.setUser)
  const navigate = useNavigate()
  const { mutateAsync: updateMutation, isPending } = onboardingLoginUser()

  const fullText = isActiveResumeLoading
    ? "Loading data..."
    : activeResume?.name
      ? `Welcome To ${activeResume.name}'s Portfolio`
      : "Welcome To Portfolio"

  const handleSignupClick = useCallback(() => onModeSelect('signup'), [onModeSelect])
  const handleLoginClick = useCallback(() => onModeSelect('login'), [onModeSelect])

  const handleGuestClick = useCallback(() => {
    setShowGuestPrompt(true)
  }, [])

  const handleAuthorizeGuest = useCallback(async () => {
    try {
      const user = await updateMutation({ user_id: 0, mode: "recruiter" }) as UserItem
      setUser(user.id, user.username, user.mode)
      navigate("/dashboard")
    } catch (error) {
      console.error("Guest login failed", error)
      onModeSelect('hidden')
    }
  }, [navigate, onModeSelect, setUser, updateMutation])

  if (showGuestPrompt) {
    return (
      <div className="w-full flex flex-col items-center animate-in fade-in zoom-in duration-300">
        <img src="/guest_illustration.png" alt="Got a second?" className="w-[140px] h-auto mb-4 opacity-100" />
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 text-center">Got a second?</h3>
        <p className="text-gray-600 dark:text-gray-400 mb-6 text-sm text-center leading-relaxed">
          We recommend creating a unique user Index.<br />
          It helps us better understand different users and improve answer quality.<br /><br />
          <span className="font-semibold text-gray-800 dark:text-gray-200">No personal data is collected — it's just for indexing purposes.</span>
        </p>
        <div className="flex flex-col gap-3 w-full">
          <button
            onClick={() => setShowGuestPrompt(false)}
            className="w-full py-3 bg-[indigo]/30 text-white font-medium border-0 cursor-pointer shadow-sm hover:bg-[indigo]/50 transition-colors"
          >
            Sure
          </button>
          <button
            onClick={handleAuthorizeGuest}
            disabled={isPending}
            className="w-full py-3 bg-gray-100 dark:bg-gray-800 disabled:opacity-50 text-gray-900 dark:text-gray-100 font-medium border-0 cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          >
            {isPending ? "Loading..." : "No, proceed as Guest"}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full flex flex-col items-center">
      <img src="/illustration.png" alt="" className="w-[180px] h-auto mb-6 opacity-90" />

      {activeResumeError && (
        <div className="p-3 mb-4 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 text-sm w-full text-center border border-red-200 dark:border-red-800">
          Failed to fetch active resume
        </div>
      )}

      <div className="mb-4 w-full flex justify-center">
        <TypingHeading fullText={fullText} isActiveResumeLoading={isActiveResumeLoading} isTypingComplete={isTypingComplete} setIsTypingComplete={setIsTypingComplete} />
      </div>

      <p className="text-gray-500 dark:text-gray-400 mb-8 text-[12px] sm:text-xs text-center max-w-[220px] mx-auto font-mono tracking-[0.03em] leading-relaxed">
        Explore the portfolio details effortlessly.
      </p>

      <div className="flex flex-col gap-3 w-full">
        <button
          onClick={handleSignupClick}
          disabled={!isTypingComplete}
          className="w-full py-3 bg-[indigo]/40 disabled:bg-[indigo]/20 text-white font-medium border-0 cursor-pointer hover:bg-[indigo]/60 transition-colors"
        >
          Create New User
        </button>
        <button
          onClick={handleLoginClick}
          disabled={!isTypingComplete}
          className="w-full py-3 bg-gray-100 dark:bg-gray-800 disabled:opacity-50 text-gray-900 dark:text-gray-100 font-medium border-0 cursor-pointer"
        >
          Already Existing User
        </button>
      </div>

      <button onClick={handleGuestClick} className="mt-6 text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 border-0 bg-transparent cursor-pointer transition-colors">
        Continue as Guest
      </button>
    </div>
  )
})

const SignUpView = memo(({ onCancel }: { onCancel: () => void }) => {
  const [username, setUsername] = useState("")
  const [mode, setMode] = useState<UserMode>("candidate")

  const setUser = useUserStore((s) => s.setUser)
  const navigate = useNavigate()
  const { mutateAsync: createMutation, isPending, isError, error } = onboardingCreateUser()

  const handleCreate = useCallback(async () => {
    if (!username.trim()) return
    const user = await createMutation({ username, mode }) as UserItem
    setUser(user.id, user.username, user.mode)
    navigate("/dashboard")
  }, [createMutation, mode, navigate, setUser, username])

  const handleNameChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    if (/^[a-zA-Z0-9]*$/.test(value)) setUsername(value)
  }, [])
  const handleModeChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => setMode(e.target.value as UserMode), [])

  return (
    <div className="w-full flex flex-col items-center">
      <img src="/create_illustration.png" alt="Sign Up" className="w-[140px] h-auto mb-4 opacity-100" />
      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 text-center w-full">Create Account</h3>

      <div className="flex flex-col gap-4 w-full">
        <div>
          <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">USERNAME</label>
          <input value={username} onChange={handleNameChange} className="w-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#121216] p-3 text-gray-900 dark:text-gray-100 outline-none" placeholder="Enter username..." />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">MODE</label>
          <select value={mode} onChange={handleModeChange} className="w-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#121216] p-3 text-gray-900 dark:text-gray-100 outline-none appearance-none">
            <option value="candidate">Candidate</option>
            <option value="recruiter">Recruiter</option>
          </select>
        </div>

        <button onClick={handleCreate} disabled={isPending || !username.trim()} className="w-full mt-2 py-3 bg-[indigo]/50 disabled:bg-gray-400 text-white font-medium border-0 cursor-pointer">
          {isPending ? "Loading..." : "Create Account"}
        </button>

        {isError && <div className="text-red-500 text-sm text-center border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/10 p-2">{"Error creating user please provide a unique name."}</div>}

        <button onClick={onCancel} className="mt-2 text-sm text-gray-500 border-0 bg-transparent cursor-pointer w-full">Cancel</button>
      </div>
    </div>
  )
})

const LoginView = memo(({ onCancel }: { onCancel: () => void }) => {
  const [mode, setMode] = useState<UserMode>("candidate")
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<UserItem | null>(null)
  const [debouncedSearch, setDebouncedSearch] = useState("")

  const setUser = useUserStore((s) => s.setUser)
  const navigate = useNavigate()
  const { mutateAsync: updateMutation, isPending, isError, error } = onboardingLoginUser()

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } = onboardingFetchAllUsersInfinite(debouncedSearch, 10)

  const users = useMemo<UserItem[]>(() => data?.pages.flatMap((page) => page.items as UserItem[]) || [], [data])

  const userCacheRef = useRef<Map<string, UserItem[]>>(new Map())
  useEffect(() => {
    if (users.length > 0) userCacheRef.current.set(debouncedSearch, users)
  }, [debouncedSearch, users])

  const stableUsers = useMemo<UserItem[]>(() => users.length > 0 ? users : (userCacheRef.current.get(debouncedSearch) ?? []), [debouncedSearch, users])

  const handleLogin = useCallback(async () => {
    if (!selectedUser) return
    const user = await updateMutation({ user_id: selectedUser.id, mode }) as UserItem
    setUser(user.id, user.username, user.mode)
    navigate("/dashboard")
  }, [mode, navigate, selectedUser, setUser, updateMutation])

  const throttleRef = useRef(false)
  const handleScroll = useCallback((e: React.UIEvent<HTMLUListElement>) => {
    if (throttleRef.current) return
    throttleRef.current = true
    setTimeout(() => { throttleRef.current = false }, 150)

    const target = e.currentTarget
    const bottom = target.scrollTop + target.clientHeight >= target.scrollHeight - 50
    if (bottom && hasNextPage && !isFetchingNextPage) fetchNextPage()
  }, [fetchNextPage, hasNextPage, isFetchingNextPage])

  const handleSelectUser = useCallback((user: UserItem) => {
    setSelectedUser(user)
    setMode(user.mode)
    setIsDropdownOpen(false)
  }, [])

  const handleToggleDropdown = useCallback(() => setIsDropdownOpen(p => !p), [])
  const handleModeChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => setMode(e.target.value as UserMode), [])

  return (
    <div className="w-full flex flex-col items-center">
      <img src="/login_illustration.png" alt="Log In" className="w-[140px] h-auto mb-4 opacity-100" />
      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 text-center w-full">Welcome Back</h3>

      <div className="flex flex-col gap-4 w-full">
        <div className="relative">
          <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">IDENTITY</label>
          <div onClick={handleToggleDropdown} className="w-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#121216] p-3 text-gray-900 dark:text-gray-100 cursor-pointer flex justify-between">
            <span>{selectedUser ? selectedUser.username : "Choose profile..."}</span>
            <span className="text-xs text-gray-500">▼</span>
          </div>

          <UserDropdown
            isOpen={isDropdownOpen}
            onSearchChange={setDebouncedSearch}
            users={stableUsers}
            isLoading={isLoading}
            isFetchingNextPage={isFetchingNextPage}
            hasNextPage={Boolean(hasNextPage)}
            onScroll={handleScroll}
            onSelectUser={handleSelectUser}
          />
        </div>

        {selectedUser && (
          <>
            <div>
              <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">MODE</label>
              <select value={mode} onChange={handleModeChange} className="w-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#121216] p-3 text-gray-900 dark:text-gray-100 outline-none appearance-none">
                <option value="candidate">Candidate</option>
                <option value="recruiter">Recruiter</option>
              </select>
            </div>

            <button onClick={handleLogin} disabled={isPending} className="w-full mt-2 py-3 bg-[indigo]/50 disabled:bg-gray-400 text-white font-medium border-0 cursor-pointer">
              {isPending ? "Loading..." : "Log In"}
            </button>

            {isError && <div className="text-red-500 text-sm text-center border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/10 p-2">{error?.message || "Login failed"}</div>}
          </>
        )}

        <button onClick={onCancel} className="mt-2 text-sm text-gray-500 border-0 bg-transparent cursor-pointer w-full">Cancel</button>
      </div>
    </div>
  )
})

const OnboardingModal = () => {
  const [view, setView] = useState<'welcome' | 'signup' | 'login' | 'hidden'>('welcome')

  const { data: loggedUser } = onboardingGetLoggedUser()
  const setUser = useUserStore((s) => s.setUser)
  const navigate = useNavigate()

  useEffect(() => {
    if (!loggedUser) return
    setUser(loggedUser.id, loggedUser.username, loggedUser.mode)
    navigate("/dashboard/chat")
  }, [loggedUser, setUser, navigate])

  const handleModeSelect = useCallback((v: 'welcome' | 'signup' | 'login' | 'hidden') => setView(v), [])
  const handleCancel = useCallback(() => setView('welcome'), [])

  if (view === 'hidden') return null

  return (
    <div className="fixed inset-0 z-[9999] flex justify-center items-center bg-white dark:bg-[#0a0a0c] bg-cover bg-center bg-no-repeat">
      <div className="w-full max-w-sm bg-white/90 dark:bg-[#0a0a0c]/90 p-8 border border-gray-200 dark:border-gray-800 flex flex-col items-center shadow-lg">
        {view === 'welcome' && <WelcomeView onModeSelect={handleModeSelect} />}
        {view === 'signup' && <SignUpView onCancel={handleCancel} />}
        {view === 'login' && <LoginView onCancel={handleCancel} />}
      </div>
    </div>
  )
}

export default OnboardingModal