import { memo } from "react";

const EmptyState = memo(() => (
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
    </div>
));

export default EmptyState;