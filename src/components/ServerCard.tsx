"use client";

interface ServerCardProps {
  server: {
    id: number;
    instanceId: string | null;
    state: string;
    worldName: string;
    version: string;
    port: number;
    createdAt: Date;
    updatedAt: Date;
  };
}

export function ServerCard({ server }: ServerCardProps) {
  const getStateColor = (state: string) => {
    switch (state.toUpperCase()) {
      case "RUNNING":
        return "bg-[#5fd35f] text-[#0a1628]";
      case "PENDING":
        return "bg-[#f4c430] text-[#0a1628]";
      case "STOPPED":
        return "bg-gray-500 text-white";
      case "ERROR":
        return "bg-[#e74c3c] text-white";
      default:
        return "bg-gray-600 text-white";
    }
  };

  const getStateIcon = (state: string) => {
    switch (state.toUpperCase()) {
      case "RUNNING":
        return "🟢";
      case "PENDING":
        return "🟡";
      case "STOPPED":
        return "⚫";
      case "ERROR":
        return "🔴";
      default:
        return "⚪";
    }
  };

  return (
    <div className="group relative rounded-xl bg-[#1a2537] border border-[#2a3548] hover:border-[#4a90e2] transition-all overflow-hidden">
      {/* Hover gradient effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#4a90e2]/0 to-[#9b59b6]/0 group-hover:from-[#4a90e2]/5 group-hover:to-[#9b59b6]/5 transition-all duration-300" />
      
      <div className="relative p-6 space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h4 className="text-xl font-bold text-white mb-1 flex items-center gap-2">
              🌍 {server.worldName}
            </h4>
            <p className="text-sm text-gray-400">
              Version {server.version}
            </p>
          </div>
          <div className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 ${getStateColor(server.state)}`}>
            <span>{getStateIcon(server.state)}</span>
            {server.state}
          </div>
        </div>

        {/* Server Info */}
        <div className="space-y-2 pt-2 border-t border-[#2a3548]">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-400">Port:</span>
            <span className="text-white font-mono bg-[#2a3548] px-2 py-1 rounded">
              {server.port}
            </span>
          </div>
          
          {server.instanceId && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-400">Instance ID:</span>
              <span className="text-white font-mono text-xs bg-[#2a3548] px-2 py-1 rounded truncate max-w-[150px]">
                {server.instanceId}
              </span>
            </div>
          )}

          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-400">Created:</span>
            <span className="text-white text-xs">
              {new Date(server.createdAt).toLocaleDateString()}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-2">
          <button
            className="flex-1 px-4 py-2 rounded-lg bg-[#2a3548] hover:bg-[#3a4558] transition-colors text-sm font-medium border border-[#4a90e2]/30 disabled:opacity-50"
            disabled={server.state !== "RUNNING"}
          >
            Connect
          </button>
          <button
            className="px-4 py-2 rounded-lg bg-[#2a3548] hover:bg-[#e74c3c]/20 hover:border-[#e74c3c] transition-colors text-sm font-medium border border-[#4a90e2]/30"
          >
            ⚙️
          </button>
        </div>
      </div>

      {/* Bottom accent line */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-[#4a90e2] via-[#9b59b6] to-[#f4c430] opacity-0 group-hover:opacity-100 transition-opacity" />
    </div>
  );
}
