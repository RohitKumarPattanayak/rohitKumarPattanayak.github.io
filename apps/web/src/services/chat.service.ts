import { api } from "./api";

export const streamChatConversation = async (
    params: { userId: number; message: string },
): Promise<unknown> => {
    const { userId, message } = params;
    const response = await api.post("/chat/conversation", {
        user_id: userId,
        message,
    });
    return response.data;
};
export interface ChatMessage {
    id: number;
    message: any;
    role: string;
    mode: string;
    content_type: string;
    user_id: number;
    resume_id: number;
    created_at: string;
    updated_at: string | null;
}

export const cleanupChatConversation = async (userId: number): Promise<void> => {
    // Fire and forget
    api.delete(`/chat/cleanup/${userId}`).catch(console.error);
};

export const getChatConversation = async (
    userId: number,
): Promise<ChatMessage[]> => {
    // Don't await the cleanup activity
    cleanupChatConversation(userId);
    const response = await api.get(`/chat/get-conversation/${userId}`);
    return response.data;
};