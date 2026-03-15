import { useState } from "react";
import MessageBubble from "./MessageBubble";
import ChatInput from "../chats/ChatInput";
import type { Message } from "../../types";
import { fetchWithAuth } from "../../api/fetchWithAuth";
import { useEffect } from "react";
import { getInterviewHistory, getChatSessions, createNewChat, deleteChatSession, renameChatSession } from "../../api/history";

interface ChatSession {
    _id: string;
    id: string;
    title: string;
    timestamp: string;
    messageCount: number;
}

export default function ChatContainer() {
    const [messages, setMessages] = useState<Message[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
    const [currentChatId, setCurrentChatId] = useState<string | null>(null);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isLoadingHistory, setIsLoadingHistory] = useState(false);
    const [editingChatId, setEditingChatId] = useState<string | null>(null);
    const [editingTitle, setEditingTitle] = useState("");
    const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

    // Load chat sessions on mount
    useEffect(() => {
        loadChatSessions();
    }, []);

    const loadChatSessions = async () => {
        try {
            const sessions = await getChatSessions();
            const formatted = sessions.map((s: any) => ({
                id: s._id,
                _id: s._id,
                title: s.title || "New Conversation",
                timestamp: s.createdAt,
                messageCount: s.messages?.length || 0
            }));
            setChatSessions(formatted);
        } catch (error) {
            console.error("Failed to load chat sessions:", error);
        }
    };

    const loadChatHistory = async (chatId: string) => {
        setIsLoadingHistory(true);
        try {
            const data = await getInterviewHistory(chatId);
            const formatted = data.messages.map((msg: any, index: number) => ({
                id: index.toString(),
                role: msg.role === "assistant" ? "ai" : "user",
                content: msg.content,
            }));
            setMessages(formatted);
            setCurrentChatId(chatId);
        } catch (error) {
            console.error("Failed to load chat history:", error);
        } finally {
            setIsLoadingHistory(false);
        }
    };

    const handleNewChat = async () => {
        try {
            const newChat = await createNewChat();
            setMessages([]);
            setCurrentChatId(newChat._id);
            await loadChatSessions();
            setIsSidebarOpen(false);
        } catch (error) {
            console.error("Failed to create new chat:", error);
        }
    };

    const handleDeleteChat = async (chatId: string, e: React.MouseEvent) => {
        e.stopPropagation();
        setShowDeleteConfirm(chatId);
    };

    const confirmDeleteChat = async (chatId: string) => {
        try {
            await deleteChatSession(chatId);
            
            // If deleted chat is the current one, clear messages
            if (currentChatId === chatId) {
                setMessages([]);
                setCurrentChatId(null);
            }
            
            // Refresh sessions list
            await loadChatSessions();
            setShowDeleteConfirm(null);
        } catch (error) {
            console.error("Failed to delete chat:", error);
        }
    };

    const handleRenameClick = (chat: ChatSession, e: React.MouseEvent) => {
        e.stopPropagation();
        setEditingChatId(chat.id);
        setEditingTitle(chat.title);
    };

    const handleRenameSubmit = async (chatId: string) => {
        if (editingTitle.trim()) {
            try {
                await renameChatSession(chatId, editingTitle.trim());
                await loadChatSessions();
                
                // Update current chat title in header if it's the active chat
                if (currentChatId === chatId) {
                    // You might want to update some local state here if needed
                }
            } catch (error) {
                console.error("Failed to rename chat:", error);
            }
        }
        setEditingChatId(null);
        setEditingTitle("");
    };

    const handleKeyDown = (e: React.KeyboardEvent, chatId: string) => {
        if (e.key === "Enter") {
            e.preventDefault();
            handleRenameSubmit(chatId);
        } else if (e.key === "Escape") {
            setEditingChatId(null);
            setEditingTitle("");
        }
    };

    const sendMessage = async (text: string) => {
        const userMessage: Message = {
            id: Date.now().toString(),
            role: "user",
            content: text
        };

        setMessages(prev => [...prev, userMessage]);
        setIsLoading(true);

        try {
            const res = await fetchWithAuth("/interview/ask", {
                method: "POST",
                body: JSON.stringify({
                    message: text,
                    chatId: currentChatId,
                }),
            });
            const data = await res.json();

            setMessages(prev => [
                ...prev,
                {
                    id: Math.random().toString(),
                    role: "ai",
                    content: data.reply
                }
            ]);

            // If this is a new chat and we have the first user message, update sessions
            if (!currentChatId || messages.length === 0) {
                await loadChatSessions();
            }
        } catch (error) {
            console.error("Failed to send message:", error);
        } finally {
            setIsLoading(false);
        }
    };

    // Get chat title from first user message or use default
    const getChatTitle = () => {
        const firstUserMessage = messages.find(m => m.role === "user");
        if (firstUserMessage) {
            return firstUserMessage.content.length > 30
                ? firstUserMessage.content.substring(0, 30) + "..."
                : firstUserMessage.content;
        }
        return "New Conversation";
    };

    return (
        <div className="flex h-screen bg-gray-900">
            {/* Main Chat Area */}
            <div className="flex-1 flex flex-col">
                {/* Header */}
                <div className="border-b border-gray-800 p-4">
                    <div className="max-w-4xl mx-auto flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse"></div>
                        <h1 className="text-yellow-400 font-semibold">MockMate AI</h1>

                        {/* Current Chat Title */}
                        {messages.length > 0 && (
                            <>
                                <span className="text-gray-600">•</span>
                                <span className="text-sm text-gray-400 truncate max-w-xs">
                                    {getChatTitle()}
                                </span>
                            </>
                        )}

                        <span className="text-xs text-gray-500 ml-auto">Interview Mode</span>

                        {/* Menu Button for Mobile */}
                        <button
                            onClick={() => setIsSidebarOpen(true)}
                            className="lg:hidden text-gray-400 hover:text-yellow-400 ml-2"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Messages Container */}
                <div className="flex-1 overflow-y-auto p-4 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-gray-900">
                    <div className="max-w-4xl mx-auto space-y-4">
                        {isLoadingHistory ? (
                            <div className="flex justify-center py-8">
                                <div className="w-8 h-8 border-2 border-yellow-400/30 border-t-yellow-400 rounded-full animate-spin"></div>
                            </div>
                        ) : messages.length === 0 ? (
                            <div className="text-center py-12">
                                <div className="text-gray-600 mb-2">
                                    <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                    </svg>
                                </div>
                                <p className="text-gray-500 text-sm">Start a new conversation</p>
                                <button
                                    onClick={handleNewChat}
                                    className="mt-4 text-yellow-400 hover:text-yellow-300 text-sm font-medium"
                                >
                                    New Chat →
                                </button>
                            </div>
                        ) : (
                            messages.map(msg => (
                                <MessageBubble
                                    key={msg.id}
                                    role={msg.role}
                                    content={msg.content}
                                />
                            ))
                        )}

                        {/* Typing indicator */}
                        {isLoading && (
                            <div className="flex items-center gap-2 text-gray-400 text-sm">
                                <div className="w-2 h-2 bg-yellow-400/50 rounded-full animate-bounce"></div>
                                <div className="w-2 h-2 bg-yellow-400/50 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                                <div className="w-2 h-2 bg-yellow-400/50 rounded-full animate-bounce [animation-delay:0.4s]"></div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Input Area */}
                <div className="border-t border-gray-800 bg-gray-900 p-4">
                    <div className="max-w-4xl mx-auto">
                        <ChatInput onSend={sendMessage} disabled={isLoading || isLoadingHistory} />

                        {/* Footer note */}
                        <p className="text-xs text-gray-600 mt-2 text-center">
                            Press <span className="text-yellow-400">Enter</span> to send,
                            <span className="text-yellow-400 ml-1">Shift + Enter</span> for new line
                        </p>
                    </div>
                </div>
            </div>

            {/* Sidebar Overlay for Mobile */}
            {isSidebarOpen && (
                <div 
                    className="fixed inset-0 bg-black/50 z-20 lg:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* Chat History Sidebar - Now on the RIGHT */}
            <div className={`
                fixed lg:static inset-y-0 right-0 z-30
                transform ${isSidebarOpen ? 'translate-x-0' : 'translate-x-full'} 
                lg:translate-x-0 transition-transform duration-300 ease-in-out
                w-80 bg-gray-800 border-l border-gray-700 flex flex-col
            `}>
                {/* Sidebar Header */}
                <div className="p-4 border-b border-gray-700">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-yellow-400 font-semibold">Chat History</h2>
                        <button
                            onClick={() => setIsSidebarOpen(false)}
                            className="lg:hidden text-gray-400 hover:text-yellow-400"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                    
                    {/* New Chat Button */}
                    <button
                        onClick={handleNewChat}
                        className="w-full bg-yellow-400/10 border border-yellow-400/30 
                                 text-yellow-400 rounded-lg px-4 py-2 text-sm font-medium
                                 hover:bg-yellow-400/20 transition-all duration-300
                                 flex items-center justify-center gap-2"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        New Chat
                    </button>
                </div>

                {/* Sessions List */}
                <div className="flex-1 overflow-y-auto p-4 space-y-2">
                    {chatSessions.length === 0 ? (
                        <div className="text-center text-gray-500 text-sm py-8">
                            No chat history yet
                        </div>
                    ) : (
                        chatSessions.map((session) => (
                            <div
                                key={session.id}
                                className={`
                                    w-full rounded-lg transition-all duration-300
                                    ${currentChatId === session.id 
                                        ? 'bg-yellow-400/10 border border-yellow-400/30' 
                                        : 'bg-gray-900/50 border border-gray-700'
                                    }
                                `}
                            >
                                {editingChatId === session.id ? (
                                    <div className="p-3">
                                        <input
                                            type="text"
                                            value={editingTitle}
                                            onChange={(e) => setEditingTitle(e.target.value)}
                                            onBlur={() => handleRenameSubmit(session.id)}
                                            onKeyDown={(e) => handleKeyDown(e, session.id)}
                                            className="w-full bg-gray-900 border border-yellow-400/30 rounded px-2 py-1 text-sm text-white focus:outline-none focus:border-yellow-400"
                                            autoFocus
                                            onClick={(e) => e.stopPropagation()}
                                        />
                                    </div>
                                ) : (
                                    <div 
                                        onClick={() => {
                                            loadChatHistory(session.id);
                                            setIsSidebarOpen(false);
                                        }}
                                        className="p-3 cursor-pointer group relative"
                                    >
                                        <div className="flex items-start gap-3">
                                            {/* Chat Icon */}
                                            <div className="shrink-0 mt-1">
                                                <div className={`w-2 h-2 rounded-full ${currentChatId === session.id ? 'bg-yellow-400' : 'bg-gray-600'}`}></div>
                                            </div>

                                            {/* Chat Info */}
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm text-white truncate pr-16">
                                                    {session.title}
                                                </p>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <span className="text-xs text-gray-500">
                                                        {new Date(session.timestamp).toLocaleDateString()}
                                                    </span>
                                                    
                                                </div>
                                            </div>

                                            {/* Action Buttons - Now on the right side */}
                                            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                {/* Rename Button */}
                                                <button
                                                    onClick={(e) => handleRenameClick(session, e)}
                                                    className="p-1 text-gray-400 hover:text-yellow-400 transition-colors"
                                                    title="Rename chat"
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                                    </svg>
                                                </button>

                                                {/* Delete Button */}
                                                {showDeleteConfirm === session.id ? (
                                                    <div className="flex items-center gap-1 bg-gray-800 rounded-lg p-1">
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                confirmDeleteChat(session.id);
                                                            }}
                                                            className="p-1 text-green-400 hover:text-green-300 transition-colors text-xs font-medium"
                                                        >
                                                            Yes
                                                        </button>
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setShowDeleteConfirm(null);
                                                            }}
                                                            className="p-1 text-red-400 hover:text-red-300 transition-colors text-xs font-medium"
                                                        >
                                                            No
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <button
                                                        onClick={(e) => handleDeleteChat(session.id, e)}
                                                        className="p-1 text-gray-400 hover:text-red-400 transition-colors"
                                                        title="Delete chat"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                        </svg>
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))
                    )}
                </div>

                {/* Sidebar Footer */}
                <div className="p-4 border-t border-gray-700">
                    <div className="flex items-center gap-2 text-gray-500 text-xs">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>Total: {chatSessions.length} conversations</span>
                    </div>
                </div>
            </div>
        </div>
    );
}