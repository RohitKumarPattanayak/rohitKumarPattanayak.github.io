import { useState } from "react"
import { useUserStore } from "../../store/user.store"
import { createUser } from "../../services/user.service"
import { useMutation } from "@tanstack/react-query"
import { useNavigate } from "react-router-dom"

const OnboardingModal = () => {
  const [isFirstTime, setIsFirstTime] = useState<boolean | null>(null)
  const [name, setName] = useState("")
  const [mode, setMode] = useState<"recruiter" | "candidate">("candidate")

  const setUser = useUserStore((s) => s.setUser)
  const navigate = useNavigate()

  const createMutation = useMutation({
    mutationFn: () => createUser(name, mode),
    onSuccess: () => {
      setUser(name, mode)
      navigate("/dashboard/chat")
    },
  })

//   const loginMutation = useMutation({
//     mutationFn: () => loginUser(name),
//     onSuccess: (data) => {
//       setUser(data.name, data.mode)
//       navigate("/dashboard/chat")
//     },
//   })

  const handleCreate = () => {
    if (!name.trim()) return
    createMutation.mutate()
  }

//   const handleLogin = () => {
//     if (!name.trim()) return
//     loginMutation.mutate()
//   }

  return (
    <div style={{ position: "fixed", inset: 0, background: "#000000aa", display: "flex", justifyContent: "center", alignItems: "center" }}>
      <div style={{ background: "white", padding: "2rem", width: "400px", borderRadius: "8px" }}>
        
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
              value={name}
              onChange={(e) => setName(e.target.value)}
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

            <button onClick={handleCreate} disabled={createMutation.isPending}>
              {createMutation.isPending ? "Creating..." : "Create"}
            </button>

            {createMutation.isError && (
              <p style={{ color: "red" }}>
                Failed to create user
              </p>
            )}
          </>
        )}

        {isFirstTime === false && (
          <>
            <h3>Login</h3>

            <input
              placeholder="Unique Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={{ width: "100%", marginBottom: "1rem" }}
            />

            {/* <button onClick={handleLogin} disabled={loginMutation.isPending}>
              {loginMutation.isPending ? "Logging in..." : "Login"}
            </button>

            {loginMutation.isError && (
              <p style={{ color: "red" }}>
                Invalid user
              </p>
            )} */}
          </>
        )}
      </div>
    </div>
  )
}

export default OnboardingModal