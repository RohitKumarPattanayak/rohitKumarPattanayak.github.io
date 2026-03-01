import { useQuery } from "@tanstack/react-query"
import dashboardQueryOptions from "../../utils/DashboardQueryOptions"

const DashboardPage = () => {
  const { data, isLoading, error } = useQuery(dashboardQueryOptions())

  if (isLoading) return <p>Loading resumes...</p>

  if (error) return <p>Error loading resumes</p>
  
  return (
    <div>
      <h1>Dashboard</h1>
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  )
}

export default DashboardPage