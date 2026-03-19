import { useState, useRef, useEffect } from "react";
import { Terminal, Sparkles, Code2, ArrowRight } from "lucide-react";
import { useUserStore } from "../../store/user.store";
import { chatResponseMutation, getChatConversationQuery } from "../../react-queries/ChatQueries";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useQueryClient } from "@tanstack/react-query";

const TypewriterMarkdown = ({ content, animate, onTyping }: { content: string, animate: boolean, onTyping?: () => void }) => {
    const [displayedContent, setDisplayedContent] = useState(animate ? "" : content);
    
    useEffect(() => {
        if (!animate) {
            setDisplayedContent(content);
            return;
        }
        
        let i = 0;
        setDisplayedContent("");
        const interval = setInterval(() => {
            i += 4;
            if (i >= content.length) {
                setDisplayedContent(content);
                clearInterval(interval);
            } else {
                setDisplayedContent(content.slice(0, i));
            }
            if (onTyping) onTyping();
        }, 15);

        return () => clearInterval(interval);
    }, [content, animate]);

    return (
         <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {displayedContent}
        </ReactMarkdown>
    );
};

export const ChatPage = () => {
    const id = useUserStore((state) => state.id);
    const username = useUserStore((state) => state.username);
    const [currentInput, setCurrentInput] = useState("");
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const queryClient = useQueryClient();
    const sessionStartTime = useRef(Date.now());

    const { mutateAsync: inputChatResponse, isPending: isChatPending } = chatResponseMutation();
    const { data: chatConversation, isLoading: isChatConversationLoading } = getChatConversationQuery(id || 0);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    const scrollToBottomInstant = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "auto" });
    };

    useEffect(() => {
        const timeout = setTimeout(scrollToBottom, 100);
        return () => clearTimeout(timeout);
    }, [chatConversation]);

    // Focus input on mount
    useEffect(() => {
        inputRef.current?.focus();
    }, []);

    const handleSend = async () => {
        if (!currentInput.trim() || isChatPending) return;
        if (!id) return;

        const messageToSend = currentInput.trim();
        setCurrentInput("");

        // Optimistically add user message to cache
        queryClient.setQueryData(["get-user-conversations", id], (oldData: any[]) => {
            const newUserMessage = {
                id: Date.now(),
                message: messageToSend,
                role: "user",
                created_at: new Date().toISOString()
            };
            return oldData ? [newUserMessage, ...oldData] : [newUserMessage];
        });

        try {
            await inputChatResponse({ userId: id, message: messageToSend });
        } catch (error) {
            console.error("Failed to send message", error);
        } finally {
            // Once resolved, refetch the conversation to get the actual assistant reply
            queryClient.invalidateQueries({ queryKey: ["get-user-conversations", id] });
        }
    }

    const EmptyState = () => (
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
                        onClick={() => setCurrentInput(item.text)}
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
    );

    return (
        <div className="flex flex-col h-full w-full relative">
            {/* Background radial gradient specifically for this page */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-100/50 dark:from-indigo-900/10 via-transparent dark:via-black/0 to-transparent pointer-events-none" />

            {/* Main Action Feed */}
            <div className="flex-1 overflow-y-auto px-4 py-8 pb-64 scrollbar-hide relative z-10">
                <div className="max-w-4xl mx-auto space-y-8">
                    {isChatConversationLoading ? (
                        <div className="h-[60vh] flex items-center justify-center">
                            <div className="flex items-center gap-3 text-indigo-600 dark:text-indigo-400">
                                <div className="w-6 h-6 rounded-full border-2 border-indigo-300 dark:border-indigo-500/30 border-t-indigo-600 dark:border-t-indigo-500 animate-spin" />
                                <span className="text-sm font-mono tracking-wide animate-pulse">Loading Nexus Core...</span>
                            </div>
                        </div>
                    ) : (!chatConversation || chatConversation.length === 0) ? (
                        <div className="h-[60vh] flex items-center justify-center">
                            <EmptyState />
                        </div>
                    ) : (
                        [...chatConversation]
                            .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
                            .map((msg) => (
                                <div
                                    key={msg.id}
                                    className="group animate-in slide-in-from-bottom-4 fade-in duration-500"
                                >
                                    {msg.role === 'user' ? (
                                        <div className="flex items-center gap-3 mb-6 pl-2">
                                            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white dark:bg-white/[0.03] border border-gray-200 dark:border-white/[0.05] shadow-sm dark:shadow-none">
                                                <span className="text-emerald-600 dark:text-emerald-400 text-xs font-mono font-bold uppercase tracking-wider">{username || "User"}</span>
                                                <span className="text-gray-800 dark:text-gray-300 text-sm font-medium">{msg.message}</span>
                                            </div>
                                            <div className="text-[10px] text-gray-400 dark:text-gray-600 font-mono">
                                                {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="relative pl-6 mb-8 before:absolute before:inset-y-0 before:left-2 before:w-px before:bg-gradient-to-b before:from-indigo-300 dark:before:from-indigo-500/50 before:to-transparent">
                                            <div className="p-6 rounded-3xl border transition-all duration-500 overflow-hidden relative bg-white/80 dark:bg-[#0a0a0c]/80 backdrop-blur-md border-gray-200 dark:border-white/[0.06] shadow-xl dark:shadow-2xl hover:border-gray-300 dark:hover:border-white/[0.1] hover:shadow-indigo-500/10 dark:hover:shadow-indigo-500/5">
                                                <div className="text-[15px] leading-relaxed text-gray-700 dark:text-gray-200 tracking-wide [&>p]:mb-4 [&>h1]:text-2xl [&>h1]:font-bold [&>h2]:text-xl [&>h2]:font-bold [&>h3]:text-lg [&>h3]:font-bold [&>ul]:list-disc [&>ul]:pl-5 [&>ul]:mb-4 [&>ol]:list-decimal [&>ol]:pl-5 [&>ol]:mb-4 [&>li]:mb-1 [&_strong]:text-gray-900 [&_strong]:dark:text-white [&_code]:bg-gray-100 [&_code]:dark:bg-white/10 [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded-md [&>pre]:bg-gray-800 [&>pre]:text-gray-100 [&>pre]:p-4 [&>pre]:rounded-xl [&>pre]:overflow-x-auto [&>pre]:mb-4">
                                                    <TypewriterMarkdown 
                                                        content={msg.message} 
                                                        animate={new Date(msg.created_at).getTime() > sessionStartTime.current} 
                                                        onTyping={scrollToBottomInstant}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))
                    )}
                    {isChatPending && (
                        <div className="group animate-in slide-in-from-bottom-4 fade-in duration-500 mb-8">
                            <div className="relative pl-6 before:absolute before:inset-y-0 before:left-2 before:w-px before:bg-gradient-to-b before:from-indigo-300 dark:before:from-indigo-500/50 before:to-transparent">
                                <div className="p-6 rounded-3xl border transition-all duration-500 overflow-hidden relative bg-white/50 dark:bg-white/[0.01] border-indigo-200 dark:border-indigo-500/20 shadow-[0_0_30px_rgba(99,102,241,0.1)] dark:shadow-[0_0_30px_rgba(99,102,241,0.05)]">
                                    <div className="flex items-center gap-3 text-indigo-600 dark:text-indigo-400">
                                        <div className="w-4 h-4 rounded-full border-2 border-indigo-300 dark:border-indigo-500/30 border-t-indigo-600 dark:border-t-indigo-500 animate-spin" />
                                        <span className="text-sm font-mono tracking-wide animate-pulse">Processing execution cluster...</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} className="h-4" />
                </div>
            </div>

            {/* Floating Command Bar */}
            <div className="fixed bottom-4 md:bottom-10 left-1/2 -translate-x-1/2 w-full max-w-4xl px-2 sm:px-4 z-50">
                <div className="relative group">
                    {/* Outer glow */}
                    <div className="absolute -inset-1 bg-gradient-to-r from-indigo-300 dark:from-indigo-500 to-emerald-300 dark:to-emerald-500 rounded-[2rem] blur opacity-30 dark:opacity-20 group-hover:opacity-60 dark:group-hover:opacity-40 transition duration-1000 group-hover:duration-200" />

                    <div className="relative flex items-center bg-white/90 dark:bg-black/80 backdrop-blur-2xl border border-gray-200 dark:border-white/10 rounded-[2rem] shadow-2xl overflow-hidden transition-all duration-300 focus-within:bg-white dark:focus-within:bg-black/90 focus-within:border-indigo-300 dark:focus-within:border-white/20 focus-within:ring-2 dark:focus-within:ring-1 focus-within:ring-indigo-500/50">
                        <div className="pl-6 pr-3 flex items-center text-indigo-500 dark:text-indigo-400">
                            <Terminal size={18} />
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
                            className="w-full bg-transparent text-gray-900 dark:text-gray-100 py-5 text-[15px] placeholder:text-gray-400 dark:placeholder:text-gray-600 focus:outline-none tracking-wide"
                            spellCheck="false"
                            disabled={isChatPending}
                        />

                        <div className="pr-3 pl-2 py-2">
                            <button
                                onClick={handleSend}
                                disabled={!currentInput.trim() || isChatPending}
                                className="p-3 bg-indigo-600 dark:bg-white text-white dark:text-black rounded-full hover:bg-indigo-700 dark:hover:bg-indigo-50 dark:hover:text-indigo-600 transition-all duration-300 disabled:opacity-50 disabled:scale-95 disabled:cursor-not-allowed focus:outline-none flex items-center justify-center transform active:scale-90 shadow-md"
                            >
                                <code className="text-[10px] font-bold tracking-widest uppercase mr-1.5 opacity-80 dark:opacity-60">{isChatPending ? 'SENDING' : 'SEND'}</code>
                                {isChatPending ? (
                                    <div className="w-4 h-4 border-2 border-white/30 dark:border-black/30 border-t-white dark:border-t-black rounded-full animate-spin" />
                                ) : (
                                    <Sparkles size={16} className="opacity-100 dark:opacity-80" />
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ChatPage;
