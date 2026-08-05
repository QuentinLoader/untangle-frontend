import { withAuth } from "@/auth/ProtectedRoute";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";

export const Route = createFileRoute("/processing")({
  head: () => ({
    meta: [
      { title: "Reading your document — Untangle" },
      {
        name: "description",
        content: "Untangle is reading your document and extracting what matters.",
      },
      { property: "og:title", content: "Reading your document — Untangle" },
      {
        property: "og:description",
        content: "Untangle is reading your document and extracting what matters.",
      },
    ],
  }),
  component: withAuth(Processing),
});

function Processing() {
  const navigate = useNavigate();
  const [doneSteps, setDoneSteps] = useState<number>(0);

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];

    timers.push(
      setTimeout(() => setDoneSteps(1), 600),
      setTimeout(() => setDoneSteps(2), 1200),
      setTimeout(() => setDoneSteps(3), 1800),
      setTimeout(() => navigate({ to: "/result" }), 2200)
    );

    return () => timers.forEach(clearTimeout);
  }, [navigate]);

  return (
    <div className="flex min-h-screen flex-col bg-paper">
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col px-5 pt-7">
        <header className="flex items-center justify-center pt-2">
          <h1 className="font-display text-[17px] font-semibold text-ink">Reading your document</h1>
        </header>

        <div className="flex flex-1 flex-col items-center justify-center pb-16">
          <div className="flex h-[100px] w-[82px] flex-col justify-start gap-2 rounded-lg border-2 border-ink bg-card p-3 pt-4">
            <div className="h-[5px] w-full rounded-full bg-paper-2" />
            <div className="h-[5px] w-[75%] rounded-full bg-teal/40" />
            <div className="h-[5px] w-[55%] rounded-full bg-paper-2" />
          </div>

          <div className="mt-10 w-full max-w-[260px] space-y-4">
            <StepRow label="Identifying document type" done={doneSteps >= 1} />
            <StepRow label="Extracting key dates & amounts" done={doneSteps >= 2} />
            <StepRow label="Checking your rights" done={doneSteps >= 3} />
          </div>
        </div>
      </div>
    </div>
  );
}

function StepRow({ label, done }: { label: string; done: boolean }) {
  return (
    <div className="flex items-center gap-3.5">
      <div
        className={`flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-full border-2 transition-colors duration-300 ${
          done ? "border-teal bg-teal" : "border-teal bg-transparent"
        }`}
      >
        {done && <span className="text-[13px] font-bold text-white">✓</span>}
      </div>
      <span
        className={`text-[14px] transition-colors duration-300 ${
          done ? "font-medium text-ink" : "text-ink-soft"
        }`}
      >
        {label}
      </span>
    </div>
  );
}
