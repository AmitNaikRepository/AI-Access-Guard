import { useState, useCallback } from 'react';
import axios from 'axios';
import { useDropzone } from 'react-dropzone';
import PageMeta from '../components/common/PageMeta';
import { ChevronDownIcon, PaperPlaneIcon, BoltIcon, FileIcon, TrashBinIcon, CheckCircleIcon, FolderIcon } from '../icons';

interface QueryResponse {
  answer: string;
  sources: string[];
  cache_hit: boolean;
  response_time: number;
  tokens_used: number;
  cost: number;
  model_used: string;
  out_of_scope: boolean;
}

interface UploadProgress {
  stage: 'uploading' | 'extracting' | 'embedding' | 'storing' | 'complete';
  percent: number;
}

interface UploadedDocument {
  filename: string;
  chunks_count: number;
  upload_time: number;
}

const modelGroups = [
  {
    label: 'OpenAI',
    models: [
      { value: 'gpt-4', label: 'GPT-4', cost: '$0.03/1K tokens' },
      { value: 'gpt-3.5-turbo', label: 'GPT-3.5 Turbo', cost: '$0.0015/1K tokens' },
    ]
  },
  {
    label: 'Anthropic',
    models: [
      { value: 'claude-3-sonnet-20240229', label: 'Claude 3 Sonnet', cost: '$0.015/1K tokens' },
      { value: 'claude-3-haiku-20240307', label: 'Claude 3 Haiku', cost: '$0.00125/1K tokens' },
    ]
  },
  {
    label: 'Groq',
    models: [
      { value: 'llama-3.1-8b-instant', label: 'Llama 3.1 8B', cost: '$0.00005/1K tokens' },
      { value: 'llama-3.1-70b-versatile', label: 'Llama 3.1 70B', cost: '$0.00027/1K tokens' },
      { value: 'mixtral-8x7b-32768', label: 'Mixtral 8x7B', cost: '$0.00024/1K tokens' },
    ]
  },
];

