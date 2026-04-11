import { useMutation, useQuery } from "@tanstack/react-query"
import { getChatConversation, streamChatConversation } from "../services/chat.service"

const chatMutations = {
  postChatResponse: (options = {}) => ({
    mutationKey: ["chat-response"],
    mutationFn: streamChatConversation,
    ...options
  }),
}

// sort asc for chronological UI display
const chatQueries = {
  getChatResponse: (userId: number, options = {}) => ({
    queryKey: ["get-user-conversations", userId],
    queryFn: () => getChatConversation(userId),
    select: (data: any[]) =>
      [...data].sort(
        (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      ),
    ...options
  }),
}

export const chatResponseMutation = () => {
  return useMutation(chatMutations.postChatResponse())
} 

export const getChatConversationQuery = (userId: number) => {
  return useQuery(chatQueries.getChatResponse(userId))
} 