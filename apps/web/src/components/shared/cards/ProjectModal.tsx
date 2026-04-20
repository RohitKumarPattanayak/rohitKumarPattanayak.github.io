import { useEffect } from 'react';
import { X, ExternalLink } from 'lucide-react';

export type ProjectDetails = {
  id: string;
  title?: string;
  description?: string;
  link?: string;
  company?: string;
  tech_stack?: string[] | string;
  project_pic?: string;
};

interface ProjectModalProps {
  project: ProjectDetails;
  onClose: () => void;
}

const ProjectModal = ({ project, onClose }: ProjectModalProps) => {
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, []);

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-slate-900/40 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl max-h-[85vh] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-300 border border-slate-100"
        onClick={e => e.stopPropagation()}
      >
        {/* Header / Image Area */}
        {project.project_pic && (
          <div className="relative w-full h-32 sm:h-48 bg-slate-50 flex items-center justify-center shrink-0 border-b border-slate-100 overflow-hidden">
            <img
              src={project.project_pic}
              alt={project.title}
              className="w-full h-full object-cover opacity-90"
            />
          </div>
        )}

        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 bg-white/80 hover:bg-white text-slate-600 rounded-full shadow-sm transition-all z-10 focus:outline-none"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-8 custom-scrollbar">
          <div className="mb-6">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight mb-2 pr-8">
              {project.title}
            </h2>
            {project.company && (
              <h3 className="text-xs sm:text-sm font-semibold text-slate-500 uppercase tracking-wider">
                {project.company}
              </h3>
            )}
          </div>

          <div className="prose prose-sm sm:prose-base max-w-none text-slate-600 font-normal leading-relaxed mb-8">
            {project.description ? (
              project.description.includes('\n-') ? (
                <>
                  {project.description.split('\n-')[0].trim() && (
                    <p className="mb-4 whitespace-pre-wrap">{project.description.split('\n-')[0].trim()}</p>
                  )}
                  <ul className="list-disc pl-5 space-y-2 marker:text-slate-400">
                    {project.description.split('\n-').slice(1).map((bullet, idx) => (
                      <li key={idx} className="pl-1 leading-relaxed">{bullet.trim()}</li>
                    ))}
                  </ul>
                </>
              ) : (
                <p className="whitespace-pre-wrap">{project.description}</p>
              )
            ) : null}
          </div>

          {/* Tech Stack */}
          {project.tech_stack && (
            <div className="mb-2">
              <h4 className="text-[10px] sm:text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Technologies Used</h4>
              <div className="flex flex-wrap gap-2">
                {(Array.isArray(project.tech_stack) ? project.tech_stack : (project.tech_stack as string).split(',')).map((tech, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1 bg-slate-50 border border-slate-200 text-slate-600 rounded-lg text-[10px] sm:text-xs font-medium"
                  >
                    {tech.trim()}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        {project.link && project.link !== "#" && (
          <div className="p-4 sm:p-6 border-t border-slate-100 bg-slate-50/50 flex justify-end shrink-0">
            <a
              href={project.link}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center px-6 py-2.5 bg-blue-600 text-white rounded-xl text-xs sm:text-sm font-medium hover:bg-blue-700 hover:shadow-md transition-all duration-300 group"
            >
              Visit Project
              <ExternalLink className="w-4 h-4 ml-2 group-hover:translate-x-0.5 transition-transform" />
            </a>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectModal;
