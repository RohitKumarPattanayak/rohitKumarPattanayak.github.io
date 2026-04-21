import React, { useState, lazy, Suspense } from 'react';
import type { ProjectDetails } from './ProjectModal';

const ProjectModal = lazy(() => import('./ProjectModal'));

type ProjectsGridProps = {
  projects?: ProjectDetails[]
  animate?: boolean
  onAnimationComplete?: () => void
}

const ProjectsCard = ({ projects = [], animate = false, onAnimationComplete }: ProjectsGridProps) => {
  const [selectedProject, setSelectedProject] = useState<ProjectDetails | null>(null);

  return (
    <>
      <div className="grid gap-3 mt-3">
        {projects.map((project, index) => (
          <div
            key={project.id || index}
            onClick={() => setSelectedProject(project)}
            style={animate ? { animationDelay: `${index * 180}ms` } : {}}
            onAnimationEnd={onAnimationComplete}
            className={`
              group block rounded-xl border border-neutral-200 dark:border-white/[0.05] bg-white dark:bg-white/[0.02] p-4 shadow-sm
              hover:shadow-md hover:border-neutral-300 dark:hover:border-white/[0.1] cursor-pointer transition-all duration-300
              ${animate ? "animate-card-popup opacity-0" : ""}
            `}
          >
            <h3 className="text-sm md:text-base font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
              {project.title}
            </h3>

            <p className="mt-2 text-xs md:text-sm text-gray-600 dark:text-gray-400 line-clamp-2 leading-relaxed">
              {project.description}
            </p>

            <div className="mt-3 flex items-center text-xs font-medium text-blue-600 dark:text-blue-400 group-hover:underline">
              View project details →
            </div>
          </div>
        ))}
      </div>

      {selectedProject && (
        <Suspense fallback={<div className="fixed inset-0 z-[100] bg-black/20 animate-in fade-in"></div>}>
          <ProjectModal
            project={selectedProject}
            onClose={() => setSelectedProject(null)}
          />
        </Suspense>
      )}
    </>
  )
}

export default React.memo(ProjectsCard)
