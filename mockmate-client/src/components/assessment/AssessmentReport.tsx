import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { fetchWithAuth } from "../../api/fetchWithAuth";

// Types
interface AssessmentReport {
  _id: string;
  topic?: string;
  title?: string;
  report: {
    score: number;
    overallScore?: number;
    communication?: number;
    technicalKnowledge?: number;
    problemSolving?: number;
    confidence?: number;
    clarity?: number;
    strengths: string[];
    weaknesses: string[];
    improvements: string[];
    summary: string;
    finalVerdict?: string;
  };
  createdAt: string;
  interviewDate?: string;
  duration?: string;
  questionsAnswered?: number;
}

export default function AssessmentReport() {
  const { assessmentId } = useParams();
  const navigate = useNavigate();
  const [report, setReport] = useState<AssessmentReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await fetchWithAuth(`/interview/assessment/${assessmentId}`);

        if (!res.ok) {
          throw new Error(`Failed to load report: ${res.status}`);
        }

        const data = await res.json();
        setReport(data);
      } catch (err) {
        console.error("Error loading assessment report:", err);
        setError(err instanceof Error ? err.message : "Failed to load report");
      } finally {
        setLoading(false);
      }
    };

    if (assessmentId) load();
  }, [assessmentId]);

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-400";
    if (score >= 60) return "text-yellow-400";
    if (score >= 40) return "text-orange-400";
    return "text-red-400";
  };

  const getScoreRingColor = (score: number) => {
    if (score >= 80) return "stroke-green-400";
    if (score >= 60) return "stroke-yellow-400";
    if (score >= 40) return "stroke-orange-400";
    return "stroke-red-400";
  };

  // const getScoreBgColor = (score: number) => {
  //   if (score >= 80) return "bg-green-400/10";
  //   if (score >= 60) return "bg-yellow-400/10";
  //   if (score >= 40) return "bg-orange-400/10";
  //   return "bg-red-400/10";
  // };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-yellow-400/30 border-t-yellow-400 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Loading assessment report...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="text-red-400 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">Failed to Load Report</h3>
          <p className="text-gray-400 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-yellow-400 text-gray-900 rounded-lg hover:bg-yellow-300 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <p className="text-gray-400">No assessment report found</p>
      </div>
    );
  }

  const score = report.report.score || report.report.overallScore || 0;

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <div className="border-b border-gray-800 bg-gray-900/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse"></div>
            <h1 className="text-yellow-400 font-semibold">Assessment Report</h1>
            {report.createdAt && (
              <>
                <span className="text-gray-600">•</span>
                <span className="text-xs text-gray-500">
                  {new Date(report.createdAt).toLocaleDateString()}
                </span>
              </>
            )}
            <button
              onClick={() => navigate("/assessment/history")}
              className="ml-auto flex items-center gap-2 px-3 py-1 text-xs text-gray-400 
                       hover:text-yellow-400 transition-colors bg-gray-800 rounded-lg"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to History
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Title Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-2">
            {report.topic || report.title || "Interview Assessment"}
          </h2>
          <div className="flex items-center gap-3 text-sm text-gray-500">
            <span className="flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              {new Date(report.createdAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </span>
            {report.interviewDate && (
              <>
                <span className="text-gray-600">•</span>
                <span className="flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Interview Date: {new Date(report.interviewDate).toLocaleDateString()}
                </span>
              </>
            )}
            {report.duration && (
              <>
                <span className="text-gray-600">•</span>
                <span className="flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Duration: {report.duration}
                </span>
              </>
            )}
          </div>
        </div>

        {/* Overall Score Section */}
        <div className="mb-12 text-center">
          <div className="inline-block relative">
            <div className="relative w-40 h-40 mx-auto mb-4">
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  cx="80"
                  cy="80"
                  r="72"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="none"
                  className="text-gray-800"
                />
                <circle
                  cx="80"
                  cy="80"
                  r="72"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="none"
                  strokeDasharray={`${(score / 100) * 452} 452`}
                  strokeLinecap="round"
                  className={getScoreRingColor(score)}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center flex-col">
                <span className={`text-5xl font-bold ${getScoreColor(score)}`}>
                  {score}
                </span>
                <span className="text-xs text-gray-500">/100</span>
              </div>
            </div>
            <p className="text-gray-400 text-sm mt-2">Overall Score</p>
          </div>
        </div>

        {/* Detailed Scores */}
        {(report.report.communication || report.report.technicalKnowledge ||
          report.report.problemSolving || report.report.confidence || report.report.clarity) && (
            <div className="mb-12">
              <h3 className="text-lg font-semibold text-white mb-4">Detailed Scores</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {report.report.communication !== undefined && (
                  <ScoreDetail title="Communication" value={report.report.communication} />
                )}
                {report.report.technicalKnowledge !== undefined && (
                  <ScoreDetail title="Technical Knowledge" value={report.report.technicalKnowledge} />
                )}
                {report.report.problemSolving !== undefined && (
                  <ScoreDetail title="Problem Solving" value={report.report.problemSolving} />
                )}
                {report.report.confidence !== undefined && (
                  <ScoreDetail title="Confidence" value={report.report.confidence} />
                )}
                {report.report.clarity !== undefined && (
                  <ScoreDetail title="Clarity" value={report.report.clarity} />
                )}
              </div>
            </div>
          )}

        {/* Stats Row */}
        {(report.questionsAnswered || report.duration) && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-12">
            {report.questionsAnswered && (
              <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-yellow-400/10 rounded-lg">
                    <svg className="w-6 h-6 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Questions Answered</p>
                    <p className="text-2xl font-bold text-white">{report.questionsAnswered}</p>
                  </div>
                </div>
              </div>
            )}
            {report.duration && (
              <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-yellow-400/10 rounded-lg">
                    <svg className="w-6 h-6 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Interview Duration</p>
                    <p className="text-2xl font-bold text-white">{report.duration}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Strengths Section */}
        {report.report.strengths && report.report.strengths.length > 0 && (
          <div className="mb-8 bg-gray-800/30 border border-green-400/20 rounded-xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <h3 className="text-lg font-semibold text-white">Strengths</h3>
              <span className="text-xs text-gray-500 ml-auto">{report.report.strengths.length} items</span>
            </div>
            <ul className="space-y-2">
              {report.report.strengths.map((strength: string, i: number) => (
                <li key={i} className="flex items-start gap-2 text-gray-300 text-sm">
                  <span className="text-green-400 mt-1">✓</span>
                  <span className="flex-1 leading-relaxed">{strength}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Weaknesses Section */}
        {report.report.weaknesses && report.report.weaknesses.length > 0 && (
          <div className="mb-8 bg-gray-800/30 border border-orange-400/20 rounded-xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <svg className="w-5 h-5 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <h3 className="text-lg font-semibold text-white">Areas for Improvement</h3>
              <span className="text-xs text-gray-500 ml-auto">{report.report.weaknesses.length} items</span>
            </div>
            <ul className="space-y-2">
              {report.report.weaknesses.map((weakness: string, i: number) => (
                <li key={i} className="flex items-start gap-2 text-gray-300 text-sm">
                  <span className="text-orange-400 mt-1">⚠</span>
                  <span className="flex-1 leading-relaxed">{weakness}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Improvements Section */}
        {report.report.improvements && report.report.improvements.length > 0 && (
          <div className="mb-8 bg-gray-800/30 border border-blue-400/20 rounded-xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <h3 className="text-lg font-semibold text-white">Recommendations</h3>
              <span className="text-xs text-gray-500 ml-auto">{report.report.improvements.length} items</span>
            </div>
            <ul className="space-y-2">
              {report.report.improvements.map((improvement: string, i: number) => (
                <li key={i} className="flex items-start gap-2 text-gray-300 text-sm">
                  <span className="text-blue-400 mt-1">→</span>
                  <span className="flex-1 leading-relaxed">{improvement}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Summary Section */}
        {(report.report.summary || report.report.finalVerdict) && (
          <div className="mt-8 bg-linear-to-r from-yellow-400/10 to-transparent border border-yellow-400/30 rounded-xl p-6">
            <div className="flex items-start gap-3">
              <div className="shrink-0">
                <svg className="w-6 h-6 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-yellow-400 mb-2">
                  {report.report.finalVerdict ? "Final Verdict" : "Summary"}
                </h3>
                <p className="text-gray-300 leading-relaxed">
                  {report.report.finalVerdict || report.report.summary}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 mt-8 pt-4 border-t border-gray-800">
          <button
            onClick={() => window.print()}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-800 text-gray-300 
                     rounded-lg hover:bg-gray-700 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
            Download Report
          </button>
          <button
            onClick={() => navigate("/assessment/history")}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-yellow-400 text-gray-900 
                     rounded-lg hover:bg-yellow-300 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            View All Assessments
          </button>
        </div>
      </div>
    </div>
  );
}

// Score Detail Component
function ScoreDetail({ title, value }: { title: string; value: number }) {
  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-400";
    if (score >= 60) return "text-yellow-400";
    if (score >= 40) return "text-orange-400";
    return "text-red-400";
  };

  const getProgressColor = (score: number) => {
    if (score >= 80) return "bg-green-400";
    if (score >= 60) return "bg-yellow-400";
    if (score >= 40) return "bg-orange-400";
    return "bg-red-400";
  };

  return (
    <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-3">
      <p className="text-xs text-gray-400 mb-1">{title}</p>
      <p className={`text-xl font-bold ${getScoreColor(value)}`}>
        {value}
        <span className="text-xs text-gray-500">/100</span>
      </p>
      <div className="w-full bg-gray-700 rounded-full h-1 mt-2">
        <div
          className={`h-1 rounded-full ${getProgressColor(value)} transition-all duration-500`}
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}