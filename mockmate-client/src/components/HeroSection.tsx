import React from 'react'
import { useNavigate } from 'react-router-dom'
import { MessageSquare, FileText, Brain, Users, Award, BarChart, Video } from 'lucide-react'

interface FeatureCard {
    id: string;
    title: string;
    description: string;
    icon: React.ReactNode;
    route: string;
    badge?: string;
    comingSoon?: boolean;
}

const HeroSection: React.FC = () => {
    const navigate = useNavigate()

    const cards: FeatureCard[] = [
        {
            id: "chat",
            title: "Chat Interview",
            description: "Text and Voice based interview practice with instant feedback",
            icon: <MessageSquare className="w-8 h-8 md:w-10 md:h-10" />,
            route: "/chats-interview"
        },
        {
            id: "assessment",
            title: "AI Assessments",
            description: "Practice through comprehensive assessments",
            icon: <FileText className="w-8 h-8 md:w-10 md:h-10" />,
            route: "/assessment/create",
        },
        {
            id: "technical",
            title: "Technical Interview",
            description: "Coding and technical problem solving",
            icon: <Brain className="w-8 h-8 md:w-10 md:h-10" />,
            route: "/technical-interview",
            comingSoon: true
        },
        {
            id: "group",
            title: "Group Discussion",
            description: "Practice with AI-powered group simulations",
            icon: <Users className="w-8 h-8 md:w-10 md:h-10" />,
            route: "/group-discussion",
            comingSoon: true
        },
        {
            id: "analytics",
            title: "Performance Analytics",
            description: "Track your progress and get insights",
            icon: <BarChart className="w-8 h-8 md:w-10 md:h-10" />,
            route: "/analytics",
            comingSoon: true
        },
        {
            id: "resume",
            title: "Resume Review",
            description: "AI-powered resume analysis and tips",
            icon: <Award className="w-8 h-8 md:w-10 md:h-10" />,
            route: "/resume-review",
            comingSoon: true
        },
        {
            id: "video",
            title: "Video Interview",
            description: "Face-to-face practice with body language analysis",
            icon: <Video className="w-8 h-8 md:w-10 md:h-10" />,
            route: "/video-interview",
            badge: "Premium",
            comingSoon: true
        }
    ]

    const handleNavigation = (card: FeatureCard) => {
        if (!card.comingSoon) {
            navigate(card.route)
        }
    }

    return (
        <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
            <div className="max-w-7xl w-full">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-3xl md:text-4xl font-bold text-yellow-400 mb-2">
                        MockMate
                    </h1>
                    <p className="text-gray-400 text-sm md:text-base">
                        Master your interviews with AI-powered practice
                    </p>
                </div>

                {/* Cards Container - Responsive grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                    {cards.map((card) => (
                        <div
                            key={card.id}
                            onClick={() => handleNavigation(card)}
                            className={`
                                group bg-gray-800/50 border border-gray-700/50 rounded-xl p-6 
                                transition-all duration-300
                                ${!card.comingSoon
                                    ? 'hover:border-yellow-400/50 hover:bg-gray-800/80 cursor-pointer'
                                    : 'opacity-60 cursor-not-allowed'
                                }
                                flex flex-col items-center text-center relative
                            `}
                        >
                            {/* Badge */}
                            {card.badge && (
                                <div className="absolute top-3 right-3">
                                    <span className="text-xs bg-yellow-400/20 text-yellow-400 px-2 py-1 rounded-full">
                                        {card.badge}
                                    </span>
                                </div>
                            )}

                            {/* Coming Soon Overlay */}
                            {card.comingSoon && (
                                <div className="absolute inset-0 bg-gray-900/80 rounded-xl flex items-center justify-center z-10">
                                    <span className="text-yellow-400 text-sm font-medium bg-gray-800/90 px-3 py-1 rounded-full">
                                        Coming Soon
                                    </span>
                                </div>
                            )}

                            {/* Icon */}
                            <div className={`
                                w-16 h-16 md:w-20 md:h-20 bg-yellow-400/10 rounded-2xl 
                                flex items-center justify-center mb-4
                                ${!card.comingSoon && 'group-hover:bg-yellow-400/20'} 
                                transition-all duration-300
                            `}>
                                <div className="text-yellow-400">
                                    {card.icon}
                                </div>
                            </div>

                            {/* Content */}
                            <h2 className="text-xl md:text-2xl font-semibold text-white mb-2">
                                {card.title}
                            </h2>
                            <p className="text-gray-400 text-sm md:text-base mb-4">
                                {card.description}
                            </p>

                            {/* Indicator */}
                            {!card.comingSoon && (
                                <div className="flex items-center gap-2 text-yellow-400 text-sm font-medium">
                                    <span>Start {card.title.split(' ')[0]}</span>
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
                            )}
                        </div>
                    ))}
                </div>

                {/* Stats Section */}
                <div className="mt-12 pt-8 border-t border-gray-800">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                        <div>
                            <div className="text-2xl md:text-3xl font-bold text-yellow-400">500+</div>
                            <div className="text-xs text-gray-500 mt-1">Interview Questions</div>
                        </div>
                        <div>
                            <div className="text-2xl md:text-3xl font-bold text-yellow-400">50+</div>
                            <div className="text-xs text-gray-500 mt-1">Practice Scenarios</div>
                        </div>
                        <div>
                            <div className="text-2xl md:text-3xl font-bold text-yellow-400">1000+</div>
                            <div className="text-xs text-gray-500 mt-1">Active Users</div>
                        </div>
                        <div>
                            <div className="text-2xl md:text-3xl font-bold text-yellow-400">95%</div>
                            <div className="text-xs text-gray-500 mt-1">Success Rate</div>
                        </div>
                    </div>
                </div>

                {/* Footer Note */}
                <p className="text-center text-gray-600 text-xs mt-8">
                    Select your preferred interview format to begin your journey
                </p>
            </div>
        </div>
    )
}

export default HeroSection