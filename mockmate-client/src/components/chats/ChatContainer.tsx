import React, { useState, useRef, useEffect } from "react";
import { fetchWithAuth } from "../../api/fetchWithAuth";
import MessageBubble from "./MessageBubble";
import ChatInput from "../chats/ChatInput";

// Types
type Message = {
    role: "user" | "assistant";
    content: string;
    id: string;
    timestamp: Date;
};

type ChatSession = {
    _id: string;
    id: string;
    title: string;
    timestamp: string;
    messageCount: number;
    mode: "chat" | "voice";
};

type InputMode = "chat" | "voice";

export default function UnifiedInterviewComponent() {
    const [messages, setMessages] = useState<Message[]>([]);
    const [chatId, setChatId] = useState<string | null>(null);
    const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
    const [inputMode, setInputMode] = useState<InputMode>("chat");
    const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
    const [isLoadingHistory, setIsLoadingHistory] = useState<boolean>(false);
    const [editingChatId, setEditingChatId] = useState<string | null>(null);
    const [editingTitle, setEditingTitle] = useState<string>("");
    const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

    // Track initialization
    const [isLoadingSessions, setIsLoadingSessions] = useState<boolean>(true);
    const hasInitialized = useRef<boolean>(false);

    // Voice-specific states
    const [listening, setListening] = useState<boolean>(false);
    const [isProcessing, setIsProcessing] = useState<boolean>(false);
    const [isSpeaking, setIsSpeaking] = useState<boolean>(false);

    const recognitionRef = useRef<SpeechRecognition | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Load chat sessions on mount only once
    useEffect(() => {
        loadChatSessions();
    }, []);

    // Handle initial load - runs only once after sessions are loaded
    useEffect(() => {
        if (isLoadingSessions) return;
        if (hasInitialized.current) return;

        const initializeChat = async () => {
            try {
                if (chatSessions.length === 0) {
                    // No chats exist, create one
                    await createNewChat(inputMode, true);
                } else {
                    // Chats exist, load the most recent one
                    const mostRecent = chatSessions[0];
                    await loadChatHistory(mostRecent.id);
                }
                hasInitialized.current = true;
            } catch (error) {
                console.error("Failed to initialize chat:", error);
            }
        };

        initializeChat();
    }, [isLoadingSessions]);

    const loadChatSessions = async () => {
        setIsLoadingSessions(true);
        try {
            const response = await fetchWithAuth("/interview/sessions");
            const data = await response.json();
            const sessions = data.sessions || data || [];

            const formatted = sessions.map((s: any) => ({
                id: s._id,
                _id: s._id,
                title: s.title || "New Conversation",
                timestamp: s.createdAt || s.updatedAt || new Date().toISOString(),
                messageCount: s.messages?.length || 0,
                mode: s.mode || "chat"
            }));

            setChatSessions(formatted);
        } catch (error) {
            console.error("Failed to load chat sessions:", error);
        } finally {
            setIsLoadingSessions(false);
        }
    };

    const createNewChat = async (mode: InputMode = "chat", isInitial = false) => {
        try {
            const res = await fetchWithAuth("/interview/new", {
                method: "POST",
                body: JSON.stringify({ mode }),
            });
            const data = await res.json();
            setChatId(data._id);
            setMessages([]);

            // Update sessions list
            const newSession: ChatSession = {
                id: data._id,
                _id: data._id,
                title: mode === "voice" ? "New Voice Interview" : "New Chat Interview",
                timestamp: new Date().toISOString(),
                messageCount: 0,
                mode: mode
            };

            if (isInitial) {
                setChatSessions([newSession]);
            } else {
                setChatSessions(prev => [newSession, ...prev]);
                await loadChatSessions(); // Refresh sessions from server for non-initial
            }

            return data._id;
        } catch (error) {
            console.error("Failed to create new chat:", error);
            return null;
        }
    };

    const loadChatHistory = async (sessionId: string) => {
        // Prevent loading if already loading
        if (isLoadingHistory) return;

        setIsLoadingHistory(true);
        try {
            const response = await fetchWithAuth(`/interview/history/${sessionId}`);
            const data = await response.json();

            const formattedMessages = data.messages.map((msg: any, index: number) => ({
                id: index.toString(),
                role: msg.role === "assistant" ? "assistant" : "user",
                content: msg.content,
                timestamp: new Date(msg.timestamp || Date.now()),
            }));
            setMessages(formattedMessages);
            setChatId(sessionId);

            // Set input mode based on session mode
            const session = chatSessions.find(s => s.id === sessionId);
            if (session?.mode) {
                setInputMode(session.mode);
            }
        } catch (error) {
            console.error("Failed to load chat history:", error);
        } finally {
            setIsLoadingHistory(false);
        }
    };

    const handleNewChat = async () => {
        await createNewChat(inputMode, false);
        setIsSidebarOpen(false);
    };

    const switchMode = async (mode: InputMode) => {
        if (messages.length > 0) {
            if (confirm(`Switching to ${mode} mode will start a new conversation. Continue?`)) {
                setInputMode(mode);
                await createNewChat(mode, false);
            }
        } else {
            setInputMode(mode);
            await createNewChat(mode, false);
        }
    };

    const handleDeleteChat = async (sessionId: string, e: React.MouseEvent) => {
        e.stopPropagation();
        setShowDeleteConfirm(sessionId);
    };

    const confirmDeleteChat = async (sessionId: string) => {
        try {
            await fetchWithAuth(`/interview/sessions/${sessionId}`, {
                method: "DELETE",
            });

            const updatedSessions = chatSessions.filter(s => s.id !== sessionId);
            setChatSessions(updatedSessions);

            if (chatId === sessionId) {
                setMessages([]);
                setChatId(null);
                // Load the next available session or create new one
                if (updatedSessions.length > 0) {
                    await loadChatHistory(updatedSessions[0].id);
                } else {
                    await createNewChat(inputMode, false);
                }
            }

            setShowDeleteConfirm(null);
        } catch (error) {
            console.error("Failed to delete chat:", error);
        }
    };

    const handleRenameClick = (session: ChatSession, e: React.MouseEvent) => {
        e.stopPropagation();
        setEditingChatId(session.id);
        setEditingTitle(session.title);
    };

    const handleRenameSubmit = async (sessionId: string) => {
        if (editingTitle.trim()) {
            try {
                await fetchWithAuth(`/interview/sessions/${sessionId}`, {
                    method: "PATCH",
                    body: JSON.stringify({ title: editingTitle.trim() }),
                });
                // Update local state
                setChatSessions(prev => prev.map(s =>
                    s.id === sessionId ? { ...s, title: editingTitle.trim() } : s
                ));
            } catch (error) {
                console.error("Failed to rename chat:", error);
            }
        }
        setEditingChatId(null);
        setEditingTitle("");
    };

    const handleKeyDown = (e: React.KeyboardEvent, sessionId: string) => {
        if (e.key === "Enter") {
            e.preventDefault();
            handleRenameSubmit(sessionId);
        } else if (e.key === "Escape") {
            setEditingChatId(null);
            setEditingTitle("");
        }
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const addMessage = (role: Message["role"], content: string) => {
        const newMessage: Message = {
            role,
            content,
            id: Date.now().toString(),
            timestamp: new Date(),
        };
        setMessages((prev) => [...prev, newMessage]);
        return newMessage;
    };

    // Text-to-Speech for voice mode
    const speak = (text: string) => {
        return new Promise<void>((resolve) => {
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.rate = 1;
            utterance.pitch = 1;
            utterance.volume = 1;

            utterance.onstart = () => {
                setIsSpeaking(true);
            };

            utterance.onend = () => {
                setIsSpeaking(false);
                resolve();
            };

            utterance.onerror = () => {
                setIsSpeaking(false);
                resolve();
            };

            window.speechSynthesis.cancel();
            window.speechSynthesis.speak(utterance);
        });
    };

    // Send message to AI
    const sendMessage = async (text: string) => {
        let currentChatId = chatId;

        if (!currentChatId) {
            const newChatId = await createNewChat(inputMode, false);
            if (!newChatId) {
                console.error("Failed to create chat");
                return;
            }
            currentChatId = newChatId;
        }

        try {
            setIsProcessing(true);
            addMessage("user", text);

            const res = await fetchWithAuth("/interview/ask", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    message: text,
                    chatId: currentChatId,
                    mode: inputMode,
                }),
            });

            if (!res.ok) {
                throw new Error(`Server error: ${res.status}`);
            }

            const data: { reply: string } = await res.json();
            const reply = data.reply;

            addMessage("assistant", reply);

            // If in voice mode, speak the response
            if (inputMode === "voice") {
                await speak(reply);
            }

            // Update message count in sidebar
            setChatSessions(prev => prev.map(s =>
                s.id === currentChatId ? { ...s, messageCount: s.messageCount + 2 } : s
            ));
        } catch (err) {
            console.error(err);
            addMessage("assistant", "Sorry, I encountered an error. Please try again.");
        } finally {
            setIsProcessing(false);
        }
    };

    // Voice recognition
    const startListening = () => {
        const SpeechRecognitionConstructor =
            window.SpeechRecognition || window.webkitSpeechRecognition;

        if (!SpeechRecognitionConstructor) {
            alert("Speech Recognition is not supported in this browser. Please use Chrome, Edge, or Safari.");
            return;
        }

        const recognition = new SpeechRecognitionConstructor();
        recognition.lang = "en-US";
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.maxAlternatives = 1;

        recognition.onstart = () => {
            setListening(true);
        };

        recognition.onresult = (event: SpeechRecognitionEvent) => {
            const transcript = event.results[0][0].transcript;
            sendMessage(transcript);
        };

        recognition.onend = () => {
            setListening(false);
        };

        recognition.onerror = (e: SpeechRecognitionErrorEvent) => {
            console.error("Speech error:", e);
            setListening(false);

            if (e.error === "not-allowed") {
                alert("Please allow microphone access to use voice features.");
            }
        };

        recognition.start();
        recognitionRef.current = recognition;
    };

    const stopListening = () => {
        recognitionRef.current?.stop();
        setListening(false);
    };

    const clearChat = () => {
        if (confirm("Are you sure you want to clear the conversation?")) {
            setMessages([]);
            window.speechSynthesis.cancel();
        }
    };

    const formatTime = (date: Date) => {
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    const getChatTitle = () => {
        const firstUserMessage = messages.find(m => m.role === "user");
        if (firstUserMessage) {
            return firstUserMessage.content.length > 30
                ? firstUserMessage.content.substring(0, 30) + "..."
                : firstUserMessage.content;
        }
        return inputMode === "voice" ? "New Voice Interview" : "New Chat Interview";
    };

    // Show loading state while initializing
    if (isLoadingSessions && !hasInitialized.current) {
        return (
            <div className="flex h-screen bg-gray-900 items-center justify-center">
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-yellow-400/30 border-t-yellow-400 rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-400">Loading your interviews...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex h-screen bg-gray-900">
            {/* Main Chat Area */}
            <div className="flex-1 flex flex-col">
                {/* Header */}
                <div className="border-b border-gray-800 p-4">
                    <div className="max-w-4xl mx-auto flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse"></div>
                        <h1 className="text-yellow-400 font-semibold">MockMate Interview</h1>

                        {/* Mode Toggle */}
                        <div className="flex items-center gap-1 ml-4 bg-gray-800 rounded-lg p-1">
                            <button
                                onClick={() => switchMode("chat")}
                                className={`px-3 py-1 text-sm rounded-md transition-all duration-300 flex items-center gap-2
                  ${inputMode === "chat"
                                        ? 'bg-yellow-400 text-gray-900'
                                        : 'text-gray-400 hover:text-yellow-400'
                                    }`}
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                </svg>
                                Chat
                            </button>
                            <button
                                onClick={() => switchMode("voice")}
                                className={`px-3 py-1 text-sm rounded-md transition-all duration-300 flex items-center gap-2
                  ${inputMode === "voice"
                                        ? 'bg-yellow-400 text-gray-900'
                                        : 'text-gray-400 hover:text-yellow-400'
                                    }`}
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                                </svg>
                                Voice
                            </button>
                        </div>

                        {/* Status Indicators */}
                        <div className="flex items-center gap-2 ml-4">
                            {inputMode === "voice" && listening && (
                                <div className="flex items-center gap-1">
                                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                                    <span className="text-xs text-green-400">Listening</span>
                                </div>
                            )}
                            {inputMode === "voice" && isSpeaking && (
                                <div className="flex items-center gap-1">
                                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                                    <span className="text-xs text-blue-400">Speaking</span>
                                </div>
                            )}
                            {isProcessing && (
                                <div className="flex items-center gap-1">
                                    <div className="w-2 h-2 bg-yellow-400 rounded-full animate-spin"></div>
                                    <span className="text-xs text-yellow-400">Processing</span>
                                </div>
                            )}
                        </div>

                        {/* Current Chat Title */}
                        {messages.length > 0 && (
                            <>
                                <span className="text-gray-600">•</span>
                                <span className="text-sm text-gray-400 truncate max-w-xs">
                                    {getChatTitle()}
                                </span>
                            </>
                        )}

                        <span className="text-xs text-gray-500 ml-auto">
                            {messages.length} messages
                        </span>

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
                                    {inputMode === "voice" ? (
                                        <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                                        </svg>
                                    ) : (
                                        <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                        </svg>
                                    )}
                                </div>
                                <p className="text-gray-500 text-sm mb-2">
                                    {inputMode === "voice"
                                        ? "Ready for your voice interview"
                                        : "Ready for your chat interview"}
                                </p>
                                <p className="text-gray-600 text-xs">
                                    {inputMode === "voice"
                                        ? "Click the microphone button to start speaking"
                                        : "Type your message below to begin"}
                                </p>
                            </div>
                        ) : (
                            messages.map((msg) => (
                                <MessageBubble
                                    key={msg.id}
                                    role={msg.role}
                                    content={msg.content}
                                    timestamp={formatTime(msg.timestamp)}
                                />
                            ))
                        )}

                        {/* Typing/Speaking indicator */}
                        {(isProcessing || (inputMode === "voice" && isSpeaking)) && !listening && (
                            <div className="flex justify-start">
                                <div className="flex items-center gap-2 bg-gray-800/50 rounded-2xl px-4 py-2.5 border border-gray-700/50">
                                    <div className="flex gap-1">
                                        <div className="w-2 h-2 bg-yellow-400/50 rounded-full animate-bounce"></div>
                                        <div className="w-2 h-2 bg-yellow-400/50 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                                        <div className="w-2 h-2 bg-yellow-400/50 rounded-full animate-bounce [animation-delay:0.4s]"></div>
                                    </div>
                                    <span className="text-xs text-gray-400">
                                        {isProcessing ? "Your Mate thinking..." : "Speaking..."}
                                    </span>
                                </div>
                            </div>
                        )}

                        <div ref={messagesEndRef} />
                    </div>
                </div>

                {/* Input Area */}
                <div className="border-t border-gray-800 bg-gray-900 p-4">
                    <div className="max-w-4xl mx-auto">
                        {inputMode === "chat" ? (
                            <>
                                <ChatInput onSend={sendMessage} disabled={isProcessing} />
                                <p className="text-xs text-gray-600 mt-2 text-center">
                                    Press <span className="text-yellow-400">Enter</span> to send,
                                    <span className="text-yellow-400 ml-1">Shift + Enter</span> for new line
                                </p>
                            </>
                        ) : (
                            <>
                                <div className="flex items-center justify-between gap-4">
                                    <div className="flex items-center gap-3 flex-1">
                                        {!listening ? (
                                            <button
                                                onClick={startListening}
                                                disabled={isProcessing || isSpeaking}
                                                className={`
                          group relative w-14 h-14 rounded-full flex items-center justify-center
                          transition-all duration-300
                          ${(isProcessing || isSpeaking)
                                                        ? 'bg-gray-800 text-gray-600 cursor-not-allowed border border-gray-700'
                                                        : 'bg-yellow-400 text-gray-900 hover:bg-yellow-300 hover:scale-105'
                                                    }
                        `}
                                            >
                                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                                                </svg>
                                                <span className="absolute inset-0 rounded-full animate-ping bg-yellow-400/30"></span>
                                            </button>
                                        ) : (
                                            <button
                                                onClick={stopListening}
                                                className="group relative w-14 h-14 rounded-full flex items-center justify-center
                                 bg-red-500 text-white hover:bg-red-600 transition-all duration-300 hover:scale-105"
                                            >
                                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 10h6v4H9z" />
                                                </svg>
                                                <span className="absolute inset-0 rounded-full animate-pulse bg-red-500/50"></span>
                                            </button>
                                        )}

                                        <div className="text-sm">
                                            {listening ? (
                                                <span className="text-green-400 font-medium">Listening...</span>
                                            ) : isProcessing ? (
                                                <span className="text-yellow-400">Processing...</span>
                                            ) : isSpeaking ? (
                                                <span className="text-blue-400">Speaking...</span>
                                            ) : (
                                                <span className="text-gray-500">Click the microphone to speak</span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Clear Chat Button */}
                                    {messages.length > 0 && (
                                        <button
                                            onClick={clearChat}
                                            className="px-4 py-2 text-sm text-gray-400 hover:text-red-400 
                               transition-colors duration-300 flex items-center gap-2
                               bg-gray-800/50 rounded-lg border border-gray-700
                               hover:border-red-400/30"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                            </svg>
                                            Clear Chat
                                        </button>
                                    )}
                                </div>
                                <p className="text-xs text-gray-600 mt-4 text-center">
                                    🎤 Speak clearly into your microphone • {!listening && !isProcessing && !isSpeaking && "Click the microphone to start"}
                                </p>
                            </>
                        )}
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

            {/* Chat History Sidebar */}
            <div className={`
        fixed lg:static inset-y-0 right-0 z-30
        transform ${isSidebarOpen ? 'translate-x-0' : 'translate-x-full'} 
        lg:translate-x-0 transition-transform duration-300 ease-in-out
        w-80 bg-gray-800 border-l border-gray-700 flex flex-col
      `}>
                {/* Sidebar Header */}
                <div className="p-4 border-b border-gray-700">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-yellow-400 font-semibold">Interview History</h2>
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
                        New {inputMode === "voice" ? "Voice" : "Chat"} Interview
                    </button>
                </div>

                {/* Sessions List */}
                <div className="flex-1 overflow-y-auto p-4 space-y-2">
                    {chatSessions.length === 0 ? (
                        <div className="text-center text-gray-500 text-sm py-8">
                            No interview history yet
                        </div>
                    ) : (
                        chatSessions.map((session) => (
                            <div
                                key={session.id}
                                className={`
                  w-full rounded-lg transition-all duration-300
                  ${chatId === session.id
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
                                            {/* Mode Icon */}
                                            <div className="shrink-0 mt-1">
                                                {session.mode === "voice" ? (
                                                    <svg className="w-4 h-4 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                                                    </svg>
                                                ) : (
                                                    <svg className="w-4 h-4 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                                    </svg>
                                                )}
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
                                                    <span className="text-xs text-gray-600">•</span>
                                                    <span className="text-xs text-gray-500">
                                                        {session.messageCount} messages
                                                    </span>
                                                    <span className="text-xs text-gray-600">•</span>
                                                    <span className="text-xs text-yellow-400/70 capitalize">
                                                        {session.mode}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Action Buttons */}
                                            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={(e) => handleRenameClick(session, e)}
                                                    className="p-1 text-gray-400 hover:text-yellow-400 transition-colors"
                                                    title="Rename"
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                                    </svg>
                                                </button>

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
                                                        title="Delete"
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
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                        <span>Total: {chatSessions.length} interviews</span>
                    </div>
                </div>
            </div>
        </div>
    );
}