import { Outlet } from "react-router-dom"
import { useUserStore } from "../store/user.store"
import OnboardingModal from "../features/Onboarding/OnboardingModal"
// import DashboardPage from "../features/Dashboard/dashboard"

const DashboardLayout = () => {
  const { username } = useUserStore()

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      {!username && <OnboardingModal />}
      <aside style={{ width: "240px", background: "#111", color: "#fff", padding: "1rem" }}>
        Sidebar
      </aside>

      {/* <DashboardPage /> */}
      <main style={{ flex: 1, padding: "2rem" }}>
        {username && <Outlet />}
      </main>
    </div>
  )
}

export default DashboardLayout