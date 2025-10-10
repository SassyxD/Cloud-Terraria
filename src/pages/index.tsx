import { useSession, signIn, signOut } from "next-auth/react";
import Link from "next/link";

export default function Home() {
  const { data: session, status } = useSession();

  if (status === "loading") return <main className="p-6">Loading...</main>;

  return (
    <main className="p-6 flex flex-col gap-4">
      {session ? (
        <>
          <div>Hi, {session.user?.name ?? session.user?.email}</div>
          <Link className="underline" href="/dashboard">Go to Dashboard</Link>
          <button onClick={() => signOut()} className="border px-3 py-1 rounded-xl">Sign out</button>
        </>
      ) : (
        <div className="flex gap-3">
          <button onClick={() => signIn("google")} className="border px-3 py-1 rounded-xl">Sign in with Google</button>
          <button onClick={() => signIn("line")} className="border px-3 py-1 rounded-xl">Sign in with LINE</button>
          <button onClick={() => signIn("email")} className="border px-3 py-1 rounded-xl">Sign in with Email</button>
        </div>
      )}
    </main>
  );
}