export default function Chat() {
  const [query, setQuery] = useState('');
  const [selectedModel, setSelectedModel] = useState('llama-3.1-8b-instant');
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<QueryResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [expandedSources, setExpandedSources] = useState(false);

  // Upload states
  const [uploadExpanded, setUploadExpanded] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<UploadProgress | null>(null);
  const [uploadedDocs, setUploadedDocs] = useState<UploadedDocument[]>([]);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!query.trim()) {
      setError('Please enter a query');
      return;
    }

    setLoading(true);
    setError(null);
    setResponse(null);

    try {
      const result = await axios.post<QueryResponse>('http://localhost:8000/query', {
        query: query.trim(),
        model: selectedModel,
      });

      setResponse(result.data);
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.detail || 'Failed to process query');
      } else {
        setError('An unexpected error occurred');
      }
    } finally {
      setLoading(false);
    }
  };

  // Upload handler
  const handleUpload = async (file: File) => {
    setUploading(true);
    setUploadError(null);
    setUploadSuccess(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      // Simulate progress stages
      setUploadProgress({ stage: 'uploading', percent: 10 });

      setTimeout(() => setUploadProgress({ stage: 'uploading', percent: 25 }), 200);

      const result = await axios.post('http://localhost:8000/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const percent = Math.round((progressEvent.loaded * 25) / progressEvent.total);
            setUploadProgress({ stage: 'uploading', percent });
          }
        },
      });

      // Simulate processing stages
      setUploadProgress({ stage: 'extracting', percent: 35 });
      await new Promise(resolve => setTimeout(resolve, 300));

      setUploadProgress({ stage: 'extracting', percent: 50 });
      await new Promise(resolve => setTimeout(resolve, 300));

      setUploadProgress({ stage: 'embedding', percent: 65 });
      await new Promise(resolve => setTimeout(resolve, 400));

      setUploadProgress({ stage: 'storing', percent: 85 });
      await new Promise(resolve => setTimeout(resolve, 300));

      setUploadProgress({ stage: 'complete', percent: 100 });

      // Add to uploaded docs list
      setUploadedDocs(prev => [...prev, {
        filename: file.name,
        chunks_count: result.data.chunks_count,
        upload_time: Date.now(),
      }]);

      setUploadSuccess(`✅ Added to Knowledge Base: ${result.data.chunks_count} chunks indexed`);

      setTimeout(() => {
        setUploadProgress(null);
        setUploadSuccess(null);
      }, 3000);

    } catch (err) {
      if (axios.isAxiosError(err)) {
        setUploadError(err.response?.data?.detail || 'Failed to upload document');
      } else {
        setUploadError('An unexpected error occurred');
      }
      setUploadProgress(null);
    } finally {
      setUploading(false);
    }
  };

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      handleUpload(acceptedFiles[0]);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'] },
    maxSize: 100 * 1024 * 1024, // 100MB
    multiple: false,
    disabled: uploading,
  });

  const getProgressStageText = (stage: UploadProgress['stage']) => {
    switch (stage) {
      case 'uploading': return 'Uploading...';
      case 'extracting': return 'Extracting text...';
      case 'embedding': return 'Creating embeddings...';
      case 'storing': return 'Adding to Knowledge Base...';
      case 'complete': return 'Complete!';
    }
  };

  return (
    <>
      <PageMeta title="Chat | AI Document Assistant" />
      <div className="min-h-screen">
        {/* Hero Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            AI Document Chat
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Ask questions about your documents and get instant AI-powered answers
          </p>
        </div>

        {/* Knowledge Base Section */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 mb-6 overflow-hidden">
          <button
            onClick={() => setUploadExpanded(!uploadExpanded)}
            className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <FolderIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                📚 Knowledge Base
              </h2>
            </div>
            <ChevronDownIcon
              className={`w-5 h-5 text-gray-500 transition-transform ${uploadExpanded ? 'rotate-180' : ''}`}
            />
          </button>

          {uploadExpanded && (
            <div className="px-6 pb-6 border-t border-gray-200 dark:border-gray-700">
              {/* Dropzone */}
              <div
                {...getRootProps()}
                className={`mt-4 border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all ${
                  isDragActive
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : uploading
                    ? 'border-gray-300 bg-gray-50 dark:bg-gray-700/50 cursor-not-allowed'
                    : 'border-gray-300 dark:border-gray-600 hover:border-blue-400 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                }`}
              >
                <input {...getInputProps()} />
                <FileIcon className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                {isDragActive ? (
                  <p className="text-blue-600 dark:text-blue-400 font-medium">
                    Drop PDF here...
                  </p>
                ) : uploading ? (
                  <p className="text-gray-500 dark:text-gray-400">
                    Processing document...
                  </p>
                ) : (
                  <>
                    <p className="text-gray-700 dark:text-gray-300 font-medium mb-1">
                      Add to Knowledge Base
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Drag PDF here or click to browse
                    </p>
                  </>
                )}
              </div>

              {/* Progress Bar */}
              {uploadProgress && (
                <div className="mt-4 bg-gray-100 dark:bg-gray-700 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {getProgressStageText(uploadProgress.stage)}
                    </span>
                    <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                      {uploadProgress.percent}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-blue-500 to-indigo-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress.percent}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Success Message */}
              {uploadSuccess && (
                <div className="mt-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 flex items-center gap-3">
                  <CheckCircleIcon className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0" />
                  <p className="text-green-800 dark:text-green-200 text-sm font-medium">
                    {uploadSuccess}
                  </p>
                </div>
              )}

              {/* Error Message */}
              {uploadError && (
                <div className="mt-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                  <p className="text-red-800 dark:text-red-200 text-sm">{uploadError}</p>
                </div>
              )}

              {/* Knowledge Base Contents */}
              {uploadedDocs.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                    Knowledge Base Contents ({uploadedDocs.length})
                  </h3>
                  <div className="space-y-2">
                    {uploadedDocs.map((doc, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3 border border-gray-200 dark:border-gray-600"
                      >
                        <div className="flex items-center gap-3 flex-1">
                          <FileIcon className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                              {doc.filename}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {doc.chunks_count} chunks • {new Date(doc.upload_time).toLocaleTimeString()}
                            </p>
                          </div>
                        </div>
                        <button
                          className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                          title="Remove document"
                        >
                          <TrashBinIcon className="w-4 h-4 text-red-600 dark:text-red-400" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Query Card */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-900 rounded-xl p-8 shadow-lg mb-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Model Selector */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Select AI Model
              </label>
              <div className="relative">
                <select
                  value={selectedModel}
                  onChange={(e) => setSelectedModel(e.target.value)}
                  className="w-full appearance-none bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg px-4 py-3 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 text-gray-900 dark:text-white transition-all"
                >
                  {modelGroups.map((group) => (
                    <optgroup key={group.label} label={group.label}>
                      {group.models.map((model) => (
                        <option key={model.value} value={model.value}>
                          {model.label} ({model.cost})
                        </option>
                      ))}
                    </optgroup>
                  ))}
                </select>
                <ChevronDownIcon className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
              </div>
            </div>

            {/* Query Textarea */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Your Question
              </label>
              <textarea
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Ask about your documents..."
                rows={5}
                className="w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 resize-none transition-all"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || !query.trim()}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold py-3 px-6 rounded-lg transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-xl disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <PaperPlaneIcon className="w-5 h-5" />
                  Ask Question
                </>
              )}
            </button>
          </form>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
            <p className="text-red-800 dark:text-red-200 text-sm">{error}</p>
          </div>
        )}

        {/* Response Section */}
        {response && (
          <div className="space-y-6">
            {/* Status Badge */}
            <div className="flex items-center gap-3 flex-wrap">
              {response.cache_hit ? (
                <span className="inline-flex items-center gap-2 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 px-4 py-2 rounded-full text-sm font-medium">
                  <BoltIcon className="w-4 h-4" />
                  ⚡ From Cache (${response.cost.toFixed(6)})
                </span>
              ) : (
                <span className="inline-flex items-center gap-2 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 px-4 py-2 rounded-full text-sm font-medium">
                  🔄 Fresh API Call (${response.cost.toFixed(6)})
                </span>
              )}
              {/* Knowledge Source Badge */}
              {response.out_of_scope ? (
                <span className="inline-flex items-center gap-2 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 px-4 py-2 rounded-full text-sm font-medium">
                  ⚠️ General Knowledge
                </span>
              ) : (
                <span className="inline-flex items-center gap-2 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 px-4 py-2 rounded-full text-sm font-medium">
                  ✅ From Knowledge Base
                </span>
              )}
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Response time: {response.response_time < 0.001 ? '~0' : (response.response_time * 1000).toFixed(0)}ms
              </span>
              {response.tokens_used > 0 && (
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Tokens: {response.tokens_used}
                </span>
              )}
            </div>

            {/* Answer Card */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Answer
              </h3>
              <div className="prose prose-sm dark:prose-invert max-w-none">
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
                  {response.answer}
                </p>
              </div>
            </div>

            {/* Sources Accordion */}
            {response.sources && response.sources.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                <button
                  onClick={() => setExpandedSources(!expandedSources)}
                  className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                >
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Sources ({response.sources.length})
                  </h3>
                  <ChevronDownIcon
                    className={`w-5 h-5 text-gray-500 transition-transform ${expandedSources ? 'rotate-180' : ''}`}
                  />
                </button>

                {expandedSources && (
                  <div className="px-6 pb-4 space-y-3 border-t border-gray-200 dark:border-gray-700 pt-4">
                    {response.sources.map((source, index) => (
                      <div
                        key={index}
                        className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 border border-gray-200 dark:border-gray-600"
                      >
                        <div className="flex items-start gap-3">
                          <span className="flex-shrink-0 w-6 h-6 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center text-xs font-semibold">
                            {index + 1}
                          </span>
                          <p className="text-sm text-gray-700 dark:text-gray-300 flex-1">
                            {source}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}
