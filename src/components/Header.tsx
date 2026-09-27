import Link from "next/link";
import { auth, signIn, signOut } from "@/auth";

export default async function Header() {
  const session = await auth();

  return (
    <header className="border-b border-line">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-5">
        <Link href="/" className="flex items-baseline gap-2">
          <span className="font-serif-display text-xl font-semibold tracking-tight">
            Aptitude
          </span>
          <span className="font-tabular text-xs text-ink-soft">SAT prep</span>
        </Link>

        <nav className="flex items-center gap-6 text-sm">
          <Link href="/practice" className="text-ink-soft hover:text-ink">
            Practice
          </Link>
          <Link href="/reports" className="text-ink-soft hover:text-ink">
            Progress
          </Link>

          {session?.user ? (
            <form
              action={async () => {
                "use server";
                await signOut({ redirectTo: "/" });
              }}
            >
              <div className="flex items-center gap-3">
                {session.user.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={session.user.image}
                    alt=""
                    className="h-7 w-7 rounded-full"
                  />
                ) : null}
                <button
                  type="submit"
                  className="rounded-full border border-line px-4 py-1.5 text-ink-soft hover:border-ink hover:text-ink"
                >
                  Sign out
                </button>
              </div>
            </form>
          ) : (
            <form
              action={async () => {
                "use server";
                await signIn("google");
              }}
            >
              <button
                type="submit"
                className="rounded-full bg-cobalt px-4 py-1.5 font-medium text-paper hover:bg-cobalt-deep"
              >
                Sign in
              </button>
            </form>
          )}
        </nav>
      </div>
    </header>
  );
}
