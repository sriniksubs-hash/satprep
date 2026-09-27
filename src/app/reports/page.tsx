import { auth } from "@/auth";
import { getReportData } from "@/lib/attempts";
import ReportCharts from "@/components/ReportCharts";
import Link from "next/link";

export default async function ReportsPage() {
  const session = await auth();
  // middleware.ts already guarantees a session here, but keep TypeScript happy
  // and fail safely if this page were ever reached without one.
  if (!session?.user?.id) {
    return <p className="text-ink-soft">Sign in to see your progress.</p>;
  }

  const data = await getReportData(Number(session.user.id));

  return (
    <div>
      <h1 className="font-serif-display text-3xl">Your progress</h1>
      <p className="mt-2 text-ink-soft">
        Every practice attempt is tracked here, broken down by subject and
        topic so you can see exactly where to focus next.
      </p>

      {data.totalAttempted === 0 ? (
        <div className="mt-10 rounded-lg border border-line bg-white p-10 text-center">
          <p className="text-ink-soft">
            No practice attempts yet. Once you answer a few questions, your
            accuracy and streak will show up here.
          </p>
          <Link
            href="/practice"
            className="mt-5 inline-block rounded-full bg-cobalt px-5 py-2.5 font-medium text-paper hover:bg-cobalt-deep"
          >
            Start practicing
          </Link>
        </div>
      ) : (
        <ReportCharts data={data} />
      )}
    </div>
  );
}
