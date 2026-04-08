/**
 * Normalize axios errors and thrown API payloads (FastAPI ApiError, Pydantic detail, etc.)
 */

export type NormalizedApiError = {
  message: string;
  /** loc segments joined with "." e.g. "body.email" -> "email" for simple display */
  fieldErrors: Record<string, string>;
};

function detailItemMessage(item: unknown): string {
  if (!item || typeof item !== 'object') return '';
  const o = item as Record<string, unknown>;
  const msg = o.msg;
  if (typeof msg === 'string') return msg;
  return String(o.message ?? '');
}

function fieldKeyFromLoc(loc: unknown): string | null {
  if (!Array.isArray(loc)) return null;
  const parts = loc.map(String).filter((p) => p !== 'body' && p !== 'query' && p !== 'path');
  if (parts.length === 0) return null;
  return parts.join('.');
}

/**
 * Parse FastAPI-style validation `detail` array into field -> message.
 */
function parseDetailArray(detail: unknown[]): { message: string; fieldErrors: Record<string, string> } {
  const fieldErrors: Record<string, string> = {};
  const messages: string[] = [];
  for (const item of detail) {
    if (typeof item === 'string') {
      messages.push(item);
      continue;
    }
    if (!item || typeof item !== 'object') continue;
    const o = item as Record<string, unknown>;
    const m = detailItemMessage(item);
    const key = fieldKeyFromLoc(o.loc);
    if (key && m) {
      fieldErrors[key] = m;
    }
    if (m) messages.push(m);
  }
  const message = messages.length ? messages[0]! : 'Invalid request';
  return { message, fieldErrors };
}

export function normalizeApiError(err: unknown, fallback = 'Something went wrong. Please try again.'): NormalizedApiError {
  if (err == null) {
    return { message: fallback, fieldErrors: {} };
  }

  if (typeof err === 'string') {
    return { message: err || fallback, fieldErrors: {} };
  }

  if (typeof err === 'object' && err !== null) {
    const o = err as Record<string, unknown>;

    // Thrown axios response.data object
    if (typeof o.message === 'string' && o.message.trim()) {
      const fieldErrors: Record<string, string> = {};
      const details = o.details as Record<string, unknown> | undefined;
      const fields = details?.fields;
      if (Array.isArray(fields)) {
        for (const f of fields) {
          if (!f || typeof f !== 'object') continue;
          const fr = f as Record<string, unknown>;
          const field = typeof fr.field === 'string' ? fr.field : null;
          const msg = typeof fr.message === 'string' ? fr.message : null;
          if (field && msg) fieldErrors[field] = msg;
        }
      }
      return { message: o.message, fieldErrors };
    }

    if (typeof o.detail === 'string' && o.detail.trim()) {
      return { message: o.detail, fieldErrors: {} };
    }

    if (Array.isArray(o.detail)) {
      const { message, fieldErrors } = parseDetailArray(o.detail);
      return { message: message || fallback, fieldErrors };
    }

    if (typeof o.msg === 'string' && o.msg.trim()) {
      return { message: o.msg, fieldErrors: {} };
    }

    if (typeof o.code === 'string' && o.code.trim() && !o.message) {
      return { message: fallback, fieldErrors: {} };
    }
  }

  // Axios error shape
  const ax = err as {
    response?: { data?: Record<string, unknown>; status?: number };
    message?: string;
    code?: string;
  };
  const data = ax.response?.data;
  if (data && typeof data === 'object') {
    return normalizeApiError(data, fallback);
  }

  if (ax.code === 'ERR_NETWORK' || ax.message === 'Network Error') {
    return {
      message: 'Network error. Check your connection and that the API server is running.',
      fieldErrors: {},
    };
  }

  if (typeof ax.message === 'string' && ax.message.trim()) {
    return { message: ax.message, fieldErrors: {} };
  }

  return { message: fallback, fieldErrors: {} };
}
