import { useQuery } from "@tanstack/react-query"
import { getResumes } from "../services/resume.service"
import { getPortfolio } from "../services/dashboard.service"

const dashboardQueries = {
  getResumes: (isActive: boolean | null = null, options = {}) => ({
    queryKey: ['fetch-resumes', isActive],
    queryFn: () => getResumes(isActive),
    ...options
  }),
  getPortfolio: (options = {}) => ({
    queryKey: ['fetch-portfolio'],
    queryFn: () => getPortfolio(),
    ...options
  })
}

export const dashboardFetchResumes = (isActive: boolean | null = null) => {
  return useQuery(dashboardQueries.getResumes(isActive))
} 

export const dashboardFetchPortfolio = () => {
  return useQuery(dashboardQueries.getPortfolio())
}