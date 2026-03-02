import { useQuery } from "@tanstack/react-query"
import { getResumes } from "../services/resume.service"

const dashboardQueries = {
  getResumes: (options = {}) => ({
    queryKey: ['fetch-resumes'],
    queryFn: getResumes,
    options
  }),
}


export const dashboardFetchResumes = () => {
  return useQuery(dashboardQueries.getResumes())
}