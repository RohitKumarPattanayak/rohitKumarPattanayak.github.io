import { Terminal, Sparkles, Code2, ArrowRight } from "lucide-react";
import { memo } from "react";

const EmptyState = memo(({ onCommandClick }: { onCommandClick: (text: string) => void }) => (
    <div className="flex flex-col items-center justify-center h-full px-6 text-center animate-in fade-in duration-700">
        <div className="relative mb-8">
            <div className="absolute inset-0 bg-indigo-200 dark:bg-indigo-500 blur-3xl opacity-40 dark:opacity-20 rounded-full" />
            <div className="h-24 w-24 rounded-3xl bg-white/50 dark:bg-gradient-to-b dark:from-white/10 dark:to-white/5 border border-indigo-100 dark:border-white/10 backdrop-blur-xl flex items-center justify-center shadow-xl dark:shadow-2xl relative">
                <Terminal size={40} className="text-indigo-600 dark:text-indigo-400" strokeWidth={1.5} />
            </div>
        </div>
        <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white mb-3">Nexus Action Board</h2>
        <p className="text-gray-500 dark:text-gray-400 max-w-md text-sm leading-relaxed mb-10">
            Enter a command to generate reports, analyze data, or synthesize code. The system is standing by.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-2xl">
            {[
                { icon: Sparkles, text: "Generate System Overview" },
                { icon: Code2, text: "Refactor Database Schema" },
            ].map((item, i) => (
                <button
                    key={i}
                    onClick={() => onCommandClick(item.text)}
                    className="group flex items-center gap-4 p-4 rounded-2xl bg-white dark:bg-white/[0.02] border border-gray-200 dark:border-white/[0.05] hover:bg-indigo-50 dark:hover:bg-indigo-500/10 hover:border-indigo-200 dark:hover:border-indigo-500/30 transition-all duration-300 text-left shadow-sm dark:shadow-none hover:shadow-md dark:hover:shadow-none"
                >
                    <div className="h-10 w-10 shrink-0 rounded-full bg-gray-50 dark:bg-black/40 flex items-center justify-center border border-gray-200 dark:border-white/5 group-hover:scale-110 group-hover:bg-white dark:group-hover:bg-black/60 transition-transform">
                        <item.icon size={18} className="text-gray-500 dark:text-gray-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors" />
                    </div>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white transition-colors">
                        {item.text}
                    </span>
                    <ArrowRight size={16} className="ml-auto text-transparent group-hover:text-indigo-500 dark:group-hover:text-indigo-400 -translate-x-2 group-hover:translate-x-0 transition-all" />
                </button>
            ))}
        </div>
    </div>
));

export default EmptyState;