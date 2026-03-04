
interface MessageBubbleProps {
    role: "user" | "ai";
    content: string;
}

export default function MessageBubble({ role, content }: MessageBubbleProps) {
    const isUser = role === "user";

    return (
        <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
            <div className={`flex max-w-[80%] md:max-w-[70%] ${isUser ? 'flex-row-reverse' : 'flex-row'} items-start gap-2`}>
                {/* Avatar */}
                <div className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
                    ${isUser 
                        ? 'bg-gray-800 text-yellow-400 border border-gray-700' 
                        : 'bg-yellow-400/10 text-yellow-400 border border-yellow-400/30'
                    }`}>
                    {isUser ? 'U' : 'AI'}
                </div>

                {/* Message Content */}
                <div className="flex flex-col gap-1">
                    {/* Name */}
                    <span className={`text-xs font-medium ${isUser ? 'text-gray-400 text-right' : 'text-yellow-400'}`}>
                        {isUser ? 'You' : 'MockMate'}
                    </span>
                    
                    {/* Bubble */}
                    <div className={`rounded-2xl px-4 py-2.5 text-sm
                        ${isUser 
                            ? 'bg-gray-800 text-gray-200 rounded-tr-none border border-gray-700' 
                            : 'bg-gray-800/50 text-gray-200 rounded-tl-none border border-gray-700/50'
                        }`}>
                        <p className="whitespace-pre-wrap wrap-break-words">{content}</p>
                    </div>
                    
                  
                </div>
            </div>
        </div>
    );
}