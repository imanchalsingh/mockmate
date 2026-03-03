import { useState } from "react";
import MessageBubble from "./MessageBubble";
import ChatInput from "./ChatInput";
import type { Message } from "../types";

export default function ChatContainer() {
    const [messages, setMessages] = useState<Message[]>([
        {
            id: "1",
            role: "ai",
            content: "Hi, I'm MockMate. Ready for your interview?"
        }
    ]);
    const [isLoading, setIsLoading] = useState(false);

    const sendMessage = async (text: string) => {
        const userMessage: Message = {
            id: Date.now().toString(),
            role: "user",
            content: text
        };

        setMessages(prev => [...prev, userMessage]);
        setIsLoading(true);

        const res = await fetch("http://localhost:5000/api/interview/ask", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                message: text,
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
        setIsLoading(false);
    };

    return (
        <div className="flex flex-col h-screen bg-gray-900">
            {/* Header */}
            <div className="border-b border-gray-800 p-4">
                <div className="max-w-4xl mx-auto flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse"></div>
                    <h1 className="text-yellow-400 font-semibold">MockMate AI</h1>
                    <span className="text-xs text-gray-500 ml-auto">Interview Mode</span>
                </div>
            </div>

            {/* Messages Container */}
            <div className="flex-1 overflow-y-auto p-4 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-gray-900">
                <div className="max-w-4xl mx-auto space-y-4">
                    {messages.map(msg => (
                        <MessageBubble
                            key={msg.id}
                            role={msg.role}
                            content={msg.content}
                        />
                    ))}
                    
                    {/* Typing indicator placeholder */}
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
                    <ChatInput onSend={sendMessage} />
                    
                    {/* Footer note */}
                    <p className="text-xs text-gray-600 mt-2 text-center">
                        Press <span className="text-yellow-400">Enter</span> to send, 
                        <span className="text-yellow-400 ml-1">Shift + Enter</span> for new line
                    </p>
                </div>
            </div>
        </div>
    );
}