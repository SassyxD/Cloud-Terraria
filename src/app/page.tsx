import Link from "next/link";
import { auth } from "~/server/auth/index";
import { api, HydrateClient } from "~/trpc/server";
import { CreateServerButton } from "~/components/CreateServerButton";
import { ServerCard } from "~/components/ServerCard";

export default async function Home() {
  const session = await auth();

  // Prefetch servers if user is logged in
  let servers = null;
  if (session?.user) {
    try {
      servers = await api.server.getAll();
    } catch (error) {
      console.error("Failed to fetch servers:", error);
    }
  }

  return (
    <HydrateClient>
      <div className="relative min-h-screen overflow-hidden">
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

        {/* Header */}
        <header className="relative z-10 border-b border-[#2a3548] bg-[#1a2537]/80 backdrop-blur-sm">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-[#4a90e2] to-[#9b59b6] rounded-lg flex items-center justify-center text-2xl font-bold">
                🌍
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-[#4a90e2] to-[#9b59b6] bg-clip-text text-transparent">
                  Cloud Terraria
                </h1>
                <p className="text-xs text-gray-400">Server Management</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              {session?.user ? (
                <>
                  <div className="flex items-center gap-3">
                    {session.user.image && (
                      <img
                        src={session.user.image}
                        alt={session.user.name ?? "User"}
                        className="w-8 h-8 rounded-full border-2 border-[#4a90e2]"
                      />
                    )}
                    <div className="hidden sm:block">
                      <p className="text-sm font-medium">{session.user.name}</p>
                      <p className="text-xs text-gray-400">{session.user.email}</p>
                    </div>
                  </div>
                  <Link
                    href="/api/auth/signout"
                    className="px-4 py-2 rounded-lg bg-[#2a3548] hover:bg-[#3a4558] transition-colors text-sm font-medium border border-[#4a90e2]/30"
                  >
                    Sign Out
                  </Link>
                </>
              ) : (
                <Link
                  href="/api/auth/signin"
                  className="px-6 py-2 rounded-lg bg-gradient-to-r from-[#4a90e2] to-[#9b59b6] hover:from-[#5fa3e8] hover:to-[#a569c2] transition-all font-medium shadow-lg terraria-glow"
                >
                  Sign In
                </Link>
              )}
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="relative z-10 container mx-auto px-4 py-12">
          {session?.user ? (
            <div className="space-y-8">
              {/* Welcome Section */}
              <div className="text-center space-y-4">
                <h2 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-[#4a90e2] via-[#9b59b6] to-[#f4c430] bg-clip-text text-transparent">
                  Welcome, Adventurer! ⚔️
                </h2>
                <p className="text-lg text-gray-300 max-w-2xl mx-auto">
                  Manage your Terraria servers with ease. Deploy, monitor, and control your worlds from the cloud.
                </p>
              </div>

              {/* Create Server Button */}
              <div className="flex justify-center">
                <CreateServerButton />
              </div>

              {/* Servers Grid */}
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
                      <ServerCard key={server.id} server={server} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-16 px-4 rounded-xl bg-[#1a2537] border border-[#2a3548]">
                    <div className="text-6xl mb-4">🏗️</div>
                    <h4 className="text-xl font-semibold text-gray-300 mb-2">
                      No Servers Yet
                    </h4>
                    <p className="text-gray-400 mb-6">
                      Create your first Terraria server to get started!
                    </p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            // Landing page for non-authenticated users
            <div className="text-center space-y-8 py-12">
              <div className="space-y-4">
                <h2 className="text-5xl sm:text-6xl font-bold bg-gradient-to-r from-[#4a90e2] via-[#9b59b6] to-[#f4c430] bg-clip-text text-transparent">
                  Cloud Terraria
                </h2>
                <p className="text-xl sm:text-2xl text-gray-300 max-w-3xl mx-auto">
                  Deploy and manage your Terraria servers in the cloud with just a few clicks! ⚡
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto mt-12">
                <div className="p-6 rounded-xl bg-[#1a2537] border border-[#4a90e2]/30 hover:border-[#4a90e2] transition-all terraria-glow">
                  <div className="text-4xl mb-4">🚀</div>
                  <h3 className="text-xl font-bold mb-2 text-[#4a90e2]">Quick Deploy</h3>
                  <p className="text-gray-400">
                    Launch your Terraria server in minutes with automated setup and configuration.
                  </p>
                </div>

                <div className="p-6 rounded-xl bg-[#1a2537] border border-[#9b59b6]/30 hover:border-[#9b59b6] transition-all">
                  <div className="text-4xl mb-4">⚙️</div>
                  <h3 className="text-xl font-bold mb-2 text-[#9b59b6]">Easy Management</h3>
                  <p className="text-gray-400">
                    Control your servers with an intuitive dashboard. Start, stop, and monitor with ease.
                  </p>
                </div>

                <div className="p-6 rounded-xl bg-[#1a2537] border border-[#f4c430]/30 hover:border-[#f4c430] transition-all terraria-glow-gold">
                  <div className="text-4xl mb-4">☁️</div>
                  <h3 className="text-xl font-bold mb-2 text-[#f4c430]">Cloud Powered</h3>
                  <p className="text-gray-400">
                    Reliable AWS infrastructure ensures your worlds are always available.
                  </p>
                </div>
              </div>

              <div className="pt-8">
                <Link
                  href="/api/auth/signin"
                  className="inline-block px-8 py-4 rounded-xl bg-gradient-to-r from-[#4a90e2] to-[#9b59b6] hover:from-[#5fa3e8] hover:to-[#a569c2] transition-all font-bold text-lg shadow-lg terraria-glow"
                >
                  Get Started Now →
                </Link>
              </div>
            </div>
          )}
        </main>

        {/* Footer */}
        <footer className="relative z-10 mt-16 border-t border-[#2a3548] bg-[#1a2537]/80 backdrop-blur-sm">
          <div className="container mx-auto px-4 py-6 text-center text-sm text-gray-400">
            <p>Built with ❤️ for Terraria adventurers</p>
          </div>
        </footer>
      </div>
    </HydrateClient>
  );
}
