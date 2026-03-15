import { fetchWithAuth } from "./fetchWithAuth";

export interface ChatSession {
  id: string;
  title: string;
  timestamp: string;
  messageCount: number;
}

export interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp?: string;
}

export interface ChatHistoryResponse {
  id: string;
  messages: Message[];
  createdAt: string;
  updatedAt: string;
}

export const getChatSessions = async (): Promise<ChatSession[]> => {
  try {
    const response = await fetchWithAuth("/interview/sessions");

    if (!response.ok) {
      throw new Error(`Failed to fetch sessions: ${response.status}`);
    }

    const data = await response.json();
    console.log("Sessions data:", data); // Debug log

    // Handle different response structures
    if (Array.isArray(data)) {
      return data;
    } else if (data.sessions && Array.isArray(data.sessions)) {
      return data.sessions;
    } else if (data.data && Array.isArray(data.data)) {
      return data.data;
    } else {
      console.warn("Unexpected sessions response format:", data);
      return [];
    }
  } catch (error) {
    console.error("Error fetching chat sessions:", error);
    return [];
  }
};

export const getInterviewHistory = async (chatId: string): Promise<{ messages: Message[] }> => {
  try {
    const response = await fetchWithAuth(`/interview/history/${chatId}`);

    if (!response.ok) {
      throw new Error(`Failed to fetch history: ${response.status}`);
    }

    const data = await response.json();
    console.log("History data:", data); // Debug log

    // Handle different response structures
    if (data.messages && Array.isArray(data.messages)) {
      return data;
    } else if (Array.isArray(data)) {
      return { messages: data };
    } else if (data.data && data.data.messages) {
      return data.data;
    } else {
      console.warn("Unexpected history response format:", data);
      return { messages: [] };
    }
  } catch (error) {
    console.error("Error fetching interview history:", error);
    throw error;
  }
};

export const createNewChat = async (): Promise<{ id: string }> => {
  try {
    const response = await fetchWithAuth("/interview/new", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({}), // Send empty body or initial message if needed
    });

    if (!response.ok) {
      throw new Error(`Failed to create new chat: ${response.status}`);
    }

    const data = await response.json();
    console.log("New chat data:", data); // Debug log

    // Handle different response structures
    if (data.id) {
      return data;
    } else if (data.chatId) {
      return { id: data.chatId };
    } else if (data.data && data.data.id) {
      return data.data;
    } else {
      throw new Error("Invalid response format from server");
    }
  } catch (error) {
    console.error("Error creating new chat:", error);
    throw error;
  }
};

export const deleteChatSession = async (chatId: string): Promise<void> => {
  try {
    const response = await fetchWithAuth(`/interview/sessions/${chatId}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      throw new Error(`Failed to delete session: ${response.status}`);
    }
  } catch (error) {
    console.error("Error deleting chat session:", error);
    throw error;
  }
};

export const renameChatSession = async (chatId: string, newTitle: string): Promise<void> => {
  try {
    const response = await fetchWithAuth(`/interview/sessions/${chatId}`, {
      method: "PATCH",
      body: JSON.stringify({ title: newTitle }),
    });

    if (!response.ok) {
      throw new Error(`Failed to rename session: ${response.status}`);
    }
  } catch (error) {
    console.error("Error renaming chat session:", error);
    throw error;
  }
};