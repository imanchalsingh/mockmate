import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchWithAuth } from "../../api/fetchWithAuth";

// Types
interface AssessmentResponse {
  id: string;
  _id?: string;
  topic?: string;
  title?: string;
}

export default function CreateAssessment() {
  const navigate = useNavigate();

  const [topic, setTopic] = useState("");
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const topics = [
    "Frontend Interview",
    "React Concepts",
    "DSA Problem Solving",
    "System Design",
    "Behavioral Interview",
    "JavaScript Fundamentals",
    "Node.js & Backend",
    "Database Design",
    "DevOps & Cloud",
    "Soft Skills"
  ];

  const generateAssessment = async () => {
    if (!input.trim()) {
      setError("Please paste your answer or transcript to analyze");
      return;
    }

    if (!topic.trim()) {
      setError("Please select or enter a topic");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetchWithAuth("/interview/assessment", {
        method: "POST",
        body: JSON.stringify({
          topic: topic.trim(),
          input: input.trim()
        })
      });

      if (!res.ok) {
        throw new Error(`Failed to generate assessment: ${res.status}`);
      }

      const data: AssessmentResponse = await res.json();
      navigate(`/interview/assessment/${data.id || data._id}`);
    } catch (err) {
      console.error("Error generating assessment:", err);
      setError(err instanceof Error ? err.message : "Failed to generate assessment");
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      generateAssessment();
    }
  };

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <div className="border-b border-gray-800 bg-gray-900/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse"></div>
            <h1 className="text-yellow-400 font-semibold">AI Assessment Generator</h1>
            <button
              onClick={() => navigate("/assessment/history")}
              className="ml-auto flex items-center gap-2 px-3 py-1 text-xs text-gray-400 
                       hover:text-yellow-400 transition-colors bg-gray-800 rounded-lg"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              View History
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-white mb-3">
            Generate AI Assessment
          </h2>
          <p className="text-gray-400">
            Paste your interview response or transcript to get instant AI-powered feedback
          </p>
        </div>

        {/* Main Form */}
        <div className="bg-gray-800/30 border border-gray-700 rounded-xl p-6 space-y-6">
          {/* Topic Selection */}
          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-300">
              Interview Topic
            </label>
            <div className="flex flex-wrap gap-2 mb-3">
              {topics.map(t => (
                <button
                  key={t}
                  onClick={() => setTopic(t)}
                  className={`
                    px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-300
                    ${topic === t
                      ? 'bg-yellow-400 text-gray-900'
                      : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-yellow-400 border border-gray-700'
                    }
                  `}
                >
                  {t}
                </button>
              ))}
            </div>
            <div className="relative">
              <input
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="Or enter custom topic..."
                className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 
                         text-gray-200 placeholder-gray-600 outline-none
                         focus:border-yellow-400/50 focus:ring-1 focus:ring-yellow-400/50
                         transition-all duration-300"
              />
              {topic && !topics.includes(topic) && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <span className="text-xs text-yellow-400">Custom</span>
                </div>
              )}
            </div>
          </div>

          {/* Input Area */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="block text-sm font-medium text-gray-300">
                Your Response / Transcript
              </label>
              <span className="text-xs text-gray-500">
                {input.length} characters
              </span>
            </div>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Paste your interview answer, conversation transcript, or any text you want to analyze..."
              rows={8}
              className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 
                       text-gray-200 placeholder-gray-600 outline-none resize-none
                       focus:border-yellow-400/50 focus:ring-1 focus:ring-yellow-400/50
                       transition-all duration-300"
            />
            <div className="flex justify-between text-xs text-gray-500">
              <span>💡 Tip: Include as much detail as possible for better analysis</span>
              <span className="hidden sm:inline">⌘ + Enter to submit</span>
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <div className="bg-red-400/10 border border-red-400/30 rounded-lg p-3">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          {/* Generate Button */}
          <button
            onClick={generateAssessment}
            disabled={loading || !input.trim()}
            className={`
              w-full flex items-center justify-center gap-2 py-3 rounded-lg font-medium
              transition-all duration-300
              ${loading || !input.trim()
                ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                : 'bg-yellow-400 text-gray-900 hover:bg-yellow-300 transform hover:scale-[1.02]'
              }
            `}
          >
            {loading ? (
              <>
                <svg className="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Analyzing Your Response...
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Generate Assessment
              </>
            )}
          </button>
        </div>

        {/* Features Section */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gray-800/30 border border-gray-700 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <svg className="w-5 h-5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="text-sm font-semibold text-white">Instant Feedback</h3>
            </div>
            <p className="text-xs text-gray-400">Get detailed analysis of your response in seconds</p>
          </div>

          <div className="bg-gray-800/30 border border-gray-700 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <svg className="w-5 h-5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <h3 className="text-sm font-semibold text-white">Actionable Insights</h3>
            </div>
            <p className="text-xs text-gray-400">Get strengths, weaknesses, and improvement suggestions</p>
          </div>

          <div className="bg-gray-800/30 border border-gray-700 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <svg className="w-5 h-5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <h3 className="text-sm font-semibold text-white">Track Progress</h3>
            </div>
            <p className="text-xs text-gray-400">Save and compare assessments over time</p>
          </div>
        </div>

        {/* Example Section */}
        <div className="mt-8 bg-gray-800/20 border border-gray-800 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-3">
            <svg className="w-4 h-4 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="text-sm font-semibold text-white">Example Response</h3>
          </div>
          <div className="text-xs text-gray-400 space-y-2">
            <p className="italic">
              "I have 5 years of experience in React development. I've worked on large-scale applications
              with state management using Redux and Context API. I'm familiar with hooks, custom hooks,
              and performance optimization techniques like memoization and code splitting."
            </p>
            <button
              onClick={() => setInput("I have 5 years of experience in React development. I've worked on large-scale applications with state management using Redux and Context API. I'm familiar with hooks, custom hooks, and performance optimization techniques like memoization and code splitting.")}
              className="text-yellow-400 hover:text-yellow-300 transition-colors"
            >
              Use this example →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}