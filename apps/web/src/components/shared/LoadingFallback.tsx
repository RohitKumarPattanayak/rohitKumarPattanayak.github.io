import { Loader2 } from "lucide-react";

interface Props {
  fullScreen?: boolean;
  message?: string;
}

export const LoadingFallback = ({ fullScreen = true, message = "Loading Interface..." }: Props) => {
  return (
    <div className={`flex flex-col items-center justify-center ${fullScreen ? "h-screen w-full" : "h-full w-full min-h-[300px]"} bg-slate-50/50 dark:bg-[#030303]/50 backdrop-blur-sm`}>
      <div className="flex flex-col items-center gap-4 animate-in fade-in zoom-in duration-700">
        <div className="relative">
          <div className="absolute inset-0 bg-indigo-500 blur-xl opacity-20 rounded-full" />
          <div className="w-14 h-14 bg-white dark:bg-white/5 border border-indigo-100 dark:border-white/10 rounded-2xl flex items-center justify-center shadow-xl dark:shadow-2xl relative">
            <Loader2 size={28} className="text-indigo-600 dark:text-indigo-400 animate-spin" strokeWidth={2.5} />
          </div>
        </div>
        <span className="text-indigo-600 dark:text-indigo-400 font-mono text-xs tracking-[0.2em] font-medium animate-pulse">
          {message.toUpperCase()}
        </span>
      </div>
    </div>
  );
};

export default LoadingFallback;
