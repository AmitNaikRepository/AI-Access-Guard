import { useAuth } from '../context/AuthContext';

interface SecuritySidebarProps {
  isConnected: boolean;
  piiDetections: number;
  piiItemsMasked: number;
}

export default function SecuritySidebar({
  isConnected,
  piiDetections,
  piiItemsMasked,
}: SecuritySidebarProps) {
  const { user } = useAuth();

  const securityLayers = [
    {
      id: 'role-based',
      icon: '🔐',
      title: 'Role-Based Access',
      status: user ? 'active' : 'inactive',
      description: `Access level: ${user?.role || 'None'}`,
      badge: user?.role?.charAt(0).toUpperCase() + user?.role?.slice(1) || 'N/A',
      color: 'blue',
    },
    {
      id: 'pii-firewall',
      icon: '🛡️',
      title: 'PII Firewall',
      status: 'active',
      description: `${piiItemsMasked} items protected`,
      badge: piiDetections > 0 ? `${piiDetections} detected` : 'Monitoring',
      color: 'purple',
    },
    {
      id: 'content-guardrails',
      icon: '⚙️',
      title: 'Content Guardrails',
      status: 'active',
      description: 'NeMo policy enforcement',
      badge: 'Active',
      color: 'green',
    },
    {
      id: 'llama-guard',
      icon: '🦙',
      title: 'Llama Guard',
      status: isConnected ? 'active' : 'standby',
      description: 'AI safety filtering',
      badge: isConnected ? 'Enabled' : 'Standby',
      color: 'pink',
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'text-green-600 dark:text-green-400';
      case 'standby':
        return 'text-yellow-600 dark:text-yellow-400';
      default:
        return 'text-gray-600 dark:text-gray-400';
    }
  };

  const getBadgeColor = (color: string) => {
    switch (color) {
      case 'blue':
        return 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300';
      case 'purple':
        return 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300';
      case 'green':
        return 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300';
      case 'pink':
        return 'bg-pink-100 dark:bg-pink-900/30 text-pink-800 dark:text-pink-300';
      default:
        return 'bg-gray-100 dark:bg-gray-900/30 text-gray-800 dark:text-gray-300';
    }
  };

  return (
    <div className="h-full bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 overflow-y-auto">
      <div className="p-6">
        {/* Header */}
        <div className="mb-6">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
            <span className="text-2xl">🛡️</span>
            Active Security Layers
          </h2>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Multi-layered protection for every message
          </p>
        </div>

        {/* Security Layers */}
        <div className="space-y-4">
          {securityLayers.map((layer) => (
            <div
              key={layer.id}
              className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4 border border-gray-200 dark:border-gray-700"
            >
              {/* Layer Header */}
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{layer.icon}</span>
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                      {layer.title}
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {layer.description}
                    </p>
                  </div>
                </div>
                <span className={`flex items-center gap-1 ${getStatusColor(layer.status)}`}>
                  <span className="w-2 h-2 rounded-full bg-current animate-pulse"></span>
                </span>
              </div>

              {/* Badge */}
              <div className="mt-3">
                <span
                  className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getBadgeColor(
                    layer.color
                  )}`}
                >
                  {layer.badge}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Statistics */}
        <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
            Session Stats
          </h3>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-600 dark:text-gray-400">PII Detections</span>
              <span className="text-sm font-bold text-purple-600 dark:text-purple-400">
                {piiDetections}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-600 dark:text-gray-400">Items Masked</span>
              <span className="text-sm font-bold text-purple-600 dark:text-purple-400">
                {piiItemsMasked}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-600 dark:text-gray-400">Connection</span>
              <span
                className={`text-sm font-bold ${
                  isConnected
                    ? 'text-green-600 dark:text-green-400'
                    : 'text-red-600 dark:text-red-400'
                }`}
              >
                {isConnected ? 'Active' : 'Disconnected'}
              </span>
            </div>
          </div>
        </div>

        {/* Info Box */}
        <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <div className="flex items-start gap-2">
            <span className="text-blue-600 dark:text-blue-400 text-lg">ℹ️</span>
            <div>
              <h4 className="text-xs font-semibold text-blue-900 dark:text-blue-300 mb-1">
                How It Works
              </h4>
              <p className="text-xs text-blue-700 dark:text-blue-400 leading-relaxed">
                Every message passes through 4 security layers before reaching the AI, ensuring
                safe and compliant interactions.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
