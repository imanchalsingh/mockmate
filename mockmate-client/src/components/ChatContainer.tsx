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

    const sendMessage = async (text: string) => {
        const userMessage: Message = {
            id: Date.now().toString(),
            role: "user",
            content: text
        };

        setMessages(prev => [...prev, userMessage]);

        const res = await fetch(
            "http://localhost:3000/api/interview/ask",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ message: text })
            }
        );

        const data = await res.json();

        setMessages(prev => [
            ...prev,
            {
                id: Math.random().toString(),
                role: "ai",
                content: data.reply
            }
        ]);
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