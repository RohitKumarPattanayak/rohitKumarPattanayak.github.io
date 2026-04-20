import { memo, useRef, useEffect } from "react";
import { Terminal, Sparkles } from "lucide-react";
import SuggestionPrompt from "./SuggestionPrompt";

interface CommandBarProps {
    currentInput: string;
    setCurrentInput: (val: string) => void;
    handleSend: (forcedInput?: string) => void;
    isChatPending: boolean;
}

const CommandBar = memo(({ currentInput, setCurrentInput, handleSend, isChatPending }: CommandBarProps) => {
    const inputRef = useRef<HTMLInputElement>(null);

    // Focus input on mount
    useEffect(() => {
        inputRef.current?.focus();
    }, []);

    return (
        <div className="w-full max-w-[58rem] px-2 sm:px-4 mt-auto mx-auto pb-4 sm:pb-6 md:pb-8">
            <SuggestionPrompt handleSend={handleSend} setCurrentInput={setCurrentInput} />
            <div className="relative group">
                {/* Outer glow */}
                <div className="absolute -inset-1 bg-gradient-to-r from-indigo-300 dark:from-indigo-500 to-emerald-300 dark:to-emerald-500 rounded-[2rem] blur opacity-30 dark:opacity-20 group-hover:opacity-60 dark:group-hover:opacity-40 transition duration-1000 group-hover:duration-200" />

                <div className="relative flex items-center bg-white/90 dark:bg-black/80 border border-gray-200 dark:border-white/10 rounded-[2rem] shadow-sm overflow-hidden focus-within:bg-white dark:focus-within:bg-black/90 focus-within:border-indigo-300 dark:focus-within:border-white/20 focus-within:ring-2 dark:focus-within:ring-1 focus-within:ring-indigo-500/50 transform-gpu">
                    <div className="pl-4 sm:pl-6 pr-2 sm:pr-3 flex items-center text-indigo-500 dark:text-indigo-400">
                        <Terminal className="w-4 h-4 sm:w-[18px] sm:h-[18px]" />
                    </div>

                    <input
                        ref={inputRef}
                        type="text"
                        id="input-chat-bar"
                        value={currentInput}
                        onChange={(e) => setCurrentInput(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === "Enter" && !e.shiftKey) {
                                e.preventDefault();
                                handleSend();
                            }
                        }}
                        placeholder="Enter system command..."
                        className="w-full bg-transparent text-gray-900 dark:text-gray-100 py-3 sm:py-5 text-[13px] sm:text-[15px] placeholder:text-gray-400 dark:placeholder:text-gray-600 focus:outline-none tracking-wide"
                        spellCheck="false"
                        disabled={isChatPending}
                    />

                    <div id="send-chat-button" className="pr-2 sm:pr-3 pl-1 sm:pl-2 py-1.5 sm:py-2">
                        <button
                            onClick={() => handleSend()}
                            disabled={!currentInput.trim() || isChatPending}
                            className="p-2 sm:p-3 w-8 h-8 sm:w-auto sm:h-auto bg-indigo-600 dark:bg-white text-white dark:text-black rounded-full hover:bg-indigo-700 dark:hover:bg-indigo-50 dark:hover:text-indigo-600 transition-all duration-300 disabled:opacity-50 disabled:scale-95 disabled:cursor-not-allowed focus:outline-none flex items-center justify-center transform active:scale-90 shadow-md"
                        >
                            <code className="hidden sm:inline-block text-[10px] font-bold tracking-widest uppercase mr-1.5 opacity-80 dark:opacity-60">
                                {isChatPending ? 'SENDING' : 'SEND'}
                            </code>
                            {isChatPending ? (
                                <div className="w-3.5 h-3.5 sm:w-4 sm:h-4 border-2 border-white/30 dark:border-black/30 border-t-white dark:border-t-black rounded-full animate-spin" />
                            ) : (
                                <Sparkles className="w-4 h-4 sm:w-[16px] sm:h-[16px] opacity-100 dark:opacity-80" />
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
});

CommandBar.displayName = "CommandBar";

export default CommandBar;
