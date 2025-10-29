"use client";

import { useState, useEffect } from "react";

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

interface ServerStatus {
  publicIp?: string;
  state?: string;
}

export function ServerCard({ server }: ServerCardProps) {
  const [serverStatus, setServerStatus] = useState<ServerStatus>({});
  const [copying, setCopying] = useState(false);

  useEffect(() => {
    if (server.instanceId && server.state === "RUNNING") {
      fetchServerStatus();
    }
  }, [server.instanceId, server.state]);

  const fetchServerStatus = async () => {
    try {
      const response = await fetch("/api/servers/status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ instanceId: server.instanceId }),
      });
      const data = await response.json();
      if (data.publicIp) {
        setServerStatus({ publicIp: data.publicIp, state: data.state });
      }
    } catch (error) {
      console.error("Failed to fetch server status:", error);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopying(true);
      setTimeout(() => setCopying(false), 2000);
    } catch (error) {
      console.error("Failed to copy:", error);
    }
  };

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
    const baseClasses = "w-3 h-3";
    switch (state.toUpperCase()) {
      case "RUNNING":
        return (
          <div className={`${baseClasses} rounded-full bg-[#5fd35f]`} />
        );
      case "PENDING":
        return (
          <div className={`${baseClasses} rounded-full bg-[#f4c430]`} />
        );
      case "STOPPED":
        return (
          <div className={`${baseClasses} rounded-full bg-gray-500`} />
        );
      case "ERROR":
        return (
          <div className={`${baseClasses} rounded-full bg-[#e74c3c]`} />
        );
      default:
        return (
          <div className={`${baseClasses} rounded-full bg-gray-600`} />
        );
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
              <svg className="w-5 h-5 text-[#4a90e2]" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
              </svg>
              {server.worldName}
            </h4>
            <p className="text-sm text-gray-400">
              Version {server.version}
            </p>
          </div>
          <div className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-2 ${getStateColor(server.state)}`}>
            {getStateIcon(server.state)}
            {server.state}
          </div>
        </div>

        {/* Server Info */}
        <div className="space-y-2 pt-2 border-t border-[#2a3548]">
          {serverStatus.publicIp && server.state === "RUNNING" && (
            <div className="mb-3 p-3 bg-[#2a3548] rounded-lg border border-[#4a90e2]/30">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-gray-400 uppercase tracking-wider">Connect to Server</span>
                <button
                  onClick={() => copyToClipboard(`${serverStatus.publicIp}:${server.port}`)}
                  className="text-xs text-[#4a90e2] hover:text-[#5fa3e3] transition-colors"
                >
                  {copying ? "Copied!" : "Copy"}
                </button>
              </div>
              <div className="flex items-center gap-2">
                <code className="flex-1 text-sm font-mono text-white bg-[#1a2537] px-3 py-2 rounded border border-[#3a4558]">
                  {serverStatus.publicIp}:{server.port}
                </code>
              </div>
              <p className="text-xs text-gray-400 mt-2">
                Use this IP address in Terraria multiplayer menu
              </p>
            </div>
          )}

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
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>
        </div>
      </div>

      {/* Bottom accent line */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-[#4a90e2] via-[#9b59b6] to-[#f4c430] opacity-0 group-hover:opacity-100 transition-opacity" />
    </div>
  );
}
