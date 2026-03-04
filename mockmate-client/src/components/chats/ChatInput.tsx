import { useState } from "react";
import type { KeyboardEvent } from "react";
import { useSpeech } from "../../hooks/useSpeech";


interface ChatInputProps {
    onSend: (message: string) => void;
}

export default function ChatInput({ onSend }: ChatInputProps) {
    const [message, setMessage] = useState("");

    const { startListening, listening } = useSpeech((speechText) => {
        onSend(speechText);
    });

    const handleSend = () => {
        if (message.trim()) {
            onSend(message);
            setMessage("");
        }
    };

    const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <div className="flex items-end gap-2 bg-gray-800/50 rounded-xl border border-gray-700/50 p-2 focus-within:border-yellow-400/50 focus-within:ring-1 focus-within:ring-yellow-400/50 transition-all">
            <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type your message..."
                rows={1}
                className="flex-1 bg-transparent text-gray-200 placeholder-gray-600 outline-none resize-none max-h-32 p-2 text-sm"
                style={{ minHeight: '44px' }}
            />

            <button
                onClick={handleSend}
                disabled={!message.trim()}
                className={`shrink-0 w-10 h-10 rounded-lg flex items-center justify-center transition-all
                    ${message.trim()
                        ? 'bg-yellow-400 text-gray-900 hover:bg-yellow-300'
                        : 'bg-gray-800 text-gray-600 cursor-not-allowed border border-gray-700'
                    }`}
            >
                <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                    />
                </svg>
            </button>
            <button
                onClick={startListening}
                className={`p-3 rounded-lg transition-all duration-300 ${listening
                        ? 'bg-yellow-400/20 text-yellow-400 border border-yellow-400/50'
                        : 'bg-gray-800 text-gray-400 hover:text-yellow-400 hover:border-yellow-400/50 border border-gray-700'
                    }`}
            >
                {listening ? (
                    <svg
                        className="w-4 h-4 animate-pulse"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        {/* Listening icon with sound waves */}
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
                        />
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15.5 8.5A3.5 3.5 0 0112 12M8.5 8.5A3.5 3.5 0 0012 12"
                            className="opacity-50"
                        />
                    </svg>
                ) : (
                    <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        {/* Microphone icon */}
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
                        />
                    </svg>
                )}
            </button>
        </div>
    );
}