import { memo } from 'react';
import { FolderGit2 } from 'lucide-react';
import type { PortfolioData } from '../types';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface ProjectsProps {
  data: PortfolioData;
}

const Projects = memo(({ data }: ProjectsProps) => {
  const projects = data.projects || [];

  if (projects.length === 0) return null;

  return (
    <section className="py-20 px-6 max-w-5xl mx-auto w-full transition-colors duration-300">
      <div className="flex items-center gap-3 mb-10">
        <FolderGit2 className="w-8 h-8 text-indigo-500 dark:text-indigo-400" />
        <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 tracking-tight transition-colors">Featured Projects</h2>
      </div>
      <div className="flex flex-col gap-6">
        {projects.map((proj, idx) => {
          const { title, company, tech_stack, description, project_pic } = proj.meta_data;
          return (
            <div
              key={idx}
              className="group bg-white dark:bg-[#0B1120]/40 border border-gray-100 dark:border-gray-800/60 rounded-2xl overflow-hidden hover:-translate-y-0.5 hover:shadow-xl dark:hover:shadow-[0_4px_20px_rgba(255,255,255,0.02)] hover:border-gray-200 dark:hover:border-gray-700/80 transition-all duration-300"
            >
              <div className="p-5 md:p-9 flex flex-col h-full">
                <div className="flex items-start justify-between gap-4 md:gap-5 mb-4 md:mb-5 border-b border-gray-50 dark:border-gray-800/50 pb-4 md:pb-5">
                  <div className="flex-1">
                    <h3 className="text-lg md:text-2xl font-bold text-gray-900 dark:text-gray-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors mb-1 md:mb-1.5 tracking-tight">{title}</h3>
                    <h4 className="text-[10px] md:text-sm font-medium text-gray-500 uppercase tracking-widest">{company}</h4>
                  </div>
                  {project_pic && (
                    <div className="w-12 h-12 md:w-16 md:h-16 p-1 flex items-center justify-center rounded-xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-black shrink-0 shadow-sm transition-transform duration-300 group-hover:scale-105">
                      <img
                        src={project_pic}
                        alt={title}
                        loading="lazy"
                        className="max-w-full max-h-full object-contain"
                      />
                    </div>
                  )}
                </div>

                <div className="prose prose-xs md:prose-sm dark:prose-invert max-w-none text-[13px] md:text-sm text-gray-600 dark:text-gray-400/90 mb-5 md:mb-6 font-light prose-p:leading-relaxed prose-li:my-1 flex-1">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {description}
                  </ReactMarkdown>
                </div>

                <div className="flex flex-wrap gap-1.5 md:gap-2 mt-auto">
                  {tech_stack?.map((tech, tIdx) => (
                    <span
                      key={tIdx}
                      className="px-2 md:px-2.5 py-0.5 md:py-1 bg-gray-50 dark:bg-gray-800/40 text-gray-600 dark:text-gray-400 rounded-md text-[9px] md:text-[11px] font-semibold border border-gray-100 dark:border-gray-800 transition-colors"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
});

Projects.displayName = 'Projects';
export default Projects;
