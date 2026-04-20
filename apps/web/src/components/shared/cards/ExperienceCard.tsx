import { Briefcase, Calendar } from "lucide-react";
import React from 'react';

type Experience = {
    id: string
    company?: string
    role?: string
    start_date?: string
    end_date?: string
    description?: string
}

type ExperienceGridProps = {
    experiences?: Experience[]
    animate?: boolean
    onAnimationComplete?: () => void
}

const ExperienceCard = ({ experiences = [], animate = false, onAnimationComplete }: ExperienceGridProps) => {
    return (
        <div className="flex flex-col gap-4 mt-4 relative">
            {/* Timeline line */}
            <div className="absolute left-[19px] top-4 bottom-4 w-[2px] bg-indigo-100 dark:bg-indigo-900/30 hidden sm:block" />
            
            {experiences.map((exp, index) => (
                <div
                    key={exp.id}
                    style={animate ? { animationDelay: `${index * 200}ms` } : {}}
                    onAnimationEnd={
                        index === experiences.length - 1 ? onAnimationComplete : undefined
                    }
                    className={`
                        relative sm:pl-14 px-4 py-5 rounded-2xl bg-white dark:bg-white/[0.02] 
                        border border-gray-100 dark:border-white/[0.05] shadow-sm 
                        hover:shadow-md hover:border-indigo-200 dark:hover:border-indigo-500/30 
                        group
                        ${animate ? "animate-card-popup opacity-0" : ""}
                    `}
                >
                    {/* Timeline dot/icon - Only visible on sm and up */}
                    <div className="absolute left-0 top-7 -translate-y-1/2 w-10 h-10 rounded-full bg-indigo-50 dark:bg-indigo-500/10 border-4 border-white dark:border-[#0a0a0c] items-center justify-center text-indigo-600 dark:text-indigo-400 group-hover:scale-110 group-hover:bg-indigo-100 dark:group-hover:bg-indigo-500/20 shadow-sm z-10 hidden sm:flex">
                        <Briefcase size={16} />
                    </div>

                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-2 mb-3">
                        <div>
                            <h3 className="text-base md:text-lg font-bold text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                                {exp.role}
                            </h3>
                            <h4 className="text-sm md:text-[15px] font-semibold text-indigo-600/80 dark:text-indigo-300/80 mt-0.5">
                                {exp.company}
                            </h4>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-white/5 py-1.5 px-3 rounded-full whitespace-nowrap self-start border border-gray-100 dark:border-white/[0.05]">
                            <Calendar size={12} className="text-indigo-500 dark:text-indigo-400" />
                            <span>{exp.start_date}</span>
                            <span className="mx-0.5">-</span>
                            <span>{exp.end_date || "Present"}</span>
                        </div>
                    </div>

                    <div className="mt-3 text-xs md:text-sm text-gray-600 dark:text-gray-400 leading-relaxed text-justify relative bg-gray-50/50 dark:bg-white/[0.01] p-4 rounded-xl border border-gray-100/50 dark:border-white/[0.02]">
                        {exp.description}
                    </div>
                </div>
            ))}
        </div>
    )
}

export default React.memo(ExperienceCard)
