import React, { useState, useRef } from "react";

// Types
type Message = {
  role: "user" | "assistant";
  text: string;
  id: string;
  timestamp: Date;
};

export default function VoiceInterviewComponent() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [listening, setListening] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);

  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  //  scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  React.useEffect(() => {
    scrollToBottom();
  }, [messages]);

  //  add messages
  const addMessage = (role: Message["role"], text: string) => {
    const newMessage: Message = {
      role,
      text,
      id: Date.now().toString(),
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, newMessage]);
    return newMessage;
  };

  // from text to speech
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

  //  send to backend - ai services
  const sendToAI = async (text: string) => {
    try {
      setIsProcessing(true);
      addMessage("user", text);

      const res = await fetch("/api/interview/ask", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ message: text }),
      });

      const data: { reply: string } = await res.json();
      const reply = data.reply;

      addMessage("assistant", reply);
      await speak(reply);
    } catch (err) {
      console.error(err);
      addMessage("assistant", "Sorry, I encountered an error. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  //  start listening
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
      sendToAI(transcript);
    };

    recognition.onend = () => {
      setListening(false);
    };

    recognition.onerror = (e: SpeechRecognitionErrorEvent) => {
      console.error("Speech error:", e);
      setListening(false);

      if (e.error === "not-allowed") {
        alert("Please allow microphone access to use voice features.");
      } else if (e.error === "no-speech") {
        // Silent fail - no speech detected
      }
    };

    recognition.start();
    recognitionRef.current = recognition;
  };

  // stop listening
  const stopListening = () => {
    recognitionRef.current?.stop();
    setListening(false);
  };

  // chat clear
  const clearChat = () => {
    if (confirm("Are you sure you want to clear the conversation?")) {
      setMessages([]);
      window.speechSynthesis.cancel();
    }
  };

  // time formatter
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="flex flex-col h-screen bg-gray-900">
      {/* Header */}
      <div className="border-b border-gray-800 p-4">
        <div className="max-w-4xl mx-auto flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse"></div>
          <h1 className="text-yellow-400 font-semibold">MockMate Voice Interview</h1>

          {/* Voice Status Indicator */}
          <div className="flex items-center gap-2 ml-4">
            {listening && (
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-xs text-green-400">Listening</span>
              </div>
            )}
            {isSpeaking && (
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

          <span className="text-xs text-gray-500 ml-auto">
            {messages.length} messages
          </span>
        </div>
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-4 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-gray-900">
        <div className="max-w-4xl mx-auto space-y-4">
          {messages.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-600 mb-2">
                <svg
                  className="w-16 h-16 mx-auto"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1}
                    d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
                  />
                </svg>
              </div>
              <p className="text-gray-500 text-sm mb-2">
                Ready for your voice interview
              </p>
              <p className="text-gray-600 text-xs">
                Click the microphone button to start speaking
              </p>
            </div>
          ) : (
            messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div className={`flex max-w-[80%] md:max-w-[70%] ${msg.role === "user" ? "flex-row-reverse" : "flex-row"} items-start gap-2`}>
                  {/* Avatar */}
                  <div className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
                    ${msg.role === "user"
                      ? 'bg-gray-800 text-yellow-400 border border-gray-700'
                      : 'bg-yellow-400/10 text-yellow-400 border border-yellow-400/30'
                    }`}>
                    {msg.role === "user" ? "U" : "AI"}
                  </div>

                  {/* Message Content */}
                  <div className="flex flex-col gap-1">
                    {/* Name */}
                    <span className={`text-xs font-medium ${msg.role === "user" ? 'text-gray-400 text-right' : 'text-yellow-400'}`}>
                      {msg.role === "user" ? 'You' : 'MockMate'}
                    </span>

                    {/* Bubble */}
                    <div className={`rounded-2xl px-4 py-2.5 text-sm
                      ${msg.role === "user"
                        ? 'bg-gray-800 text-gray-200 rounded-tr-none border border-gray-700'
                        : 'bg-gray-800/50 text-gray-200 rounded-tl-none border border-gray-700/50'
                      }`}>
                      <p className="whitespace-pre-wrap wrap-break-words">{msg.text}</p>
                    </div>

                    {/* Timestamp */}
                    <span className={`text-[10px] text-gray-600 ${msg.role === "user" ? 'text-right' : 'text-left'}`}>
                      {formatTime(msg.timestamp)}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}

          {/* Typing/Speaking indicator */}
          {(isProcessing || isSpeaking) && !listening && (
            <div className="flex justify-start">
              <div className="flex items-center gap-2 bg-gray-800/50 rounded-2xl px-4 py-2.5 border border-gray-700/50">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-yellow-400/50 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-yellow-400/50 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                  <div className="w-2 h-2 bg-yellow-400/50 rounded-full animate-bounce [animation-delay:0.4s]"></div>
                </div>
                <span className="text-xs text-gray-400">
                  {isProcessing ? "AI is thinking..." : "Speaking..."}
                </span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Controls Area */}
      <div className="border-t border-gray-800 bg-gray-900 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between gap-4">
            {/* Voice Controls */}
            <div className="flex items-center gap-3">
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
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
                    />
                  </svg>

                  {/* Ripple effect */}
                  <span className="absolute inset-0 rounded-full animate-ping bg-yellow-400/30"></span>
                </button>
              ) : (
                <button
                  onClick={stopListening}
                  className="group relative w-14 h-14 rounded-full flex items-center justify-center
                           bg-red-500 text-white hover:bg-red-600 transition-all duration-300 hover:scale-105"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 10h6v4H9z"
                    />
                  </svg>

                  {/* Pulse animation for listening */}
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
                  <span className="text-gray-500">Click to speak</span>
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

          {/* Footer note */}
          <p className="text-xs text-gray-600 mt-4 text-center">
            🎤 Speak clearly into your microphone • {!listening && !isProcessing && !isSpeaking && "Click the microphone to start"}
          </p>
        </div>
      </div>
    </div>
  );
}