"use client";

import { ServerCard } from "~/components/ServerCard";
import { api } from "~/trpc/react";

interface Server {
  id: number;
  instanceId: string | null;
  state: string;
  worldName: string;
  version: string;
  port: number;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

interface ServerListProps {
  initialServers: Server[];
}

export function ServerList({ initialServers }: ServerListProps) {
  const { data: servers, refetch } = api.server.getAll.useQuery(undefined, {
    initialData: initialServers,
    refetchOnMount: false,
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-2xl font-bold text-gray-100">
          Your Servers
        </h3>
        <div className="px-4 py-2 rounded-lg bg-[#2a3548] border border-[#4a90e2]/30">
          <span className="text-sm text-gray-400">
            Total: <span className="text-[#4a90e2] font-semibold">{servers?.length ?? 0}</span>
          </span>
        </div>
      </div>

      {servers && servers.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {servers.map((server) => (
            <ServerCard 
              key={server.id} 
              server={server} 
              onUpdate={() => refetch()}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 px-4 rounded-xl bg-[#1a2537] border border-[#2a3548]">
          <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-gradient-to-br from-[#4a90e2]/20 to-[#9b59b6]/20 flex items-center justify-center">
            <svg className="w-12 h-12 text-[#4a90e2]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <h4 className="text-xl font-semibold text-gray-300 mb-2">
            No Servers Yet
          </h4>
          <p className="text-gray-400 mb-6">
            Create your first Terraria server to get started!
          </p>
        </div>
      )}
    </div>
  );
}
