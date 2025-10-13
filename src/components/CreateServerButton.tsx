"use client";

import { useState } from "react";
import { api } from "~/trpc/react";

export function CreateServerButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [worldName, setWorldName] = useState("MyWorld");
  const [version, setVersion] = useState("latest");
  const [port, setPort] = useState(7777);

  const utils = api.useUtils();
  const createServer = api.server.create.useMutation({
    onSuccess: async () => {
      await utils.server.invalidate();
      setIsOpen(false);
      setWorldName("MyWorld");
      setVersion("latest");
      setPort(7777);
    },
  });

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="group relative px-8 py-4 rounded-xl bg-gradient-to-r from-[#5fd35f] to-[#4a90e2] hover:from-[#6fe46f] hover:to-[#5fa3e8] transition-all font-bold text-lg shadow-lg terraria-glow-green overflow-hidden"
      >
        <span className="relative z-10 flex items-center gap-2">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          Create New Server
        </span>
        <div className="absolute inset-0 shimmer opacity-50" />
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-md rounded-2xl bg-[#1a2537] border-2 border-[#4a90e2] shadow-2xl terraria-glow animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#2a3548]">
          <h3 className="text-2xl font-bold bg-gradient-to-r from-[#5fd35f] to-[#4a90e2] bg-clip-text text-transparent">
            Create Terraria Server
          </h3>
          <button
            onClick={() => setIsOpen(false)}
            className="text-gray-400 hover:text-white transition-colors text-2xl leading-none"
          >
            ×
          </button>
        </div>

        {/* Form */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            createServer.mutate({ worldName, version, port });
          }}
          className="p-6 space-y-6"
        >
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-300">
              World Name
            </label>
            <input
              type="text"
              value={worldName}
              onChange={(e) => setWorldName(e.target.value)}
              className="w-full px-4 py-3 rounded-lg bg-[#2a3548] border border-[#4a90e2]/30 focus:border-[#4a90e2] focus:outline-none focus:ring-2 focus:ring-[#4a90e2]/50 text-white placeholder-gray-500 transition-all"
              placeholder="Enter world name"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-300">
              Terraria Version
            </label>
            <select
              value={version}
              onChange={(e) => setVersion(e.target.value)}
              className="w-full px-4 py-3 rounded-lg bg-[#2a3548] border border-[#4a90e2]/30 focus:border-[#4a90e2] focus:outline-none focus:ring-2 focus:ring-[#4a90e2]/50 text-white transition-all"
            >
              <option value="latest">Latest</option>
              <option value="1.4.4">1.4.4</option>
              <option value="1.4.3">1.4.3</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-300">
              Port
            </label>
            <input
              type="number"
              value={port}
              onChange={(e) => setPort(parseInt(e.target.value))}
              className="w-full px-4 py-3 rounded-lg bg-[#2a3548] border border-[#4a90e2]/30 focus:border-[#4a90e2] focus:outline-none focus:ring-2 focus:ring-[#4a90e2]/50 text-white placeholder-gray-500 transition-all"
              min="1024"
              max="65535"
              required
            />
          </div>

          {createServer.error && (
            <div className="p-4 rounded-lg bg-[#e74c3c]/10 border border-[#e74c3c]/30">
              <p className="text-sm text-[#e74c3c]">
                Error: {createServer.error.message}
              </p>
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              disabled={createServer.isPending}
              className="flex-1 px-6 py-3 rounded-lg bg-[#2a3548] hover:bg-[#3a4558] transition-colors font-medium border border-[#4a90e2]/30 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createServer.isPending}
              className="flex-1 px-6 py-3 rounded-lg bg-gradient-to-r from-[#5fd35f] to-[#4a90e2] hover:from-[#6fe46f] hover:to-[#5fa3e8] transition-all font-bold shadow-lg terraria-glow-green disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {createServer.isPending ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Creating...
                </span>
              ) : (
                "Create Server"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
