import { memo } from "react";

const EmptyState = memo(() => (
    <div id="chat-empty-state" className="flex flex-col items-center font-mono justify-center h-full px-4 sm:px-6 text-center animate-in fade-in duration-700">
        <div className="relative mb-6 sm:mb-8">
            <div className="absolute inset-0 bg-indigo-200 dark:bg-indigo-500 blur-3xl opacity-40 dark:opacity-20 rounded-full" />
            <div className="relative h-20 w-20 sm:h-24 sm:w-24">
                {/* Light (scaled up) */}
                <img
                    src="/bot_logo_light.png"
                    alt="Bot Logo"
                    className="absolute inset-0 w-full h-full object-contain dark:opacity-0 transition-opacity duration-200"
                />

                {/* Dark (normal) */}
                <img
                    src="/bot_logo_dark.png"
                    alt="Bot Logo"
                    className="absolute inset-0 w-full h-full scale-[1.10] object-contain opacity-0 dark:opacity-100 transition-opacity duration-200"
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