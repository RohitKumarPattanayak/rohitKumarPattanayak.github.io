type ProjectCardProps = {
  title?: string
  description?: string
  link?: string
  animate?: boolean
}

const ProjectCard = ({
  title = "",
  description = "",
  link = "#",
  animate = false,
}: ProjectCardProps) => {
  return (
    <a
      href={link}
      target="_blank"
      className={`
        group block rounded-xl border border-neutral-200 bg-white p-4 shadow-sm
        hover:shadow-md hover:border-neutral-300 transition-all duration-200
        ${animate ? "animate-card-popup" : ""}
      `}
    >
      <h3 className="text-base font-semibold text-gray-900 group-hover:text-blue-600">
        {title}
      </h3>

      <p className="mt-2 text-sm text-gray-600 line-clamp-2">
        {description}
      </p>

      <div className="mt-3 flex items-center text-xs font-medium text-blue-600 group-hover:underline">
        View project
      </div>
    </a>
  )
}

export default ProjectCard