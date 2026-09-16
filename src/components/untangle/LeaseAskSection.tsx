import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { MessageSquare } from "lucide-react";
import { Disclosure } from "@/components/untangle/ResultBlocks";
import {
  askConfidenceLabel,
  askLeaseQuestion,
  friendlyAskError,
  type LeaseAskAnswer,
  type LeaseAskCapability,
} from "@/lib/documents";

type AnswerSections = {
  shortAnswer: string[];
  meaning: string[];
  details: string[];
};

function cleanMarkdown(value: string): string {
  return value
    .replace(/^\s{0,3}#{1,6}\s+/gm, "")
    .replace(/^\s*(?:[-*+]\s+|\d+[.)]\s+)/gm, "")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/__([^_]+)__/g, "$1")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/\[([^\]]+)]\([^)]*\)/g, "$1")
    .replace(/\*([^*]+)\*/g, "$1")
    .replace(/[*`#]+/g, "")
    .trim();
}

function sentences(value: string): string[] {
  const cleaned = cleanMarkdown(value).replace(/\s+/g, " ").trim();
  if (!cleaned) return [];
  return cleaned.match(/[^.!?]+(?:[.!?]+|$)/g)?.map((item) => item.trim()).filter(Boolean) ?? [];
}

function answerSections(value: string): AnswerSections {
  const blocks = value
    .split(/\n{2,}|\r?\n(?=\s*(?:#{1,6}\s+|\*\*[^*]+\*\*\s*$))/)
    .map(cleanMarkdown)
    .filter(Boolean);
  const all = sentences(blocks.join(" "));
  const shortAnswer = all.slice(0, Math.min(3, all.length));
  const remaining = all.slice(shortAnswer.length);
  return {
    shortAnswer,
    meaning: remaining.slice(0, 2),
    details: remaining.slice(2),
  };
}

function TextLines({ lines }: { lines: string[] }) {
  return (
    <div className="space-y-1.5">
      {lines.map((line, index) => (
        <p key={`${index}-${line.slice(0, 24)}`}>{line}</p>
      ))}
    </div>
  );
}

/**
 * LeaseCheck-only follow-up questions. Grounded answers come from the backend;
 * nothing here interprets legal data or keeps a conversation history.
 */
export function LeaseAskSection({
  documentId,
  capability,
}: {
  documentId: string;
  capability: LeaseAskCapability;
}) {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState<LeaseAskAnswer | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const maxLength = capability.maxQuestionLength > 0 ? capability.maxQuestionLength : 600;

  const mutation = useMutation({
    mutationFn: (value: string) => askLeaseQuestion(documentId, value),
    onSuccess: (response) => {
      setAnswer(response.data.answer);
      setErrorMessage(null);
    },
    onError: (error: unknown) => {
      setAnswer(null);
      setErrorMessage(friendlyAskError(error));
    },
  });

  const pending = mutation.isPending;
  const trimmed = question.trim();
  const canSubmit = trimmed.length > 0 && !pending;

  const submit = () => {
    if (!canSubmit) return;
    mutation.mutate(trimmed.slice(0, maxLength));
  };

  const fill = (value: string) => {
    setQuestion(value.slice(0, maxLength));
  };

  return (
    <div className="space-y-3">
      <section className="rounded-2xl border border-line/70 bg-white p-4">
        <h2 className="font-display text-[19px] font-semibold text-ink">Ask about this lease</h2>
        <p className="mt-1.5 text-[13px] leading-relaxed text-ink-soft">
          Ask a practical question about this lease. LeaseCheck will use the document and the
          information checked for this result.
        </p>

        <label className="sr-only" htmlFor="lease-ask-question">
          Your question
        </label>
        <textarea
          id="lease-ask-question"
          value={question}
          onChange={(event) => setQuestion(event.target.value.slice(0, maxLength))}
          maxLength={maxLength}
          rows={4}
          placeholder="e.g. What does this lease say about cancellation?"
          className="mt-3 w-full resize-none rounded-2xl border border-line bg-paper px-3.5 py-3 text-[16px] leading-relaxed text-ink outline-none transition-colors focus:border-teal"
        />
        <p className="mt-1 text-right text-[11px] text-ink-soft">
          {question.length} / {maxLength}
        </p>

        <button
          type="button"
          onClick={submit}
          disabled={!canSubmit}
          className="mt-2 flex min-h-[52px] w-full items-center justify-center gap-2 rounded-2xl bg-teal px-4 text-[15px] font-semibold text-white transition-transform active:scale-[0.99] disabled:opacity-60"
        >
          <MessageSquare size={17} aria-hidden />
          {pending ? "Checking your lease…" : "Ask LeaseCheck"}
        </button>

        {capability.exampleQuestions.length > 0 ? (
          <div className="mt-3">
            <p className="text-[12px] font-semibold text-ink-soft">Examples</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {capability.exampleQuestions.map((example) => (
                <button
                  key={example}
                  type="button"
                  onClick={() => fill(example)}
                  className="min-h-[44px] rounded-full border border-line bg-paper px-3.5 text-left text-[12.5px] leading-snug text-ink transition-colors active:bg-paper-2"
                >
                  {example}
                </button>
              ))}
            </div>
          </div>
        ) : null}
      </section>

      {errorMessage ? (
        <div
          className="rounded-2xl border border-stamp-amber/40 bg-tint-sand p-4 text-[13px] leading-relaxed text-ink"
          role="alert"
        >
          {errorMessage}
        </div>
      ) : null}

      {answer ? <LeaseAskAnswerCard answer={answer} onFollowUp={fill} /> : null}
    </div>
  );
}

function LeaseAskAnswerCard({
  answer,
  onFollowUp,
}: {
  answer: LeaseAskAnswer;
  onFollowUp: (value: string) => void;
}) {
  const confidence = askConfidenceLabel(answer.confidence);
  const content = answerSections(answer.answer);
  const legalDetails =
    content.details.length > 0 || answer.caveats.length > 0 || answer.legalSources.length > 0;

  return (
    <div className="space-y-3">
      <section className="rounded-2xl border border-line/70 bg-white p-4">
        <div className="flex items-start justify-between gap-3">
          <p className="text-[12px] font-semibold text-teal">Answer</p>
          {confidence ? (
            <span className="shrink-0 text-[11px] text-ink-soft">{confidence}</span>
          ) : null}
        </div>
        <div className="mt-2 text-[14.5px] leading-[1.6] text-ink">
          <TextLines lines={content.shortAnswer} />
        </div>
      </section>

      {answer.documentEvidence.length > 0 ? (
        <section className="rounded-2xl border border-line/70 bg-white p-4">
          <h3 className="text-[13px] font-semibold text-ink">What your lease says</h3>
          <div className="space-y-2">
            {answer.documentEvidence.map((item, index) => (
              <blockquote
                key={`${index}-${item.quote.slice(0, 24)}`}
                className="mt-2 rounded-xl border-l-2 border-teal bg-paper p-3"
              >
                {item.page !== null ? (
                  <p className="text-[11px] font-semibold text-ink-soft">Page {item.page}</p>
                ) : null}
                <p className="mt-1 text-[12.5px] leading-relaxed text-ink">
                  {cleanMarkdown(item.quote)}
                </p>
              </blockquote>
            ))}
          </div>
        </section>
      ) : null}

      {content.meaning.length > 0 ? (
        <section className="rounded-2xl border border-line/70 bg-white p-4">
          <h3 className="text-[13px] font-semibold text-ink">What this means for you</h3>
          <div className="mt-2 text-[13.5px] leading-relaxed text-ink-soft">
            <TextLines lines={content.meaning} />
          </div>
        </section>
      ) : null}

      {answer.caveats.length > 0 ? (
        <section className="rounded-2xl border border-line/70 bg-white p-4">
          <h3 className="text-[13px] font-semibold text-ink">Keep in mind</h3>
          <ul className="mt-2 space-y-1.5">
            {answer.caveats.map((caveat) => (
              <li key={caveat} className="flex gap-2 text-[12.5px] leading-relaxed text-ink-soft">
                <span aria-hidden>•</span>
                <span>{sentences(caveat)[0] ?? cleanMarkdown(caveat)}</span>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {answer.followUpQuestions.length > 0 ? (
        <section className="rounded-2xl border border-line/70 bg-white p-4">
          <h3 className="text-[13px] font-semibold text-ink-soft">You could also ask</h3>
          <div className="mt-2 flex flex-wrap gap-2">
            {answer.followUpQuestions.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => onFollowUp(item)}
                className="min-h-[44px] rounded-full border border-line bg-paper px-3.5 text-left text-[12.5px] leading-snug text-ink transition-colors active:bg-paper-2"
              >
                {item}
              </button>
            ))}
          </div>
        </section>
      ) : null}

      {legalDetails ? (
        <Disclosure title="Legal details" tone="card">
          {content.details.length > 0 ? (
            <div className="text-[12.5px] leading-relaxed text-ink-soft">
              <TextLines lines={content.details} />
            </div>
          ) : null}
          {answer.caveats.length > 0 ? (
            <div className={content.details.length > 0 ? "mt-4 border-t border-line pt-3" : ""}>
              <h4 className="text-[12.5px] font-semibold text-ink">Full cautions</h4>
              <ul className="mt-2 space-y-1.5">
                {answer.caveats.map((caveat) => (
                  <li key={caveat} className="flex gap-2 text-[12.5px] leading-relaxed text-ink-soft">
                    <span aria-hidden>•</span>
                    <span>{cleanMarkdown(caveat)}</span>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
          {answer.legalSources.length > 0 ? (
            <div className="mt-4 border-t border-line pt-3">
              <h4 className="text-[12.5px] font-semibold text-ink">Sources checked</h4>
              <div className="mt-2 space-y-2.5">
                {answer.legalSources.map((source) => (
                  <div key={`${source.ruleId}-${source.sourceId}`}>
                    <p className="text-[13px] font-semibold text-ink">{source.title}</p>
                    <p className="text-[12px] text-ink-soft">{source.provision}</p>
                    <a
                      href={source.canonicalUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-0.5 inline-block text-[12.5px] font-medium text-teal underline-offset-2 hover:underline"
                    >
                      View source
                    </a>
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </Disclosure>
      ) : null}
    </div>
  );
}
