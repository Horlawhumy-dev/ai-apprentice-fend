const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

async function fail(res: Response, fallback: string): Promise<never> {
  let detail = fallback;
  try {
    const body = await res.json();
    if (body?.detail) detail = typeof body.detail === "string" ? body.detail : fallback;
  } catch {
    // keep fallback
  }
  throw new Error(detail);
}

export async function createSession(payload: { workflow_title: string; expert_name?: string }) {
  const res = await fetch(`${API_URL}/api/sessions`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) return fail(res, "Failed to create session");
  return res.json();
}

export async function getSession(sessionId: string) {
  const res = await fetch(`${API_URL}/api/sessions/${sessionId}`, { cache: "no-store" });
  if (!res.ok) return fail(res, "Failed to get session");
  return res.json();
}

export async function startCapture(sessionId: string) {
  const res = await fetch(`${API_URL}/api/sessions/${sessionId}/start`, { method: "POST" });
  if (!res.ok) return fail(res, "Failed to start");
  return res.json();
}

export async function pauseSession(sessionId: string) {
  const res = await fetch(`${API_URL}/api/sessions/${sessionId}/pause`, { method: "POST" });
  if (!res.ok) return fail(res, "Failed to pause");
  return res.json();
}

export async function offRecord(sessionId: string) {
  const res = await fetch(`${API_URL}/api/sessions/${sessionId}/off-record`, { method: "POST" });
  if (!res.ok) return fail(res, "Failed to off-record");
  return res.json();
}

export async function resumeSession(sessionId: string) {
  const res = await fetch(`${API_URL}/api/sessions/${sessionId}/resume`, { method: "POST" });
  if (!res.ok) return fail(res, "Failed to resume");
  return res.json();
}

export async function finishSession(sessionId: string) {
  const res = await fetch(`${API_URL}/api/sessions/${sessionId}/finish`, { method: "POST" });
  if (!res.ok) return fail(res, "Failed to finish");
  return res.json();
}

export async function addEvent(sessionId: string, payload: Record<string, unknown>) {
  const res = await fetch(`${API_URL}/api/sessions/${sessionId}/events`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) return fail(res, "Failed to add event");
  return res.json();
}

export async function addTranscript(sessionId: string, payload: Record<string, unknown>) {
  const res = await fetch(`${API_URL}/api/sessions/${sessionId}/transcript`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) return fail(res, "Failed to add transcript");
  return res.json();
}

export async function generateWorkMap(sessionId: string) {
  const res = await fetch(`${API_URL}/api/sessions/${sessionId}/work-map/generate`, { method: "POST" });
  if (!res.ok) return fail(res, "Failed to generate work map");
  return res.json();
}

export async function getWorkflow(workflowId: string) {
  const res = await fetch(`${API_URL}/api/workflows/${workflowId}`);
  if (!res.ok) return fail(res, "Failed to get workflow");
  return res.json();
}

export async function updateStep(workflowId: string, stepId: string, payload: Record<string, unknown>) {
  const res = await fetch(`${API_URL}/api/workflows/${workflowId}/steps/${stepId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) return fail(res, "Failed to update step");
  return res.json();
}

export async function confirmWorkflow(workflowId: string) {
  const res = await fetch(`${API_URL}/api/workflows/${workflowId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status: "confirmed" }),
  });
  if (!res.ok) return fail(res, "Failed to confirm workflow");
  return res.json();
}

export async function listCases() {
  const res = await fetch(`${API_URL}/api/apprentice/cases`);
  if (!res.ok) return fail(res, "Failed to list cases");
  return res.json();
}

export async function createApprenticeSession(
  workflowId: string,
  caseId: string,
  caseData: Record<string, unknown> = {},
) {
  const res = await fetch(`${API_URL}/api/apprentice/sessions`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ workflow_id: workflowId, case_id: caseId, case_data: caseData }),
  });
  if (!res.ok) return fail(res, "Failed to create apprentice session");
  return res.json();
}

export async function evaluateAction(sessionId: string, action: string, caseData: Record<string, unknown>) {
  const res = await fetch(`${API_URL}/api/apprentice/sessions/${sessionId}/evaluate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action, case_data: caseData }),
  });
  if (!res.ok) return fail(res, "Failed to evaluate");
  return res.json();
}

export async function finishApprenticeSession(sessionId: string) {
  const res = await fetch(`${API_URL}/api/apprentice/sessions/${sessionId}/finish`, { method: "POST" });
  if (!res.ok) return fail(res, "Failed to finish");
  return res.json();
}

export async function requestDebrief(sessionId: string) {
  const res = await fetch(`${API_URL}/api/sessions/${sessionId}/debrief`, { method: "POST" });
  if (!res.ok) return fail(res, "Failed to start debrief");
  return res.json();
}

export async function answerQuestion(sessionId: string, questionId: string, answerText: string) {
  const res = await fetch(`${API_URL}/api/sessions/${sessionId}/questions/${questionId}/answer`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ answer_text: answerText }),
  });
  if (!res.ok) return fail(res, "Failed to submit answer");
  return res.json();
}

export interface VoiceConfig {
  provider: "elevenlabs" | "prototype";
  configured: boolean;
  mode: "signed_url" | "manual_transcript";
}

/** Whether the backend can mint an ElevenLabs signed URL, or we fall back to manual entry. */
export async function getVoiceConfig(): Promise<VoiceConfig> {
  const res = await fetch(`${API_URL}/api/voice/config`, { cache: "no-store" });
  if (!res.ok) return fail(res, "Failed to reach the voice service");
  return res.json();
}

/** Short-lived signed URL. The ElevenLabs API key never leaves the backend. */
export async function requestVoiceToken(): Promise<{ signed_url: string; expires_in: number }> {
  const res = await fetch(`${API_URL}/api/voice/token`, { method: "POST" });
  if (!res.ok) return fail(res, "Voice provider is not configured");
  return res.json();
}

