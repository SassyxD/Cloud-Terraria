import { Suspense } from "react";
import { signOut, auth } from "~/server/auth/index";
import { redirect } from "next/navigation";

async function SignOutForm() {
  const session = await auth();

  // Redirect if not logged in
  if (!session?.user) {
    redirect("/");
  }

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      {/* Animated background stars */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(50)].map((_, i) => (
          <div
            key={i}
            className="star absolute w-1 h-1 bg-white rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 w-full max-w-md mx-auto p-8">
        <div className="bg-[#1a2537] rounded-2xl border border-[#e74c3c]/30 shadow-2xl p-8 text-center">
          {/* User Avatar */}
          <div className="flex justify-center mb-6">
            {session.user.image ? (
              <img
                src={session.user.image}
                alt={session.user.name ?? "User"}
                className="w-16 h-16 rounded-full border-4 border-[#e74c3c]/30"
              />
            ) : (
              <div className="w-16 h-16 bg-gradient-to-br from-[#e74c3c]/20 to-[#e74c3c]/40 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-[#e74c3c]" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/>
                </svg>
              </div>
            )}
          </div>

          {/* Title */}
          <h1 className="text-2xl font-bold text-white mb-2">
            Sign Out
          </h1>
          <p className="text-gray-400 mb-2">
            Hey {session.user.name}!
          </p>
          <p className="text-gray-400 mb-8">
            Are you sure you want to sign out?
          </p>

          {/* Actions */}
          <div className="space-y-3">
            <form
              action={async () => {
                "use server";
                await signOut({ redirectTo: "/" });
              }}
            >
              <button
                type="submit"
                className="w-full px-6 py-3 rounded-xl bg-[#e74c3c] hover:bg-[#c0392b] transition-all font-semibold text-white shadow-lg"
              >
                Yes, Sign Out
              </button>
            </form>
            
            <a
              href="/"
              className="block w-full px-6 py-3 rounded-xl bg-[#2a3548] hover:bg-[#3a4558] transition-all font-semibold text-white border border-[#4a90e2]/30 text-center"
            >
              Cancel
            </a>
          </div>

          {/* Footer */}
          <p className="text-xs text-gray-500 mt-6">
            You can always sign back in anytime
          </p>
        </div>
      </div>
    </div>
  );
}

export default function SignOutPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#e74c3c]"></div>
      </div>
    }>
      <SignOutForm />
    </Suspense>
  );
}