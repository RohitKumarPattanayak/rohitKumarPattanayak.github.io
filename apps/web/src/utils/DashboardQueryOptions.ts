import { getResumes } from "../services/resume.service"

export default function dashboardQueryOptions() {
    return {
        queryKey: ["resumes"],
        queryFn: getResumes,
      }
}