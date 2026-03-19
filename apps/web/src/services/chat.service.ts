export const streamChatConversation = async (
    params: {userId: number, message: string},
): Promise<void> => {
    const {userId , message } = params;
    const baseUrl = (import.meta.env.VITE_BASE_API_URL || "http://localhost:8000").replace(/\/$/, "");
    const authApiKey = import.meta.env.VITE_AUTH_API_KEY;

    const fetchHeaders: Record<string, string> = {
        "Content-Type": "application/json",
    };

    if (authApiKey) {
        fetchHeaders["Authorization"] = `Bearer ${authApiKey}`;
    }

    const response = await fetch(`${baseUrl}/chat/conversation`, {
        method: "POST",
        headers: fetchHeaders,
        body: JSON.stringify({
            user_id: userId,
            message: message,
        }),
    });

    if (!response.ok) {
        throw new Error("Network response was not ok");
    }

    return response.json();
};