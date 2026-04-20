import { GraduationCap, Calendar, MapPin, Award } from "lucide-react";
import React from 'react';

type Education = {
    id: string
    institution?: string
    degree?: string
    start_year?: string
    end_year?: string
}

type EducationGridProps = {
    education?: Education[]
    animate?: boolean
    onAnimationComplete?: () => void
}

const EducationCard = ({ education = [], animate = false, onAnimationComplete }: EducationGridProps) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            {education.map((edu, index) => (
                <div
                    key={edu.id}
                    style={animate ? { animationDelay: `${index * 150}ms` } : {}}
                    onAnimationEnd={
                        index === education.length - 1 ? onAnimationComplete : undefined
                    }
                    className={`
                        relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-50/50 to-white dark:from-white/[0.03] dark:to-white/[0.01] 
                        border border-indigo-100/50 dark:border-white/[0.08] p-6 shadow-sm 
                        hover:shadow-md hover:-translate-y-1 group
                        ${animate ? "animate-card-popup opacity-0" : ""}
                    `}
                >
                    {/* Background decoration */}
                    <div className="absolute -right-6 -top-6 text-indigo-100/50 dark:text-white/[0.02] group-hover:scale-110 group-hover:-rotate-12 transition-transform duration-500 pointer-events-none">
                        <Award size={120} />
                    </div>

                    <div className="relative z-10 flex flex-col h-full">
                        <div className="w-12 h-12 rounded-xl bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-5 group-hover:scale-110 group-hover:bg-indigo-600 group-hover:text-white dark:group-hover:bg-indigo-500 dark:group-hover:text-white shadow-sm border border-indigo-200/50 dark:border-indigo-400/30">
                            <GraduationCap size={24} />
                        </div>

                        <h3 className="text-base md:text-lg font-bold text-gray-900 dark:text-white leading-tight mb-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                            {edu.degree}
                        </h3>
                        
                        <div className="text-sm md:text-[15px] font-semibold text-gray-700 dark:text-gray-300 mb-5 flex gap-2 items-start">
                            <MapPin size={16} className="text-gray-400 shrink-0 mt-0.5" />
                            <span className="leading-snug">{edu.institution}</span>
                        </div>

                        <div className="mt-auto pt-4 border-t border-indigo-100/50 dark:border-white/5 flex items-center justify-between text-xs font-semibold text-gray-500 dark:text-gray-400">
                            <div className="flex items-center gap-1.5 bg-white dark:bg-black/20 py-1.5 px-3 rounded-full border border-gray-100 dark:border-white/5 shadow-sm">
                                <Calendar size={13} className="text-indigo-500 dark:text-indigo-400" />
                                <span>{edu.start_year} - {edu.end_year || "Present"}</span>
                            </div>
                            <div className="h-6 w-6 rounded-full bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <div className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    )
}

export default React.memo(EducationCard)
