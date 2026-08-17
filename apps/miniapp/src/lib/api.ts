import type { DiagnosticSubmissionPayload } from "../types";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL?.trim() ?? "";
const USE_MOCK_API = import.meta.env.VITE_USE_MOCK_API === "true";

export async function submitDiagnostic(
  payload: DiagnosticSubmissionPayload
): Promise<void> {
  if (USE_MOCK_API) {
    await new Promise((resolve) => window.setTimeout(resolve, 500));
    return;
  }

  const response = await fetch(`${API_BASE_URL}/api/diagnostic-submissions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    throw new Error("Не удалось отправить анкету");
  }
}

