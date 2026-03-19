import { useMutation } from "@tanstack/react-query"
import { streamChatConversation } from "../services/chat.service"

const chatMutations = {
  getChatResponse: (options = {}) => ({
    mutationKey: ["chat-response"],
    mutationFn: streamChatConversation,
    ...options
  }),
}


export const chatResponse = () => {
  return useMutation(chatMutations.getChatResponse())
} 