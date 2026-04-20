import { Sparkles, Code2, ArrowRight } from "lucide-react";
import { memo } from "react";

const EmptyState = memo(({ onCommandClick }: { onCommandClick: (text: string) => void }) => (
    <div id="chat-empty-state" className="flex flex-col items-center font-mono justify-center h-full px-4 sm:px-6 text-center animate-in fade-in duration-700">
        <div className="relative mb-6 sm:mb-8">
            <div className="absolute inset-0 bg-indigo-200 dark:bg-indigo-500 blur-3xl opacity-40 dark:opacity-20 rounded-full" />
            <div className="h-20 w-20 sm:h-24 sm:w-24 rounded-2xl sm:rounded-3xl overflow-hidden bg-white/50 dark:bg-gradient-to-b dark:from-white/10 dark:to-white/5 border border-indigo-100 dark:border-white/10 flex items-center justify-center shadow-xl dark:shadow-2xl relative group text-center">
                <img
                    src="/action-board.png"
                    alt="Action Board Graphic"
                    className="w-full h-full object-contain p-2 sm:p-0 transition-transform duration-500 group-hover:scale-110 drop-shadow-lg"
                />
            </div>
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900 dark:text-white mb-2 sm:mb-3">Smart Action Board</h2>
        <p className="text-gray-500 dark:text-gray-400 max-w-md text-xs sm:text-sm leading-relaxed mb-6 sm:mb-10 px-2 sm:px-0">
            Ask anything about my experience, projects, or technical skills. This assistant provides quick, relevant answers to help you evaluate my profile efficiently.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 w-full max-w-2xl">
            {[
                { icon: Sparkles, text: "Generate System Overview" },
                { icon: Code2, text: "Refactor Database Schema" },
            ].map((item, i) => (
                <button
                    key={i}
                    onClick={() => onCommandClick(item.text)}
                    className="group flex items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-white dark:bg-white/[0.02] border border-gray-200 dark:border-white/[0.05] hover:bg-indigo-50 dark:hover:bg-indigo-500/10 hover:border-indigo-200 dark:hover:border-indigo-500/30 transition-all duration-300 text-left shadow-sm dark:shadow-none hover:shadow-md dark:hover:shadow-none"
                >
                    <div className="h-8 w-8 sm:h-10 sm:w-10 shrink-0 rounded-full bg-gray-50 dark:bg-black/40 flex items-center justify-center border border-gray-200 dark:border-white/5 group-hover:scale-110 group-hover:bg-white dark:group-hover:bg-black/60 transition-transform">
                        <item.icon className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500 dark:text-gray-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors" />
                    </div>
                    <span className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white transition-colors">
                        {item.text}
                    </span>
                    <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 ml-auto text-transparent group-hover:text-indigo-500 dark:group-hover:text-indigo-400 -translate-x-2 group-hover:translate-x-0 transition-all" />
                </button>
            ))}
        </div>
    </div>
));

export default EmptyState;