"use client";

interface EmptyStateProps {
  icon?: string;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export function EmptyState({ icon = "📦", title, description, action }: EmptyStateProps) {
  return (
    <div className="text-center py-16 px-4 rounded-xl bg-[#1a2537] border border-[#2a3548]">
      <div className="text-6xl mb-4 animate-bounce">{icon}</div>
      <h4 className="text-xl font-semibold text-gray-300 mb-2">{title}</h4>
      <p className="text-gray-400 mb-6 max-w-md mx-auto">{description}</p>
      {action && (
        <button
          onClick={action.onClick}
          className="px-6 py-3 rounded-lg bg-gradient-to-r from-[#4a90e2] to-[#9b59b6] hover:from-[#5fa3e8] hover:to-[#a569c2] transition-all font-medium shadow-lg terraria-glow"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}

export function ErrorState({ error, retry }: { error: string; retry?: () => void }) {
  return (
    <div className="text-center py-16 px-4 rounded-xl bg-[#e74c3c]/10 border border-[#e74c3c]/30">
      <div className="text-6xl mb-4">⚠️</div>
      <h4 className="text-xl font-semibold text-[#e74c3c] mb-2">Something went wrong</h4>
      <p className="text-gray-400 mb-6 max-w-md mx-auto">{error}</p>
      {retry && (
        <button
          onClick={retry}
          className="px-6 py-3 rounded-lg bg-[#2a3548] hover:bg-[#3a4558] transition-colors font-medium border border-[#e74c3c]/30"
        >
          Try Again
        </button>
      )}
    </div>
  );
}
