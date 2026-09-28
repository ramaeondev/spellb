const SESSION_STORAGE_KEY = "spelling-quest-validation-sessions";

type SessionEvent = {
  wordId: string;
  action: "skipped" | "answered";
  at: string;
};

type ValidationSession = {
  sessionId: string;
  visitorId: string;
  stage: string;
  startedAt: string;
  events: SessionEvent[];
};

function createId() {
  return globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function readSessions() {
  try {
    return JSON.parse(localStorage.getItem(SESSION_STORAGE_KEY) ?? "[]") as ValidationSession[];
  } catch {
    return [];
  }
}

function saveSession(session: ValidationSession) {
  try {
    const sessions = [...readSessions().filter((item) => item.sessionId !== session.sessionId), session].slice(-50);
    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(sessions));
  } catch {
    // Tracking is best-effort and must never interrupt play.
  }
}

export async function startValidationSession(stage: string) {
  let visitorId = "unavailable";

  try {
    const { load } = await import("@fingerprintjs/fingerprintjs");
    const fingerprint = await load();
    visitorId = (await fingerprint.get()).visitorId;
  } catch {
    // Some browsers block fingerprint collection; the session still gets an ID.
  }

  const session: ValidationSession = {
    sessionId: createId(),
    visitorId,
    stage,
    startedAt: new Date().toISOString(),
    events: [],
  };
  saveSession(session);
  return session;
}

export function recordValidationEvent(sessionId: string, wordId: string, action: SessionEvent["action"]) {
  const session = readSessions().find((item) => item.sessionId === sessionId);
  if (!session) return;
  session.events.push({ wordId, action, at: new Date().toISOString() });
  saveSession(session);
}