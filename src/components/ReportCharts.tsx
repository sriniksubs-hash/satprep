"use client";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  LineChart,
  Line,
} from "recharts";
import type { ReportData } from "@/types";

const COBALT = "#2547d0";
const GOLD = "#d99a2b";
const BRICK = "#b23a2e";
const LINE = "#dcd8cd";

function StatBlock({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-l border-line pl-4">
      <p className="font-tabular text-3xl text-ink">{value}</p>
      <p className="mt-1 text-sm text-ink-soft">{label}</p>
    </div>
  );
}

export default function ReportCharts({ data }: { data: ReportData }) {
  return (
    <div className="mt-8 space-y-10">
      <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
        <StatBlock label="Problems attempted" value={String(data.totalAttempted)} />
        <StatBlock label="Overall accuracy" value={`${data.overallAccuracy}%`} />
        <StatBlock label="Current streak" value={`${data.currentStreakDays}d`} />
        <StatBlock
          label="Correct answers"
          value={String(data.totalCorrect)}
        />
      </div>

      <section>
        <h2 className="font-serif-display text-xl">Accuracy by subject</h2>
        <div className="mt-4 h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data.bySubject} barSize={48}>
              <CartesianGrid stroke={LINE} vertical={false} />
              <XAxis dataKey="subject" stroke="#4a5468" fontSize={13} />
              <YAxis
                stroke="#4a5468"
                fontSize={13}
                domain={[0, 100]}
                tickFormatter={(v) => `${v}%`}
              />
              <Tooltip
                formatter={(value, name) => [
                  name === "accuracy" ? `${value}%` : value,
                  name === "accuracy" ? "Accuracy" : String(name),
                ]}
              />
              <Bar dataKey="accuracy" fill={COBALT} radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section>
        <h2 className="font-serif-display text-xl">Practice activity (last 30 days)</h2>
        <div className="mt-4 h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data.byDay}>
              <CartesianGrid stroke={LINE} vertical={false} />
              <XAxis dataKey="date" stroke="#4a5468" fontSize={12} minTickGap={20} />
              <YAxis stroke="#4a5468" fontSize={13} allowDecimals={false} />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="attempted"
                name="Attempted"
                stroke={COBALT}
                strokeWidth={2}
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="correct"
                name="Correct"
                stroke={GOLD}
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section>
        <h2 className="font-serif-display text-xl">Accuracy by topic</h2>
        <div className="mt-4 divide-y divide-line border-y border-line">
          {data.byTopic
            .sort((a, b) => a.accuracy - b.accuracy)
            .map((t) => (
              <div key={`${t.subject}-${t.topic}`} className="flex items-center gap-4 py-3">
                <div className="w-48 shrink-0">
                  <p className="text-sm">{t.topic}</p>
                  <p className="text-xs text-ink-soft">{t.subject}</p>
                </div>
                <div className="h-2 flex-1 rounded-full bg-paper-dim">
                  <div
                    className="h-2 rounded-full"
                    style={{
                      width: `${t.accuracy}%`,
                      background: t.accuracy >= 70 ? GOLD : t.accuracy >= 40 ? COBALT : BRICK,
                    }}
                  />
                </div>
                <span className="font-tabular w-16 text-right text-sm">
                  {t.accuracy}%
                </span>
                <span className="font-tabular w-20 text-right text-xs text-ink-soft">
                  {t.correct}/{t.attempted}
                </span>
              </div>
            ))}
        </div>
      </section>

      <section>
        <h2 className="font-serif-display text-xl">Recent attempts</h2>
        <div className="mt-4 divide-y divide-line border-y border-line">
          {data.recentAttempts.map((a) => (
            <div key={a.id} className="flex items-center justify-between py-3 text-sm">
              <div>
                <span>{a.subject} — {a.topic}</span>
                <span className="ml-2 text-xs text-ink-soft">{a.difficulty}</span>
              </div>
              <div className="flex items-center gap-4">
                <span className="font-tabular text-xs text-ink-soft">
                  {a.timeSpentSeconds}s
                </span>
                <span
                  className={`font-tabular text-xs font-medium ${
                    a.correct ? "text-gold" : "text-brick"
                  }`}
                >
                  {a.correct ? "Correct" : "Incorrect"}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
