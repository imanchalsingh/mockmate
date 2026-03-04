import React from 'react'
import { useNavigate } from 'react-router-dom'

const HeroSection: React.FC = () => {
    const navigate = useNavigate()

    return (
        <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
            <div className="max-w-4xl w-full">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-3xl md:text-4xl font-bold text-yellow-400 mb-2">
                        MockMate
                    </h1>
                    <p className="text-gray-400 text-sm md:text-base">
                        Choose your interview mode
                    </p>
                </div>

                {/* Cards Container */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                    {/* Chat Interview Card */}
                    <div
                        onClick={() => navigate('/chats-interview')}
                        className="group bg-gray-800/50 border border-gray-700/50 rounded-xl p-6 md:p-8 
                                 hover:border-yellow-400/50 hover:bg-gray-800/80 
                                 transition-all duration-300 cursor-pointer
                                 flex flex-col items-center text-center"
                    >
                        {/* Icon */}
                        <div className="w-16 h-16 md:w-20 md:h-20 bg-yellow-400/10 rounded-2xl 
                                      flex items-center justify-center mb-4
                                      group-hover:bg-yellow-400/20 transition-all duration-300">
                            <svg 
                                className="w-8 h-8 md:w-10 md:h-10 text-yellow-400" 
                                fill="none" 
                                stroke="currentColor" 
                                viewBox="0 0 24 24"
                            >
                                <path 
                                    strokeLinecap="round" 
                                    strokeLinejoin="round" 
                                    strokeWidth={1.5} 
                                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" 
                                />
                            </svg>
                        </div>

                        {/* Content */}
                        <h2 className="text-xl md:text-2xl font-semibold text-white mb-2">
                            Chat Interview
                        </h2>
                        <p className="text-gray-400 text-sm md:text-base mb-4">
                            Text-based interview practice
                        </p>

                        {/* Indicator */}
                        <div className="flex items-center gap-2 text-yellow-400 text-sm font-medium">
                            <span>Start Chat</span>
                            <svg 
                                className="w-4 h-4 group-hover:translate-x-1 transition-transform" 
                                fill="none" 
                                stroke="currentColor" 
                                viewBox="0 0 24 24"
                            >
                                <path 
                                    strokeLinecap="round" 
                                    strokeLinejoin="round" 
                                    strokeWidth={2} 
                                    d="M9 5l7 7-7 7" 
                                />
                            </svg>
                        </div>
                    </div>

                    {/* Voice Interview Card */}
                    <div
                        onClick={() => navigate('/voice-interview')}
                        className="group bg-gray-800/50 border border-gray-700/50 rounded-xl p-6 md:p-8 
                                 hover:border-yellow-400/50 hover:bg-gray-800/80 
                                 transition-all duration-300 cursor-pointer
                                 flex flex-col items-center text-center"
                    >
                        {/* Icon */}
                        <div className="w-16 h-16 md:w-20 md:h-20 bg-yellow-400/10 rounded-2xl 
                                      flex items-center justify-center mb-4
                                      group-hover:bg-yellow-400/20 transition-all duration-300">
                            <svg 
                                className="w-8 h-8 md:w-10 md:h-10 text-yellow-400" 
                                fill="none" 
                                stroke="currentColor" 
                                viewBox="0 0 24 24"
                            >
                                <path 
                                    strokeLinecap="round" 
                                    strokeLinejoin="round" 
                                    strokeWidth={1.5} 
                                    d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" 
                                />
                            </svg>
                        </div>

                        {/* Content */}
                        <h2 className="text-xl md:text-2xl font-semibold text-white mb-2">
                            Voice Interview
                        </h2>
                        <p className="text-gray-400 text-sm md:text-base mb-4">
                            Real conversation practice
                        </p>

                        {/* Indicator */}
                        <div className="flex items-center gap-2 text-yellow-400 text-sm font-medium">
                            <span>Start Voice</span>
                            <svg 
                                className="w-4 h-4 group-hover:translate-x-1 transition-transform" 
                                fill="none" 
                                stroke="currentColor" 
                                viewBox="0 0 24 24"
                            >
                                <path 
                                    strokeLinecap="round" 
                                    strokeLinejoin="round" 
                                    strokeWidth={2} 
                                    d="M9 5l7 7-7 7" 
                                />
                            </svg>
                        </div>
                    </div>
                </div>

                {/* Footer Note */}
                <p className="text-center text-gray-600 text-xs mt-8">
                    Select your preferred interview format to begin
                </p>
            </div>
        </div>
    )
}

export default HeroSection