import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchWithAuth } from "../../api/fetchWithAuth";

// Types
interface Assessment {
  _id: string;
  id?: string;
  topic: string;
  title?: string;
  overallScore: number;
  createdAt: string;
  updatedAt?: string;
  sessionId?: string;
  interviewDate?: string;
  questionsAnswered?: number;
  duration?: string;
}

export default function AssessmentHistory() {
  const [history, setHistory] = useState<Assessment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterScore, setFilterScore] = useState<number | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetchWithAuth("/interview/assessment/history");

      if (!res.ok) {
        throw new Error(`Failed to load history: ${res.status}`);
      }

      const data = await res.json();
      setHistory(data.assessments || data || []);
    } catch (err) {
      console.error("Error loading assessment history:", err);
      setError(err instanceof Error ? err.message : "Failed to load history");
    } finally {
      setLoading(false);
    }
  };

  const deleteAssessment = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm("Are you sure you want to delete this assessment?")) {
      try {
        await fetchWithAuth(`/interview/assessment/${id}`, {
          method: "DELETE",
        });
        await loadHistory(); // Refresh the list
      } catch (err) {
        console.error("Failed to delete assessment:", err);
        setError("Failed to delete assessment");
      }
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-400";
    if (score >= 60) return "text-yellow-400";
    if (score >= 40) return "text-orange-400";
    return "text-red-400";
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 80) return "bg-green-400/10 border-green-400/30";
    if (score >= 60) return "bg-yellow-400/10 border-yellow-400/30";
    if (score >= 40) return "bg-orange-400/10 border-orange-400/30";
    return "bg-red-400/10 border-red-400/30";
  };

  // const getScoreRingColor = (score: number) => {
  //   if (score >= 80) return "stroke-green-400";
  //   if (score >= 60) return "stroke-yellow-400";
  //   if (score >= 40) return "stroke-orange-400";
  //   return "stroke-red-400";
  // };

  const filteredHistory = history.filter(assessment => {
    const topic = assessment.topic || assessment.title || "";
    const matchesSearch = topic.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesScore = filterScore ? assessment.overallScore >= filterScore : true;
    return matchesSearch && matchesScore;
  });

  const getAverageScore = () => {
    if (history.length === 0) return 0;
    const sum = history.reduce((acc, curr) => acc + curr.overallScore, 0);
    return Math.round(sum / history.length);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-yellow-400/30 border-t-yellow-400 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Loading assessment history...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <div className="border-b border-gray-800 bg-gray-900/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse"></div>
            <h1 className="text-yellow-400 font-semibold">Assessment History</h1>
            <span className="text-xs text-gray-500 ml-auto">
              {history.length} assessments
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Stats Section */}
        {history.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-yellow-400/10 rounded-lg">
                  <svg className="w-6 h-6 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Total Assessments</p>
                  <p className="text-2xl font-bold text-white">{history.length}</p>
                </div>
              </div>
            </div>

            <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-yellow-400/10 rounded-lg">
                  <svg className="w-6 h-6 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Average Score</p>
                  <p className={`text-2xl font-bold ${getScoreColor(getAverageScore())}`}>
                    {getAverageScore()}/100
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-yellow-400/10 rounded-lg">
                  <svg className="w-6 h-6 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Highest Score</p>
                  <p className={`text-2xl font-bold ${getScoreColor(Math.max(...history.map(h => h.overallScore)))}`}>
                    {Math.max(...history.map(h => h.overallScore))}/100
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Search and Filter */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search assessments..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg 
                         text-gray-200 placeholder-gray-600 outline-none
                         focus:border-yellow-400/50 focus:ring-1 focus:ring-yellow-400/50
                         transition-all duration-300"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <select
              value={filterScore || ""}
              onChange={(e) => setFilterScore(e.target.value ? Number(e.target.value) : null)}
              className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg 
                       text-gray-200 outline-none focus:border-yellow-400/50
                       transition-all duration-300"
            >
              <option value="">All Scores</option>
              <option value="80">80+ (Excellent)</option>
              <option value="60">60+ (Good)</option>
              <option value="40">40+ (Average)</option>
              <option value="0">Below 40 (Needs Improvement)</option>
            </select>
            <button
              onClick={() => {
                setSearchTerm("");
                setFilterScore(null);
              }}
              className="px-4 py-2 bg-gray-800 text-gray-400 rounded-lg hover:text-yellow-400 
                       transition-colors duration-300"
            >
              Clear
            </button>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-6 bg-red-400/10 border border-red-400/30 rounded-xl p-4">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        {/* History List */}
        {filteredHistory.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-600 mb-4">
              <svg className="w-20 h-20 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <p className="text-gray-400 text-lg mb-2">No assessments found</p>
            <p className="text-gray-500 text-sm">
              {searchTerm || filterScore
                ? "Try adjusting your search or filter"
                : "Generate your first assessment to see it here"}
            </p>
            {!searchTerm && !filterScore && (
              <button
                onClick={() => navigate("/assessment/new")}
                className="mt-4 px-4 py-2 bg-yellow-400 text-gray-900 rounded-lg hover:bg-yellow-300 
                         transition-colors duration-300 inline-flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                New Assessment
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {filteredHistory.map((assessment) => (
              <div
                key={assessment._id}
                onClick={() => navigate(`/assessment/${assessment._id}`)}
                className="group bg-gray-800/30 border border-gray-700 rounded-xl p-4 
                         hover:border-yellow-400/30 hover:bg-gray-800/50 
                         transition-all duration-300 cursor-pointer"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    {/* Title and Topic */}
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-white font-medium truncate">
                        {assessment.topic || assessment.title || "Untitled Assessment"}
                      </h3>
                      {assessment.sessionId && (
                        <span className="text-xs text-gray-500 bg-gray-800 px-2 py-0.5 rounded">
                          Interview
                        </span>
                      )}
                    </div>

                    {/* Metadata */}
                    <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        {new Date(assessment.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </span>

                      {assessment.interviewDate && (
                        <>
                          <span className="text-gray-600">•</span>
                          <span className="flex items-center gap-1">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {new Date(assessment.interviewDate).toLocaleDateString()}
                          </span>
                        </>
                      )}

                      {assessment.questionsAnswered && (
                        <>
                          <span className="text-gray-600">•</span>
                          <span className="flex items-center gap-1">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                            </svg>
                            {assessment.questionsAnswered} questions
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Score Badge */}
                  <div className="flex items-center gap-3">
                    <div className={`flex items-center justify-center w-16 h-16 rounded-full 
                                   border-2 ${getScoreBgColor(assessment.overallScore)}`}>
                      <div className="text-center">
                        <span className={`text-xl font-bold ${getScoreColor(assessment.overallScore)}`}>
                          {assessment.overallScore}
                        </span>
                        <span className="text-xs text-gray-500">/100</span>
                      </div>
                    </div>

                    {/* Delete Button */}
                    <button
                      onClick={(e) => deleteAssessment(assessment._id, e)}
                      className="opacity-0 group-hover:opacity-100 p-2 text-gray-400 
                               hover:text-red-400 transition-all duration-300"
                      title="Delete assessment"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>

                    {/* Arrow Indicator */}
                    <svg className="w-5 h-5 text-gray-600 group-hover:text-yellow-400 
                                  transition-colors duration-300"
                      fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>

                {/* Score Progress Bar (optional) */}
                <div className="mt-3">
                  <div className="w-full bg-gray-700 rounded-full h-1">
                    <div
                      className={`h-1 rounded-full transition-all duration-500 ${assessment.overallScore >= 80 ? 'bg-green-400' :
                        assessment.overallScore >= 60 ? 'bg-yellow-400' :
                          assessment.overallScore >= 40 ? 'bg-orange-400' : 'bg-red-400'
                        }`}
                      style={{ width: `${assessment.overallScore}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* New Assessment Button */}
        {filteredHistory.length > 0 && (
          <div className="mt-8 text-center">
            <button
              onClick={() => navigate("/assessment/new")}
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-yellow-400 text-gray-900 
                       rounded-lg hover:bg-yellow-300 transition-all duration-300 font-medium"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              New Assessment
            </button>
          </div>
        )}
      </div>
    </div>
  );
}