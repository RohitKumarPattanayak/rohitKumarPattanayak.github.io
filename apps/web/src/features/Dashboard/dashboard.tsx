import { dashboardFetchResumes } from "../../react-queries/DashboardQueries"

const DashboardPage = () => {
  const { data, isLoading, error } = dashboardFetchResumes();

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