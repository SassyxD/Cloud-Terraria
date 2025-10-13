"use client";

export function LoadingSpinner({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const sizeClasses = {
    sm: "w-4 h-4 border-2",
    md: "w-8 h-8 border-3",
    lg: "w-12 h-12 border-4",
  };

  return (
    <div className="flex items-center justify-center">
      <div
        className={`${sizeClasses[size]} border-white/30 border-t-white rounded-full animate-spin`}
      />
    </div>
  );
}

export function LoadingCard() {
  return (
    <div className="rounded-xl bg-[#1a2537] border border-[#2a3548] p-6 animate-pulse">
      <div className="space-y-4">
        <div className="flex items-start justify-between">
          <div className="flex-1 space-y-2">
            <div className="h-6 bg-[#2a3548] rounded w-3/4" />
            <div className="h-4 bg-[#2a3548] rounded w-1/2" />
          </div>
          <div className="h-6 w-20 bg-[#2a3548] rounded-full" />
        </div>
        <div className="space-y-2 pt-2 border-t border-[#2a3548]">
          <div className="h-4 bg-[#2a3548] rounded" />
          <div className="h-4 bg-[#2a3548] rounded" />
        </div>
      </div>
    </div>
  );
}

export function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a1628]">
      <div className="text-center space-y-6">
        <div className="relative">
          <div className="w-20 h-20 border-4 border-[#4a90e2]/30 border-t-[#4a90e2] rounded-full animate-spin mx-auto" />
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-3xl">🌍</span>
          </div>
        </div>
        <div className="space-y-2">
          <h3 className="text-xl font-bold bg-gradient-to-r from-[#4a90e2] to-[#9b59b6] bg-clip-text text-transparent">
            Loading...
          </h3>
          <p className="text-sm text-gray-400">Preparing your adventure</p>
        </div>
      </div>
    </div>
  );
}
