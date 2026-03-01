import { Routes, Route, Navigate } from "react-router-dom"
import DashboardLayout from "./layout"
import DashboardPage from "../features/Dashboard/dashboard"

export const AppRouter = () => {
  return (
    <Routes>
        {/* redirection */}
      <Route path="/" element={<Navigate to="/dashboard" />} />

      <Route path="/dashboard" element={<DashboardLayout />}>
        <Route index element={<DashboardPage />} />
      </Route>
    </Routes>
  )
}