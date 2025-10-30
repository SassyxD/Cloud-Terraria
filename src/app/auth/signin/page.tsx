import { Suspense } from "react";
import { signIn, auth } from "~/server/auth/index";
import { redirect } from "next/navigation";

async function SignInForm() {
  const session = await auth();

  // Redirect if already logged in
  if (session?.user) {
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
        <div className="bg-[#1a2537] rounded-2xl border border-[#4a90e2]/30 shadow-2xl p-8 text-center">
          {/* Logo */}
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-[#4a90e2] to-[#9b59b6] rounded-2xl flex items-center justify-center">
              <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
              </svg>
            </div>
          </div>

          {/* Title */}
          <h1 className="text-3xl font-bold bg-gradient-to-r from-[#4a90e2] to-[#9b59b6] bg-clip-text text-transparent mb-2">
            Welcome to Cloud Terraria
          </h1>
          <p className="text-gray-400 mb-8">
            Sign in to manage your Terraria servers
          </p>

          {/* Sign In Buttons */}
          <div className="space-y-4">
            {/* Mock Credentials Sign In */}
            <form
              action={async (formData) => {
                "use server";
                const username = formData.get("username");
                await signIn("credentials", { 
                  username,
                  redirect: true,
                  redirectTo: process.env.NEXTAUTH_URL || "/"
                });
              }}
            >
              <div className="mb-4">
                <input
                  type="text"
                  name="username"
                  placeholder="Enter any username (e.g., demo)"
                  required
                  className="w-full px-4 py-3 rounded-lg bg-[#0f1621] border border-[#2a3548] text-white placeholder-gray-500 focus:outline-none focus:border-[#4a90e2] transition-colors"
                />
              </div>
              <button
                type="submit"
                className="w-full group relative px-6 py-4 rounded-xl bg-gradient-to-r from-[#4a90e2] to-[#9b59b6] hover:from-[#3a7fd5] hover:to-[#8b49a6] transition-all font-semibold text-white text-lg shadow-lg overflow-hidden"
              >
                <span className="relative z-10 flex items-center justify-center gap-3">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/>
                  </svg>
                  Sign In with Mock Account
                </span>
                
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity transform translate-x-[-200%] group-hover:translate-x-[200%] duration-1000" />
              </button>
            </form>

            {/* AWS Cognito Sign In (if configured) */}
            {process.env.AUTH_COGNITO_ID && (
              <>
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-[#2a3548]"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-[#1a2537] text-gray-400">or</span>
                  </div>
                </div>

                <form
                  action={async () => {
                    "use server";
                    await signIn("cognito", { 
                      redirect: true,
                      redirectTo: process.env.NEXTAUTH_URL || "/"
                    });
                  }}
                >
                  <button
                    type="submit"
                    className="w-full group relative px-6 py-4 rounded-xl bg-gradient-to-r from-[#ff9900] to-[#ff7700] hover:from-[#ff8800] hover:to-[#ff6600] transition-all font-semibold text-white text-lg shadow-lg overflow-hidden"
                  >
                    <span className="relative z-10 flex items-center justify-center gap-3">
                      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M13 2.05v2.02c3.95.49 7 3.85 7 7.93 0 4.08-3.05 7.44-7 7.93v2.02c5.05-.5 9-4.76 9-9.95 0-5.19-3.95-9.45-9-9.95zM12 19c-3.87 0-7-3.13-7-7s3.13-7 7-7c3.87 0 7 3.13 7 7s-3.13 7-7 7z"/>
                      </svg>
                      Continue with AWS Cognito
                    </span>
                    
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity transform translate-x-[-200%] group-hover:translate-x-[200%] duration-1000" />
                  </button>
                </form>
              </>
            )}
          </div>

          {/* Footer */}
          <p className="text-xs text-gray-500 mt-6">
            {process.env.AUTH_COGNITO_ID 
              ? "Choose your authentication method" 
              : "Development Mode - No real authentication required"}
          </p>
        </div>
      </div>
    </div>
  );
}

export default function SignInPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#4a90e2]"></div>
      </div>
    }>
      <SignInForm />
    </Suspense>
  );
}