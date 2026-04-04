type Project = {
  id: string
  title?: string
  description?: string
  link?: string
}

type ProjectsGridProps = {
  projects?: Project[]
  animate?: boolean
  onAnimationComplete?: () => void
}

const ProjectsCard = ({ projects = [], animate = false, onAnimationComplete }: ProjectsGridProps) => {
  return (
    <div className="grid gap-3 mt-3">
      {projects.map((project, index) => (
        <a
          key={project.id}
          href={project.link || "#"}
          target="_blank"
          style={animate ? { animationDelay: `${index * 180}ms` } : {}}
          onAnimationEnd={onAnimationComplete}
          className={`
            group block rounded-xl border border-neutral-200 bg-white p-4 shadow-sm
            hover:shadow-md hover:border-neutral-300 transition-all duration-200
            ${animate ? "animate-card-popup opacity-0" : ""}
          `}
        >
          <h3 className="text-base font-semibold text-gray-900 group-hover:text-blue-600">
            {project.title}
          </h3>

          <p className="mt-2 text-sm text-gray-600 line-clamp-2">
            {project.description}
          </p>

          <div className="mt-3 flex items-center text-xs font-medium text-blue-600 group-hover:underline">
            View project
          </div>
        </a>
      ))}
    </div>
  )
}

export default ProjectsCard
