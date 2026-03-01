import { Outlet } from "react-router-dom"
import { useUserStore } from "../store/user.store"
import OnboardingModal from "../features/Onboarding/OnboardingModal"

const DashboardLayout = () => {
  const { name } = useUserStore()

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      {!name && <OnboardingModal />}

      <aside style={{ width: "240px", background: "#111", color: "#fff", padding: "1rem" }}>
        Sidebar
      </aside>

      <main style={{ flex: 1, padding: "2rem" }}>
        {name && <Outlet />}
      </main>
    </div>
  )
}

export default DashboardLayout