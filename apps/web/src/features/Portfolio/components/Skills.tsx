import { memo, useMemo } from 'react';
import { Code2 } from 'lucide-react';
import type { PortfolioData } from '../types';

interface SkillsProps {
  data: PortfolioData;
}

const Skills = memo(({ data }: SkillsProps) => {
  const skillsStr = data.skills?.[0]?.meta_data?.skills;
  
  const skillsList = useMemo(() => {
    if (!skillsStr) return [];
    return skillsStr.split(',').map(s => s.trim()).filter(Boolean);
  }, [skillsStr]);

  if (skillsList.length === 0) return null;

  return (
    <section className="py-20 px-6 max-w-5xl mx-auto w-full transition-colors duration-300">
      <div className="flex items-center gap-3 mb-12">
        <Code2 className="w-8 h-8 text-amber-500" />
        <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 tracking-tight transition-colors">Technical Skills</h2>
      </div>
      <div className="flex flex-wrap gap-3">
        {skillsList.map((skill, idx) => (
          <span 
            key={idx} 
            className="px-3 md:px-4.5 py-1.5 md:py-2.5 bg-white dark:bg-[#0B1120]/80 border border-gray-200 dark:border-gray-800 rounded-lg md:rounded-xl text-gray-700 dark:text-gray-300 text-[11px] md:text-sm font-medium hover:border-amber-400/50 dark:hover:border-amber-500/50 hover:bg-amber-50 dark:hover:bg-amber-500/5 hover:text-amber-600 dark:hover:text-amber-400 hover:scale-[1.02] transition-all duration-300 cursor-default shadow-sm"
          >
            {skill}
          </span>
        ))}
      </div>
    </section>
  );
});

Skills.displayName = 'Skills';
export default Skills;
