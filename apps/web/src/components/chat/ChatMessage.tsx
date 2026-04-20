import { memo, lazy, Suspense } from "react";
import LoadingFallback from "../shared/LoadingFallback";

const TypewriterMarkdown = lazy(() => import("../shared/TypewriterMarkdown"));
const ProjectsCard = lazy(() => import("../shared/cards/ProjectsCard"));
const SkillsCard = lazy(() => import("../shared/cards/SkillsCard"));
const ExperienceCard = lazy(() => import("../shared/cards/ExperienceCard"));
const EducationCard = lazy(() => import("../shared/cards/EducationCard"));

interface ChatMessageProps {
    msg: any;
    username?: string;
    sessionStartTime: number;
    scrollToBottomInstant: () => void;
    isLatest: boolean;
}

const ChatMessage = memo(({ msg, sessionStartTime, scrollToBottomInstant, isLatest }: ChatMessageProps) => {
    return (
        <div
            className={`group ${isLatest ? "animate-in slide-in-from-bottom-4 fade-in duration-500" : ""}`}
        >
            {msg.role === 'user' ? (
                <div className="flex items-center gap-3 mb-6 pl-2">
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 dark:bg-indigo-500 border border-gray-200 dark:border-white/[0.05] shadow-sm transform-gpu">
                        {/* <span className="text-emerald-600 dark:text-emerald-400 text-xs font-mono font-bold uppercase tracking-wider">{username || "User"}</span> */}
                        <span className="text-gray-800 dark:text-gray-300 text-xs md:text-sm font-medium">{msg.message}</span>
                    </div>
                    <div className="text-[10px] text-gray-400 dark:text-gray-600 font-mono">
                        {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </div>
                </div>
            ) : (
                <div className="relative pl-6 mb-8 before:absolute before:left-2 before:w-px before:bg-gradient-to-b before:from-indigo-300 dark:before:from-indigo-500/50 before:to-transparent">
                    <div className="p-6 rounded-3xl border overflow-hidden relative bg-white dark:bg-[#0a0a0c] border-gray-200 dark:border-white/[0.06] shadow-sm transform-gpu">
                        <div className="text-[13px] md:text-[15px] leading-relaxed text-gray-700 dark:text-gray-200 tracking-wide markdown-content">
                            {msg.content_type == 'text' &&
                                <Suspense fallback={<LoadingFallback fullScreen={false} message="Loading markup response..." />}>
                                    <TypewriterMarkdown
                                        content={msg.message}
                                        animate={new Date(msg.created_at).getTime() > sessionStartTime}
                                        onComplete={scrollToBottomInstant}
                                    />
                                </Suspense>
                            }
                            {msg.content_type === "list_projects" && (
                                <Suspense fallback={<LoadingFallback fullScreen={false} message="Loading skills..." />}>
                                    <ProjectsCard
                                        projects={msg.message}
                                        animate={new Date(msg.created_at).getTime() > sessionStartTime}
                                        onAnimationComplete={scrollToBottomInstant}
                                    />
                                </Suspense>
                            )}
                            {msg.content_type == "list_skills" && (
                                <Suspense fallback={<LoadingFallback fullScreen={false} message="Loading skills..." />}>
                                    <SkillsCard
                                        skills={msg.message}
                                        animate={new Date(msg.created_at).getTime() > sessionStartTime}
                                        onAnimationComplete={scrollToBottomInstant}
                                    />
                                </Suspense>
                            )}
                            {msg.content_type === "list_experience" && (
                                <Suspense fallback={<LoadingFallback fullScreen={false} message="Loading experience..." />}>
                                    <ExperienceCard
                                        experiences={msg.message}
                                        animate={new Date(msg.created_at).getTime() > sessionStartTime}
                                        onAnimationComplete={scrollToBottomInstant}
                                    />
                                </Suspense>
                            )}
                            {msg.content_type === "list_education" && (
                                <Suspense fallback={<LoadingFallback fullScreen={false} message="Loading education..." />}>
                                    <EducationCard
                                        education={msg.message}
                                        animate={new Date(msg.created_at).getTime() > sessionStartTime}
                                        onAnimationComplete={scrollToBottomInstant}
                                    />
                                </Suspense>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
});

ChatMessage.displayName = "ChatMessage";

export default ChatMessage;
