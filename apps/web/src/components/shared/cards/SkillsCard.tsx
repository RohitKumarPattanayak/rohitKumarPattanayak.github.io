type Skill = {
    id: string
    content: string
}

type SkillsGridProps = {
    skills?: Skill[]
    animate?: boolean
    onAnimationComplete?: () => void
}

import React from 'react';

const Skillscard = ({ skills = [], animate = false, onAnimationComplete }: SkillsGridProps) => {
    return (
        <div className="flex flex-wrap gap-2 mt-2">
            {skills.map((skill, index) => (
                <div
                    key={skill.id}
                    id={'skill_' + index}
                    onAnimationEnd={onAnimationComplete}
                    style={
                        animate
                            ? { animationDelay: `${index * 150}ms` }
                            : {}
                    }
                    className={`
                        px-3 py-1.5
                        text-xs md:text-sm font-medium
                        bg-neutral-100
                        text-gray-700
                        border border-neutral-200
                        rounded-full
                        hover:bg-blue-50
                        hover:border-blue-200
                        hover:text-blue-700
                        ${animate ? "animate-skill-pop opacity-0" : ""}
                    `}
                >
                    {skill.content}
                </div>
            ))}
        </div>
    )
}

export default React.memo(Skillscard)