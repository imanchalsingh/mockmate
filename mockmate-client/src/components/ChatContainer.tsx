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

    const sendMessage = (text: string) => {
        const userMessage: Message = {
            id: Date.now().toString(),
            role: "user",
            content: text
        };

        setMessages(prev => [...prev, userMessage]);

        // fake AI response
        setTimeout(() => {
            setMessages(prev => [
                ...prev,
                {
                    id: Math.random().toString(),
                    role: "ai",
                    content: "Interesting answer! Tell me more."
                }
            ]);
        }, 800);
    };

    return (
        <div className="flex flex-col h-screen p-4">
            <div className="flex-1 overflow-y-auto">
                {messages.map(msg => (
                    <MessageBubble
                        key={msg.id}
                        role={msg.role}
                        content={msg.content}
                    />
                ))}
            </div>

            <ChatInput onSend={sendMessage} />
        </div>
    );
}