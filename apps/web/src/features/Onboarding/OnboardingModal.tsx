import { useState, useEffect } from "react"
import { useUserStore } from "../../store/user.store"
import { useNavigate } from "react-router-dom"
import { onboardingCreateUser, onboardingFetchAllUsersInfinite ,onboardingUpdateUser} from '../../react-queries/OnboardingQueries'

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

  const { mutateAsync: createMutation , isPending: isCreatePending , isError: isCreateError , error: createError } = onboardingCreateUser()
  const { mutateAsync: updateMutation , isPending: isUpdatePending , isError: isUpdateError , error: updateError } = onboardingUpdateUser()

  // Since we fetch users directly, handleLogin just sets the store state locally.
  const handleLogin = async () => {
    if (!username.trim()) return
    let user : any = await updateMutation({user_id: selectedUser.id, mode})
    setUser(user.id, user.username, user.mode)
    navigate("/dashboard/chat")
  }

  const handleCreate = async () => {
    if (!username.trim()) return
    let user : any = await createMutation({username, mode})
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
    <div style={{ position: "fixed", inset: 0, background: "#000000aa", display: "flex", justifyContent: "center", alignItems: "center" }}>
      <div style={{ background: "white", padding: "2rem", width: "400px", borderRadius: "8px" , color: 'black'}}>
        
        {isFirstTime === null && (
          <>
            <h2>Welcome 👋</h2>
            <p>Is this your first time?</p>
            <button onClick={() => setIsFirstTime(true)}>Yes</button>
            <button onClick={() => setIsFirstTime(false)}>No</button>
          </>
        )}

        {isFirstTime === true && (
          <>
            <h3>Create Profile</h3>

        <input
          placeholder="Unique Name"
          value={username}
          onChange={(e) => {
            const value = e.target.value
            if (/^[a-zA-Z0-9]*$/.test(value)) {
              setName(value)
            }
          }}
          style={{ width: "100%", marginBottom: "1rem" }}
        />

            <select
              value={mode}
              onChange={(e) => setMode(e.target.value as any)}
              style={{ width: "100%", marginBottom: "1rem" }}
            >
              <option value="candidate">Candidate</option>
              <option value="recruiter">Recruiter</option>
            </select>

            <button onClick={handleCreate} disabled={isCreatePending}>
              { isCreatePending ? "Creating..." : "Create" }
            </button>

            {isCreateError && (
              <p style={{ color: "red" }}>
                Failed to create user {createError?.message}
              </p>
            )}
          </>
        )}

        {isFirstTime === false && (
          <>
            <h3>Login</h3>

            <div style={{ position: "relative", width: "100%", marginBottom: "1rem" }}>
              <div 
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                style={{
                  width: "100%", 
                  padding: "8px", 
                  border: "1px solid #ccc", 
                  borderRadius: "4px",
                  cursor: "pointer",
                  background: "#fff"
                }}
              >
                {selectedUser ? selectedUser.username : "Select User Dropdown"}
              </div>

              {isDropdownOpen && (
                <div style={{
                    position: "absolute",
                    top: "100%",
                    left: 0,
                    width: "100%",
                    background: "white",
                    border: "1px solid #ccc",
                    borderRadius: "4px",
                    zIndex: 10
                  }}>
                  <input
                    autoFocus
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search users..."
                    style={{ width: "calc(100% - 16px)", margin: "8px", padding: "8px", boxSizing: "border-box", border: "1px solid #ccc", borderRadius: "4px" }}
                  />
                  <ul 
                    onScroll={handleScroll}
                    style={{
                      maxHeight: "150px",
                      overflowY: "auto",
                      margin: 0,
                      padding: 0,
                      listStyle: "none"
                    }}
                  >
                    {isLoading && <li style={{ padding: "8px" }}>Loading...</li>}
                    {users.map((u: any) => (
                      <li 
                        key={u.id} 
                        onClick={() => handleSelectUser(u)}
                        style={{ padding: "8px", cursor: "pointer", borderBottom: "1px solid #eee" }}
                      >
                        {u.username}
                      </li>
                    ))}
                    {isFetchingNextPage && <li style={{ padding: "8px" }}>Loading more...</li>}
                    {!hasNextPage && !isLoading && users.length > 0 && <li style={{ padding: "8px", color: "gray", fontSize: "12px" }}>No more users</li>}
                    {!isLoading && users.length === 0 && <li style={{ padding: "8px", color: "gray", fontSize: "12px" }}>No users found</li>}
                  </ul>
                </div>
              )}
            </div>

            {selectedUser && (
              <>
                <select
                  value={mode}
                  onChange={(e) => setMode(e.target.value as any)}
                  style={{ width: "100%", marginBottom: "1rem" }}
                >
                  <option value="candidate">Candidate</option>
                  <option value="recruiter">Recruiter</option>
                </select>

                <button onClick={handleLogin} disabled={isUpdatePending}>
                  { isUpdatePending ? "Loading..." : "Login" }
                </button>

                {isUpdateError && (
                  <p style={{ color: "red" }}>
                    Failed to login {updateError?.message}
                  </p>
                )}                
              </>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default OnboardingModal