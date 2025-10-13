"use client";

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export function EmptyState({ 
  icon = (
    <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
    </svg>
  ), 
  title, 
  description, 
  action 
}: EmptyStateProps) {
  return (
    <div className="text-center py-16 px-4 rounded-xl bg-[#1a2537] border border-[#2a3548]">
      <div className="flex justify-center mb-4">{icon}</div>
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
      <div className="flex justify-center mb-4">
        <svg className="w-16 h-16 text-[#e74c3c]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
      </div>
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
