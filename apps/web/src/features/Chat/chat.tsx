import { useState, useRef, useEffect, useCallback, lazy, Suspense } from "react";
import { useUserStore } from "../../store/user.store";
import { chatResponseMutation, getChatConversationQuery } from "../../react-queries/ChatQueries";
import { useQueryClient } from "@tanstack/react-query";
import ChatMessage from "../../components/chat/ChatMessage";
import CommandBar from "../../components/chat/CommandBar";

const EmptyState = lazy(() => (import('../../components/chat/EmptyState')))

// @ts-expect-error setting displayName on Lazy component
EmptyState.displayName = "EmptyState";

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

    const scrollToBottom = useCallback(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, []);

    const scrollToBottomInstant = useCallback(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "auto" });
    }, []);

    useEffect(() => {
        const timeout = setTimeout(scrollToBottom, 100);
        return () => clearTimeout(timeout);
    }, [chatConversation, scrollToBottom]);

    // Focus input on mount
    useEffect(() => {
        inputRef.current?.focus();
    }, []);

    const handleSend = useCallback(async (forcedInput?: string) => {
        const inputToUse = typeof forcedInput === "string" ? forcedInput : currentInput;
        if (!inputToUse.trim() || isChatPending) return;
        if (!id) return;

        const messageToSend = inputToUse.trim();
        setCurrentInput("");

        // Optimistically add user message to cache
        queryClient.setQueryData(["get-user-conversations", id], (oldData: any[]) => {
            const newUserMessage = {
                id: Date.now(),
                message: messageToSend,
                role: "user",
                content_type: "text",
                created_at: new Date().toISOString()
            };
            return oldData ? [...oldData, newUserMessage] : [newUserMessage];
        });

        try {
            await inputChatResponse({ userId: id, message: messageToSend });
        } catch (error) {
            console.error("Failed to send message", error);
        } finally {
            // Once resolved, refetch the conversation to get the actual assistant reply
            queryClient.invalidateQueries({ queryKey: ["get-user-conversations", id] });
        }
    }, [currentInput, isChatPending, id, queryClient, inputChatResponse]);

    return (
        <div className="flex flex-col h-full w-full relative overflow-hidden">
            {/* Background radial gradient specifically for this page */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-100/50 dark:from-indigo-900/10 via-transparent dark:via-black/0 to-transparent pointer-events-none transform-gpu" style={{ willChange: 'transform' }} />

            {/* Main Action Feed */}
            <div className="flex-1 overflow-y-auto px-4 py-8 scrollbar-hide relative z-10 chat-scroll-container transform-gpu" style={{ willChange: 'transform' }}>
                <div className="max-w-4xl mx-auto space-y-8">
                    {isChatConversationLoading ? (
                        <div className="h-[60vh] flex items-center justify-center">
                            <div className="flex items-center gap-3 text-indigo-600 dark:text-indigo-400">
                                <div className="w-6 h-6 rounded-full border-2 border-indigo-300 dark:border-indigo-500/30 border-t-indigo-600 dark:border-t-indigo-500 animate-spin" />
                                <span className="text-sm font-mono tracking-wide animate-pulse">Loading SmartFolio Core...</span>
                            </div>
                        </div>
                    ) : (!chatConversation || chatConversation.length === 0) ? (
                        <div className="h-[60vh] flex items-center justify-center">
                            <Suspense fallback={
                                <div className="flex items-center gap-3 text-indigo-600 dark:text-indigo-400">
                                    <div className="w-5 h-5 rounded-full border-2 border-indigo-300 dark:border-indigo-500/30 border-t-indigo-600 dark:border-t-indigo-500 animate-spin" />
                                    <span className="text-sm font-mono tracking-wide animate-pulse">Initializing UI...</span>
                                </div>
                            }>
                                <EmptyState />
                            </Suspense>
                        </div>
                    ) : (
                        (chatConversation || []).map((msg: any, index: number) => (
                            <ChatMessage
                                key={msg.id}
                                msg={msg}
                                username={username || "User"}
                                sessionStartTime={sessionStartTime.current}
                                scrollToBottomInstant={scrollToBottomInstant}
                                isLatest={index === (chatConversation || []).length - 1}
                            />
                        ))
                    )}
                    {isChatPending && (
                        <div className="group animate-in slide-in-from-bottom-4 fade-in duration-500 mb-8">
                            <div className="relative pl-6 before:absolute before:inset-y-0 before:left-2 before:w-px before:bg-gradient-to-b before:from-indigo-300 dark:before:from-indigo-500/50 before:to-transparent">
                                <div className="p-6 rounded-3xl border overflow-hidden relative bg-white/50 dark:bg-white/[0.01] border-indigo-200 dark:border-indigo-500/20 shadow-[0_0_30px_rgba(99,102,241,0.1)] dark:shadow-[0_0_30px_rgba(99,102,241,0.05)]">
                                    <div className="flex items-center gap-3 text-indigo-600 dark:text-indigo-400">
                                        <div className="w-4 h-4 rounded-full border-2 border-indigo-300 dark:border-indigo-500/30 border-t-indigo-600 dark:border-t-indigo-500 animate-spin" />
                                        <span className="text-sm font-mono tracking-wide animate-pulse">Generating smart insights…</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} className="h-4" />
                </div>
            </div>
            {/* Floating Command Bar */}
            <CommandBar
                currentInput={currentInput}
                setCurrentInput={setCurrentInput}
                handleSend={handleSend}
                isChatPending={isChatPending}
            />
        </div>
    );
};

export default ChatPage;
