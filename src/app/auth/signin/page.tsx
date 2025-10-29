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
            {/* Discord Sign In */}
            <form
              action={async () => {
                "use server";
                await signIn("discord", { redirectTo: "/" });
              }}
            >
              <button
                type="submit"
                className="w-full group relative px-6 py-4 rounded-xl bg-[#5865f2] hover:bg-[#4752c4] transition-all font-semibold text-white text-lg shadow-lg overflow-hidden"
              >
                <span className="relative z-10 flex items-center justify-center gap-3">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418Z"/>
                  </svg>
                  Continue with Discord
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
                    await signIn("cognito", { redirectTo: "/" });
                  }}
                >
                  <button
                    type="submit"
                    className="w-full group relative px-6 py-4 rounded-xl bg-gradient-to-r from-[#ff9900] to-[#ff7700] hover:from-[#ff8800] hover:to-[#ff6600] transition-all font-semibold text-white text-lg shadow-lg overflow-hidden"
                  >
                    <span className="relative z-10 flex items-center justify-center gap-3">
                      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M6.763 10.036c.152 0 .279.028.384.082.105.054.18.139.224.252.044.114.066.247.066.4 0 .15-.02.281-.063.391a.547.547 0 01-.215.249.64.64 0 01-.361.087.776.776 0 01-.248-.038.534.534 0 01-.187-.11.467.467 0 01-.119-.184.814.814 0 01-.053-.285h-.203c0 .22.037.407.112.563.075.156.18.277.314.363.134.086.29.129.469.129.139 0 .266-.024.382-.073a.648.648 0 00.28-.217c.077-.095.112-.211.112-.346 0-.114-.024-.209-.072-.285a.452.452 0 00-.187-.164.965.965 0 00-.25-.082v-.012c.096-.02.181-.054.255-.1a.503.503 0 00.168-.178.537.537 0 00.06-.26.644.644 0 00-.062-.29.478.478 0 00-.187-.194.622.622 0 00-.307-.071c-.12 0-.23.022-.328.066a.51.51 0 00-.232.193.549.549 0 00-.088.315h.216c0-.105.018-.193.054-.264a.36.36 0 01.137-.156.407.407 0 01.194-.046zm2.143 0c.152 0 .279.028.384.082.105.054.18.139.224.252.044.114.066.247.066.4 0 .15-.02.281-.063.391a.547.547 0 01-.215.249.64.64 0 01-.361.087.776.776 0 01-.248-.038.534.534 0 01-.187-.11.467.467 0 01-.119-.184.814.814 0 01-.053-.285h-.203c0 .22.037.407.112.563.075.156.18.277.314.363.134.086.29.129.469.129.139 0 .266-.024.382-.073a.648.648 0 00.28-.217c.077-.095.112-.211.112-.346 0-.114-.024-.209-.072-.285a.452.452 0 00-.187-.164.965.965 0 00-.25-.082v-.012c.096-.02.181-.054.255-.1a.503.503 0 00.168-.178.537.537 0 00.06-.26.644.644 0 00-.062-.29.478.478 0 00-.187-.194.622.622 0 00-.307-.071c-.12 0-.23.022-.328.066a.51.51 0 00-.232.193.549.549 0 00-.088.315h.216c0-.105.018-.193.054-.264a.36.36 0 01.137-.156.407.407 0 01.194-.046z"/>
                        <path d="M14.465 11.813c.155 0 .298-.033.428-.099a.721.721 0 00.298-.264.706.706 0 00.107-.39.73.73 0 00-.114-.408.663.663 0 00-.307-.27.95.95 0 00-.442-.096c-.155 0-.298.033-.428.1a.721.721 0 00-.298.263.707.707 0 00-.107.39.73.73 0 00.114.408c.076.117.18.21.307.27a.95.95 0 00.442.096zm0 .163c-.204 0-.392-.041-.563-.123a.912.912 0 01-.4-.357c-.102-.155-.152-.342-.152-.562 0-.219.05-.406.152-.561a.912.912 0 01.4-.357c.171-.082.359-.123.563-.123.204 0 .392.041.563.123a.912.912 0 01.4.357c.102.155.152.342.152.561 0 .22-.05.407-.152.562a.912.912 0 01-.4.357c-.171.082-.359.123-.563.123z"/>
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
            By signing in, you agree to manage your servers responsibly
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