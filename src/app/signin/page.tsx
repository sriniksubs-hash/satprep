import { signIn } from "@/auth";

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string }>;
}) {
  const { callbackUrl } = await searchParams;

  return (
    <div className="mx-auto max-w-sm py-16 text-center">
      <h1 className="font-serif-display text-3xl">Sign in to Aptitude</h1>
      <p className="mt-3 text-ink-soft">
        Your practice history and progress reports are tied to your account.
      </p>

      <form
        className="mt-8"
        action={async () => {
          "use server";
          await signIn("google", { redirectTo: callbackUrl || "/practice" });
        }}
      >
        <button
          type="submit"
          className="w-full rounded-full bg-cobalt px-6 py-3 font-medium text-paper hover:bg-cobalt-deep"
        >
          Continue with Google
        </button>
      </form>
    </div>
  );
}
