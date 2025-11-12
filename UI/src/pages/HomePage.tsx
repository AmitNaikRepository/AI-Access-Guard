import { Link } from 'react-router';
import { useAuth } from '../context/AuthContext';
import PageMeta from '../components/common/PageMeta';

export default function HomePage() {
  const { isAuthenticated } = useAuth();

  return (
    <>
      <PageMeta
        title="RoleQuest - AI Access Guard with Role-Based Security"
        description="Secure role-based AI access control system with real-time guardrails powered by Llama Guard and NeMo Guardrails"
      />

      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        {/* Navbar */}
        <nav className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              {/* Logo */}
              <div className="flex items-center">
                <Link to="/" className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-xl">RQ</span>
                  </div>
                  <span className="text-xl font-bold text-gray-900 dark:text-white">
                    RoleQuest
                  </span>
                </Link>
              </div>

              {/* Nav Links */}
              <div className="hidden md:flex items-center space-x-8">
                <Link
                  to="/"
                  className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium transition-colors"
                >
                  Home
                </Link>
                <Link
                  to="/chat"
                  className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium transition-colors"
                >
                  Chat
                </Link>
                <a
                  href="#features"
                  className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium transition-colors"
                >
                  Features
                </a>
                <a
                  href="#metrics"
                  className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium transition-colors"
                >
                  Metrics
                </a>
              </div>

              {/* Auth Button */}
              <div>
                {isAuthenticated ? (
                  <Link
                    to="/chat"
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                  >
                    Go to Chat
                  </Link>
                ) : (
                  <Link
                    to="/signin"
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                  >
                    Sign In
                  </Link>
                )}
              </div>
            </div>
          </div>
        </nav>

        {/* Hero Section */}
        <section className="relative overflow-hidden">
          {/* Background Decoration */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
            <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
          </div>

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-24">
            <div className="text-center">
              {/* Badge */}
              <div className="inline-flex items-center px-4 py-2 bg-blue-100 dark:bg-blue-900/30 rounded-full mb-8">
                <span className="w-2 h-2 bg-blue-500 rounded-full mr-2 animate-pulse"></span>
                <span className="text-sm font-medium text-blue-800 dark:text-blue-300">
                  Powered by Llama Guard 3 & NeMo Guardrails
                </span>
              </div>

              {/* Title */}
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold text-gray-900 dark:text-white mb-6">
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
                  RoleQuest
                </span>
              </h1>

              {/* Subtitle */}
              <p className="text-xl sm:text-2xl text-gray-600 dark:text-gray-300 mb-4 max-w-3xl mx-auto">
                Secure Role-Based AI Access with Real-Time Guardrails
              </p>
              <p className="text-lg text-gray-500 dark:text-gray-400 mb-12 max-w-2xl mx-auto">
                Enterprise-grade AI safety system that enforces role-based permissions and content
                filtering through multiple security layers before every LLM interaction.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Link
                  to={isAuthenticated ? '/chat' : '/signin'}
                  className="px-8 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all transform hover:scale-105 font-semibold text-lg shadow-lg hover:shadow-xl"
                >
                  Start Chat →
                </Link>
                <a
                  href="#features"
                  className="px-8 py-4 bg-white dark:bg-gray-800 text-gray-900 dark:text-white border-2 border-gray-300 dark:border-gray-600 rounded-lg hover:border-blue-500 dark:hover:border-blue-500 transition-all font-semibold text-lg"
                >
                  Learn More
                </a>
              </div>

              {/* Stats */}
              <div className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-3xl mx-auto">
                <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg">
                  <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                    3
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Security Layers
                  </div>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg">
                  <div className="text-3xl font-bold text-purple-600 dark:text-purple-400 mb-2">
                    14+
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Safety Categories
                  </div>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg">
                  <div className="text-3xl font-bold text-pink-600 dark:text-pink-400 mb-2">
                    100%
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Open Source
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-20 bg-white dark:bg-gray-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                Powerful Security Features
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                Multi-layered protection ensures every AI interaction is safe, compliant, and
                role-appropriate
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Feature 1 */}
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-gray-900 dark:to-gray-700 rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow">
                <div className="w-14 h-14 bg-blue-600 rounded-xl flex items-center justify-center mb-6">
                  <svg
                    className="w-8 h-8 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                  Role-Based Control
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Each user gets access only to what they're authorized for. Employees, Managers,
                  and Founders see different data based on their role.
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <span className="px-3 py-1 bg-blue-200 dark:bg-blue-900/50 text-blue-800 dark:text-blue-300 text-xs rounded-full">
                    JWT Auth
                  </span>
                  <span className="px-3 py-1 bg-blue-200 dark:bg-blue-900/50 text-blue-800 dark:text-blue-300 text-xs rounded-full">
                    3 Role Levels
                  </span>
                </div>
              </div>

              {/* Feature 2 */}
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-gray-900 dark:to-gray-700 rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow">
                <div className="w-14 h-14 bg-purple-600 rounded-xl flex items-center justify-center mb-6">
                  <svg
                    className="w-8 h-8 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                  Llama Guard Integration
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Real-time AI safety filtering powered by Meta's Llama Guard 3. Detects violence,
                  hate speech, jailbreaks, and 11+ other harmful categories.
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <span className="px-3 py-1 bg-purple-200 dark:bg-purple-900/50 text-purple-800 dark:text-purple-300 text-xs rounded-full">
                    14+ Categories
                  </span>
                  <span className="px-3 py-1 bg-purple-200 dark:bg-purple-900/50 text-purple-800 dark:text-purple-300 text-xs rounded-full">
                    Real-time
                  </span>
                </div>
              </div>

              {/* Feature 3 */}
              <div className="bg-gradient-to-br from-pink-50 to-pink-100 dark:from-gray-900 dark:to-gray-700 rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow">
                <div className="w-14 h-14 bg-pink-600 rounded-xl flex items-center justify-center mb-6">
                  <svg
                    className="w-8 h-8 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 10V3L4 14h7v7l9-11h-7z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                  Live Chat System
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Secure, blazingly fast WebSocket communication powered by Groq API. Real-time
                  responses with sub-second latency.
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <span className="px-3 py-1 bg-pink-200 dark:bg-pink-900/50 text-pink-800 dark:text-pink-300 text-xs rounded-full">
                    WebSocket
                  </span>
                  <span className="px-3 py-1 bg-pink-200 dark:bg-pink-900/50 text-pink-800 dark:text-pink-300 text-xs rounded-full">
                    Groq AI
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Metrics Summary Section */}
        <section id="metrics" className="py-20 bg-gray-50 dark:bg-gray-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                System Performance
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-400">
                Real-time metrics and monitoring
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Metric 1 */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                    <svg
                      className="w-6 h-6 text-green-600 dark:text-green-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                      />
                    </svg>
                  </div>
                  <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400 text-xs font-medium rounded-full">
                    +12% today
                  </span>
                </div>
                <div className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
                  1,247
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Active Users</div>
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="text-xs text-gray-500 dark:text-gray-500">
                    Last updated: Just now
                  </div>
                </div>
              </div>

              {/* Metric 2 */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center">
                    <svg
                      className="w-6 h-6 text-red-600 dark:text-red-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"
                      />
                    </svg>
                  </div>
                  <span className="px-3 py-1 bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400 text-xs font-medium rounded-full">
                    8% blocked
                  </span>
                </div>
                <div className="text-4xl font-bold text-gray-900 dark:text-white mb-2">342</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Blocked Messages</div>
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="text-xs text-gray-500 dark:text-gray-500">
                    Last 24 hours
                  </div>
                </div>
              </div>

              {/* Metric 3 */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                    <svg
                      className="w-6 h-6 text-blue-600 dark:text-blue-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400 text-xs font-medium rounded-full">
                    99.9% uptime
                  </span>
                </div>
                <div className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
                  24d 7h
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">System Uptime</div>
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="text-xs text-gray-500 dark:text-gray-500">
                    Since last restart
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-20 bg-white dark:bg-gray-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                How It Works
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-400">
                Three layers of security protect every interaction
              </p>
            </div>

            <div className="max-w-3xl mx-auto">
              {/* Step 1 */}
              <div className="flex items-start mb-12">
                <div className="flex-shrink-0 w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-lg">
                  1
                </div>
                <div className="ml-6">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                    JWT Authentication
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    User identity verified with secure JWT tokens. Role-based permissions loaded
                    for personalized access control.
                  </p>
                </div>
              </div>

              {/* Step 2 */}
              <div className="flex items-start mb-12">
                <div className="flex-shrink-0 w-12 h-12 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold text-lg">
                  2
                </div>
                <div className="ml-6">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                    Content Safety Check
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Llama Guard 3 scans every message for harmful content including violence, hate
                    speech, and jailbreak attempts. Unsafe content is blocked immediately.
                  </p>
                </div>
              </div>

              {/* Step 3 */}
              <div className="flex items-start">
                <div className="flex-shrink-0 w-12 h-12 bg-pink-600 text-white rounded-full flex items-center justify-center font-bold text-lg">
                  3
                </div>
                <div className="ml-6">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                    Policy Enforcement & AI Response
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    NeMo Guardrails enforces company policies and role restrictions. Approved
                    queries reach the AI with proper context for accurate, safe responses.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-gray-900 dark:bg-black text-white py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="flex items-center space-x-3 mb-4 md:mb-0">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-xl">RQ</span>
                </div>
                <span className="text-xl font-bold">RoleQuest</span>
              </div>

              <div className="text-center md:text-left mb-4 md:mb-0">
                <p className="text-gray-400">
                  © 2025 RoleQuest - AI Access Guard. Built with ❤️ using FastAPI & React.
                </p>
              </div>

              <div className="flex space-x-6">
                <a
                  href="https://github.com"
                  className="text-gray-400 hover:text-white transition-colors"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path
                      fillRule="evenodd"
                      d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                      clipRule="evenodd"
                    />
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </footer>
      </div>

      <style>{`
        @keyframes blob {
          0% {
            transform: translate(0px, 0px) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
          100% {
            transform: translate(0px, 0px) scale(1);
          }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </>
  );
}
