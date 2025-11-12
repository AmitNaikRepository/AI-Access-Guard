import { Link } from "react-router";
import PageMeta from "../../components/common/PageMeta";
import { ChatIcon, PieChartIcon, BoltIcon, DollarLineIcon, GridIcon } from "../../icons";

export default function Home() {
  return (
    <>
      <PageMeta
        title="Enterprise LLM Knowledge Engine | Blazingly Fast with Semantic Caching"
        description="Production-grade RAG system with semantic caching - 80% cost reduction, 400x faster responses"
      />
      <div className="min-h-screen">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 px-4 py-2 rounded-full text-sm font-medium mb-6">
            <BoltIcon className="w-4 h-4" />
            Powered by Groq & Semantic Caching
          </div>

          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 dark:text-white mb-4 leading-tight">
            Enterprise LLM
            <span className="block bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Knowledge Engine
            </span>
          </h1>

          <p className="text-2xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
            Blazingly Fast with Semantic Caching
          </p>

          <p className="text-lg text-gray-600 dark:text-gray-400 mb-8 max-w-3xl mx-auto">
            Save up to 90% on API costs with semantic caching. Get instant answers from your Knowledge Base
            with lightning-fast cached responses.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Link
              to="/chat"
              className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold px-8 py-4 rounded-lg transition-all shadow-lg hover:shadow-xl"
            >
              <ChatIcon className="w-5 h-5" />
              Start Chatting
            </Link>
            <Link
              to="/metrics"
              className="inline-flex items-center justify-center gap-2 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-900 dark:text-white font-semibold px-8 py-4 rounded-lg transition-all shadow-lg hover:shadow-xl border border-gray-200 dark:border-gray-700"
            >
              <PieChartIcon className="w-5 h-5" />
              View Metrics
            </Link>
          </div>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Fast Responses */}
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-gray-800 dark:to-gray-900 rounded-xl p-8 border border-green-100 dark:border-gray-700 shadow-lg hover:shadow-xl transition-all">
            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center mb-4">
              <BoltIcon className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
              Fast Responses
            </h3>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              Semantic caching provides instant answers to similar queries. Get ~0ms response times
              for cached results with no API calls.
            </p>
            <div className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-green-600 dark:text-green-400">
              ⚡ Lightning Fast
            </div>
          </div>

          {/* Cost Savings */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-900 rounded-xl p-8 border border-blue-100 dark:border-gray-700 shadow-lg hover:shadow-xl transition-all">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center mb-4">
              <DollarLineIcon className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
              Cost Savings
            </h3>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              Dramatically reduce AI API costs by caching responses. Track every penny saved with
              detailed cost analytics and ROI metrics.
            </p>
            <div className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-blue-600 dark:text-blue-400">
              💰 Save Up to 90%
            </div>
          </div>

          {/* Multiple AI Models */}
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-gray-800 dark:to-gray-900 rounded-xl p-8 border border-purple-100 dark:border-gray-700 shadow-lg hover:shadow-xl transition-all">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center mb-4">
              <GridIcon className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
              Multiple AI Models
            </h3>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              Choose between Llama 3.1 (8B/70B) and Mixtral models. Balance speed, capability,
              and cost based on your needs.
            </p>
            <div className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-purple-600 dark:text-purple-400">
              🎯 Flexible & Powerful
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div className="mt-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl p-8 text-white">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-2">How It Works</h2>
            <p className="text-blue-100">Simple, efficient, and cost-effective</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-4xl font-bold mb-2">1.</div>
              <h3 className="text-xl font-semibold mb-2">Build Knowledge Base</h3>
              <p className="text-blue-100">Upload PDF documents to create your enterprise knowledge base</p>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold mb-2">2.</div>
              <h3 className="text-xl font-semibold mb-2">Ask Questions</h3>
              <p className="text-blue-100">Query your Knowledge Base using natural language</p>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold mb-2">3.</div>
              <h3 className="text-xl font-semibold mb-2">Save Money</h3>
              <p className="text-blue-100">Benefit from instant cached responses and reduced costs</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
