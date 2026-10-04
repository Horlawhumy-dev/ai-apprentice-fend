"use client";

import { useEffect, useState } from "react";
import { answerQuestion, requestDebrief } from "@/services/api";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card, CardHeader, EmptyState } from "@/components/ui/Card";
import { Icon } from "@/components/ui/Icon";
import { Textarea } from "@/components/ui/Field";

interface Question {
  question_id: string;
  question_type: string;
  question_text: string;
  answer_text?: string | null;
}

export default function DebriefPanel({
  sessionId,
  onGenerate,
}: {
  sessionId: string;
  onGenerate: () => void;
}) {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    let active = true;
    requestDebrief(sessionId)
      .then((res) => {
        if (!active) return;
        const qs: Question[] = res.questions ?? [];
        const saved: Record<string, string> = {};
        const done: Record<string, boolean> = {};
        for (const q of qs) {
          if (q.answer_text) {
            saved[q.question_id] = q.answer_text;
            done[q.question_id] = true;
          }
        }
        setQuestions(qs);
        setAnswers(saved);
        setSubmitted(done);
      })
      .catch((e: unknown) => {
        if (!active) return;
        setQuestions([]);
        setLoadError(e instanceof Error ? e.message : "Failed to load debrief questions.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [sessionId]);

  const submit = async (q: Question) => {
    const text = answers[q.question_id];
    if (!text?.trim()) return;
    await answerQuestion(sessionId, q.question_id, text);
    setSubmitted((s) => ({ ...s, [q.question_id]: true }));
  };

  const allDone = questions.length > 0 && questions.every((q) => submitted[q.question_id]);
  const answered = questions.filter((q) => submitted[q.question_id]).length;

  const generate = async () => {
    setGenerating(true);
    try {
      await onGenerate();
    } finally {
      setGenerating(false);
    }
  };

  return (
    <Card className="mt-6 p-6 sm:p-7">
      <CardHeader
        icon="clipboard"
        title="Debrief"
        subtitle="Answer a few follow-ups so the Work Map captures your reasoning and guardrails."
        action={
          questions.length > 0 && (
            <Badge tone={allDone ? "ok" : "neutral"}>
              {answered}/{questions.length} answered
            </Badge>
          )
        }
      />

      <div className="mt-6 space-y-4">
        {loading && (
          <p className="inline-flex items-center gap-2 text-sm text-muted">
            <Icon name="loader" size={15} className="animate-spin" />
            Preparing questions…
          </p>
        )}

        {!loading && loadError && (
          <p className="inline-flex items-center gap-2 rounded-lg bg-bad-soft px-3 py-2 text-sm text-bad">
            <Icon name="alert" size={15} />
            {loadError}
          </p>
        )}

        {!loading && !loadError && questions.length === 0 && (
          <EmptyState
            icon="clipboard"
            title="No debrief questions"
            hint="The API returned an empty questionnaire for this session."
          />
        )}

        {questions.map((q, i) => {
          const done = Boolean(submitted[q.question_id]);
          return (
            <div
              key={q.question_id}
              className={`rounded-xl border p-4 transition-colors ${
                done ? "border-ok/30 bg-ok-soft/40" : "border-line bg-surface-inset"
              }`}
            >
              <div className="flex items-start gap-3">
                <span
                  className={`grid size-6 shrink-0 place-items-center rounded-lg text-xs font-semibold ${
                    done ? "bg-ok text-white" : "bg-surface-3 text-faint"
                  }`}
                >
                  {done ? <Icon name="check" size={13} strokeWidth={3} /> : i + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <Badge tone="neutral" className="mb-1.5">
                    {q.question_type.replace(/_/g, " ")}
                  </Badge>
                  <p className="text-sm leading-relaxed font-medium">{q.question_text}</p>
                  <Textarea
                    rows={2}
                    value={answers[q.question_id] ?? ""}
                    onChange={(e) => setAnswers((a) => ({ ...a, [q.question_id]: e.target.value }))}
                    disabled={done}
                    aria-label={q.question_text}
                    placeholder="Your answer"
                    className="mt-2.5"
                  />
                  {!done && (
                    <Button
                      variant="soft"
                      size="sm"
                      className="mt-2.5"
                      disabled={!answers[q.question_id]?.trim()}
                      onClick={() => void submit(q)}
                    >
                      Save answer
                    </Button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-3 border-t border-line pt-5">
        <Button variant="primary" icon="sparkles" disabled={!allDone} busy={generating} onClick={() => void generate()}>
          Generate Work Map
        </Button>
        <p className="text-xs text-faint">
          {allDone
            ? "Every question is answered — the map can be generated."
            : "Answer all questions to unlock generation."}
        </p>
      </div>
    </Card>
  );
}
