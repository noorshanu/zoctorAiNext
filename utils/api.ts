import axios from 'axios';

function isBrowserLocalDev(): boolean {
  if (typeof window === 'undefined') return false;
  const h = window.location.hostname;
  return h === 'localhost' || h === '127.0.0.1' || h === '[::1]';
}

// Support both local and production environments (127.0.0.1 must match localhost).
// Keep this as API origin only (no /api/v1 suffix), because routes in this file already add /api/... paths.
export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  (isBrowserLocalDev() ? 'http://127.0.0.1:8000' : 'https://api.zoctorai.com');

/**
 * When true, use Zoctor FastAPI routes: `/api/users/auth/*`, `/api/v1/*` (chat, PDF, summaries).
 * Enabled if NEXT_PUBLIC_USE_FASTAPI=1, NEXT_PUBLIC_API_URL points at a local backend, or the app is opened on localhost/127.0.0.1.
 */
export const isZoctorFastApiBackend = (): boolean => {
  if (process.env.NEXT_PUBLIC_USE_FASTAPI === '1') return true;
  const envUrl = process.env.NEXT_PUBLIC_API_URL || '';
  if (/api\.zoctorai\.(com|in)/.test(envUrl)) return true;
  if (/api\.zoctorai\.(com|in)/.test(API_BASE_URL)) return true;
  if (/localhost|127\.0\.0\.1|\[::1\]/.test(envUrl)) return true;
  if (typeof window !== 'undefined') {
    const h = window.location.hostname;
    if (h === 'localhost' || h === '127.0.0.1' || h === '[::1]') return true;
  }
  return false;
};

export const apiV1Base = (): string =>
  `${String(API_BASE_URL).replace(/\/$/, '')}/api/v1`;

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Important for CORS with credentials
  maxContentLength: Infinity,
  maxBodyLength: Infinity,
});

const logApiDebug =
  typeof process !== 'undefined' && process.env.NODE_ENV === 'development';

// Add request interceptor for debugging (dev only)
api.interceptors.request.use(
  (config) => {
    if (logApiDebug) {
      const safeData =
        config.data && typeof config.data === 'object' && config.url?.includes('auth')
          ? '[redacted]'
          : config.data instanceof FormData
            ? 'FormData'
            : config.data;
      console.log('Request config:', {
        url: config.url,
        method: config.method,
        data: safeData,
      });
    }
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor for debugging (dev only)
api.interceptors.response.use(
  (response) => {
    if (logApiDebug) {
      console.log('Response:', { status: response.status, url: response.config?.url });
    }
    return response;
  },
  (error) => {
    if (logApiDebug) {
      console.error('Response error:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
        url: error.config?.url,
      });
    }
    if (error.response?.status === 401) {
      const reqUrl = String(error.config?.url ?? '');
      const isPublicAuth =
        reqUrl.includes('/api/users/auth/login') ||
        reqUrl.includes('/api/users/auth/signup') ||
        reqUrl.includes('/api/users/auth/google');
      if (!isPublicAuth) {
        localStorage.removeItem('accessToken');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Helper function to convert File to base64
export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = (reader.result as string).split(',')[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

// File upload function - Updated to use base64 as per backend API
export const uploadFile = async (file: File, sessionId?: string) => {
  try {
    // Validate file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      throw new Error('File size exceeds 10MB limit');
    }

    // Validate file type - supports PDF, TXT, MD
    const allowedTypes = ['application/pdf', 'text/plain', 'text/markdown'];
    const allowedExtensions = ['.pdf', '.txt', '.md'];
    const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));
    
    if (!allowedTypes.includes(file.type) && !allowedExtensions.includes(fileExtension)) {
      throw new Error('Only PDF, TXT, and MD files are allowed');
    }

    // Convert file to base64
    const base64Data = await fileToBase64(file);

    const payload = {
      filename: file.name,
      data_base64: base64Data,
      ...(sessionId && { session_id: sessionId })
    };

    console.log('Uploading file:', {
      filename: file.name,
      size: file.size,
      type: file.type,
      base64Length: base64Data.length
    });

    const response = await api.post('/api/documents/upload/', payload, {
      headers: {
        'Content-Type': 'application/json',
      },
      onUploadProgress: (progressEvent) => {
        const percentCompleted = Math.round(
          (progressEvent.loaded * 100) / (progressEvent.total || 0)
        );
        console.log('Upload progress:', percentCompleted + '%');
      },
    });

    return response.data;
  } catch (error: any) {
    const errorDetail = error.response?.data?.detail || error.response?.data?.error_message || error.response?.data?.error || error.message;
    console.error('Upload error:', {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
      detail: errorDetail,
      error_type: error.response?.data?.error_type,
      stack: error.stack
    });
    // Throw a more descriptive error
    const enhancedError = new Error(errorDetail || error.message);
    (enhancedError as any).response = error.response;
    throw enhancedError;
  }
};

// User Registration
export const registerUser = async (userData: {
  email: string;
  password: string;
  confirm_password: string;
  first_name: string;
  last_name: string;
  phone?: string;
  description?: string;
  preferred_contact_methods?: string[];
  preferred_language?: string;
  // kept optional for backward compatibility; not sent to API
  username?: string;
}) => {
  try {
    // Transform frontend data to match backend API
    const apiData = {
      email: userData.email,
      password: userData.password,
      confirm_password: userData.confirm_password,
      first_name: userData.first_name,
      last_name: userData.last_name,
      phone: userData.phone,
      preferred_language: userData.preferred_language,
      preferred_contact_methods: userData.preferred_contact_methods,
      description: userData.description
    };

    const response = await api.post("/api/users/auth/signup", apiData, {
      headers: {
        "Content-Type": "application/json",
      },
    });
    
    console.log("Sending payload:", apiData);
    console.log("Signup raw response:", response.status, response.data);

    // Transform backend response to match frontend expectations (session-based)
    const d = response.data;
    return {
      status: response.status >= 200 && response.status < 300,
      message: d?.message ?? 'Registration completed',
      sessionId: d?.session_id,
      ttlSeconds: d?.ttl_seconds,
      cooldownWaitSeconds: d?.cooldown_wait_seconds,
      user: d?.user,
      accessToken: d?.access,
      refreshToken: d?.refresh,
    };
 
  } catch (error: any) {
    console.error("Registration error:", error.response?.data || error.message);
    throw error.response?.data || error.message;
  }
};

// Email Verification - TODO: Implement in backend
// export const verifyEmail = async (token: string, email: string) => {
//   try {
//     const response = await api.get(`/email-verify`, {
//       params: { token, email },
//     });
//     return response.data;
//   } catch (error: any) {
//     throw error.response?.data || error.message;
//   }
// };

// User Login
/** Sign in with Google (credential JWT from Google Identity Services). */
export const loginWithGoogle = async (credential: string) => {
  try {
    const response = await api.post('/api/users/auth/google', { credential });
    return {
      status: Boolean(response.data?.access),
      message: response.data?.message ?? (response.data?.access ? 'Signed in' : 'Sign-in failed'),
      accessToken: response.data.access,
      refreshToken: response.data.refresh,
      userId: response.data.user.id,
      firstName: response.data.user.first_name,
      user: response.data.user,
    };
  } catch (error: any) {
    console.error('Google sign-in error:', error.response?.data || error.message);
    throw error.response?.data || error.message;
  }
};

export const loginUser = async (credentials: { identifier: string; password: string }) => {
  try {
    const response = await api.post('/api/users/auth/login', credentials);
    
    // Transform backend response to match frontend expectations
    return {
      status: Boolean(response.data?.access),
      message: response.data?.message ?? (response.data?.access ? "Login successful!" : "Login failed"),
      accessToken: response.data.access,
      refreshToken: response.data.refresh,
      userId: response.data.user.id,
      firstName: response.data.user.first_name,
      user: response.data.user
    };
  } catch (error: any) {
    console.error("Login error:", error.response?.data || error.message);
    throw error.response?.data || error.message;
  }
};

// Send OTP for account verification
export const sendOtp = async (payload: { identifier: string }) => {
  try {
    const response = await api.post('/api/users/auth/send-otp', payload);
    return response.data;
  } catch (error: any) {
    console.error("Send OTP error:", error.response?.data || error.message);
    throw error.response?.data || error.message;
  }
};

// Verify OTP for account verification
export const verifyOtp = async (payload: { session_id: string; code: string }) => {
  try {
    const response = await api.post('/api/users/auth/verify-otp', payload);
    return response.data;
  } catch (error: any) {
    console.error("Verify OTP error:", error.response?.data || error.message);
    throw error.response?.data || error.message;
  }
};

// Refresh Token
export const refreshAccessToken = async () => {
  try {
    const refresh = localStorage.getItem('refreshToken');
    const response = await api.post('/api/users/auth/refresh', { refresh });
    const newAccess = response.data?.access;
    if (newAccess) {
      localStorage.setItem('accessToken', newAccess);
    }
    return {
      ...response.data,
      status: !!newAccess,
      accessToken: newAccess,
    };
  } catch (error) {
    console.error('Token refresh error:', error);
    throw error;
  }
};

// Logout User
export const logoutUser = async () => {
  try {
    const response = await api.post('/api/users/auth/logout');
    return response.data;
  } catch (error) {
    console.error('Logout error:', error);
    throw error;
  }
};

// Update fetchUserInfo to use apiClient
export const fetchUserInfo = async (userId) => {
  try {
    const response = await api.get(`/api/users/auth/me`);
    return response.data;
  } catch (error) {
    console.error('Error fetching user info:', error);
    throw error;
  }
};

// Update user details
export const updateUserInfo = async (userId, updatedData) => {
  try {
    // Remove restricted fields before sending the request
    const { email: _, username: __, password: ___, verificationToken: ____, ...allowedUpdates } = updatedData;

    console.log("📤 Sending update request:", allowedUpdates);

    const response = await api.patch(`/api/users/auth/update`, allowedUpdates, {
      headers: {
        "Content-Type": "application/json",
      },
    });

    console.log("✅ User updated successfully:", response.data);
    return response.data;
  } catch (error) {
    console.error("❌ Update user error:", error.response?.data || error.message);
    throw error.response?.data || { msg: "An unknown error occurred" };
  }
};

// ==================== Chat API ====================

/**
 * Create a chat message and get stream_id for SSE streaming
 * @param message - User's message
 * @param conversationId - Optional existing conversation ID
 * @returns Object with stream_id, conversation_id, and user_files
 */
export const createChatMessage = async (message: string, conversationId?: number) => {
  try {
    const response = await api.post('/api/chat/', {
      message,
      ...(conversationId && { conversation_id: conversationId })
    });
    return response.data;
  } catch (error: any) {
    console.error("Create chat message error:", error.response?.data || error.message);
    throw error.response?.data || error.message;
  }
};

/**
 * Stream chat response using Server-Sent Events (SSE)
 * @param streamId - Stream ID from createChatMessage
 * @param onMessage - Callback for each word received
 * @param onDone - Callback when stream completes
 * @param onError - Callback for errors
 * @returns EventSource instance (can be used to close connection)
 */
export const streamChatResponse = (
  streamId: string,
  onMessage: (word: string) => void,
  onDone: () => void,
  onError: (error: string) => void
): EventSource => {
  const token = localStorage.getItem('accessToken') || '';
  const url = `${API_BASE_URL}/api/chat/stream/${streamId}/?token=${token}`;
  
  const eventSource = new EventSource(url);

  eventSource.onmessage = (event) => {
    if (event.data === '[END]') {
      eventSource.close();
      onDone();
    } else {
      onMessage(event.data);
    }
  };

  eventSource.addEventListener('done', () => {
    eventSource.close();
    onDone();
  });

  eventSource.addEventListener('error', (event: any) => {
    eventSource.close();
    onError(event.data || 'Stream error');
  });

  eventSource.onerror = (error) => {
    console.error('EventSource error:', error);
    eventSource.close();
    onError('Connection error');
  };

  return eventSource;
};

// ==================== Document API ====================

/**
 * Get list of user's documents
 */
export const getDocuments = async () => {
  try {
    const response = await api.get('/api/documents/');
    return response.data;
  } catch (error: any) {
    console.error("Get documents error:", error.response?.data || error.message);
    throw error.response?.data || error.message;
  }
};

/** Attach AI summary to an uploaded document (Your Reports). */
export const updateDocumentSummary = async (documentId: string, summary: string) => {
  const response = await api.patch(`/api/documents/${documentId}/`, { summary });
  return response.data;
};

/** Public KB: pricing tiers + FAQ (from FastAPI `local_info_patch.json`). */
export type LocalInfoPricingTier = {
  name?: string;
  price?: string;
  description?: string;
  link?: string;
};

export type LocalInfoFaqItem = { question: string; answer: string };

export type LocalInfoResponse = {
  pricing: Record<string, LocalInfoPricingTier>;
  faq: {
    security?: string;
    privacy?: string;
    refund?: string;
    items: LocalInfoFaqItem[];
  };
};

export const fetchLocalInfo = async (): Promise<LocalInfoResponse> => {
  const response = await api.get('/api/local-info');
  return response.data;
};

// ==================== Summary API ====================

/**
 * Generate summary from document or raw text
 * @param data - Object with session_id, raw_text, or document_id
 */
export const generateSummary = async (data: {
  session_id?: string;
  raw_text?: string;
  document_id?: number;
}) => {
  try {
    const response = await api.post('/api/summaries/generate/', data);
    return response.data;
  } catch (error: any) {
    console.error("Generate summary error:", error.response?.data || error.message);
    throw error.response?.data || error.message;
  }
};

// ==================== Retrieval API ====================

/**
 * Lookup treatment cost information
 * @param treatment - Treatment name
 */
export const lookupCost = async (treatment: string) => {
  try {
    const response = await api.get(`/api/retrieval/cost/?treatment=${encodeURIComponent(treatment)}`);
    return response.data;
  } catch (error: any) {
    console.error("Cost lookup error:", error.response?.data || error.message);
    throw error.response?.data || error.message;
  }
};

/**
 * Search hospitals
 * @param query - Search query
 * @param city - Optional city filter
 */
export const searchHospitals = async (query: string, city?: string) => {
  try {
    const params = new URLSearchParams({ q: query });
    if (city) params.append('city', city);
    const response = await api.get(`/api/retrieval/hospitals/?${params.toString()}`);
    return response.data;
  } catch (error: any) {
    console.error("Hospital search error:", error.response?.data || error.message);
    throw error.response?.data || error.message;
  }
};

// ==================== Telemetry API ====================

/**
 * Log funnel event for analytics
 * @param data - Event data with event_type, session_id, source, metadata
 */
export const logFunnelEvent = async (data: {
  session_id?: string;
  event_type: string;
  source?: string;
  metadata?: Record<string, any>;
}) => {
  try {
    const response = await api.post('/api/telemetry/funnel/', data);
    return response.data;
  } catch (error: any) {
    console.error("Log funnel event error:", error.response?.data || error.message);
    throw error.response?.data || error.message;
  }
};

// ==================== Accounts API ====================

/**
 * Get or create a session ID
 * @param sessionId - Optional existing session ID
 */
export const ensureSession = async (sessionId?: string) => {
  try {
    const url = sessionId 
      ? `/api/accounts/session/?session_id=${sessionId}`
      : '/api/accounts/session/';
    const response = await api.get(url);
    return response.data;
  } catch (error: any) {
    console.error("Ensure session error:", error.response?.data || error.message);
    throw error.response?.data || error.message;
  }
};

// ==================== Zoctor FastAPI (Mem_Update backend) ====================

async function authHeadersJson(): Promise<HeadersInit> {
  const token =
    typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
  const h: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) h.Authorization = `Bearer ${token}`;
  return h;
}

/** Extract text from a PDF via FastAPI (requires auth). */
export const zoctorExtractPdfText = async (
  file: File
): Promise<{ text: string; pages?: number }> => {
  const base64Data = await fileToBase64(file);
  const res = await fetch(`${apiV1Base()}/reports/pdf-text`, {
    method: 'POST',
    headers: await authHeadersJson(),
    body: JSON.stringify({ file_base64: base64Data, filename: file.name }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data?.message || data?.detail || `PDF extract failed (${res.status})`);
  }
  return data;
};

/** Run summary pipeline (GCS + LLM) on raw report text. */
export const zoctorGenerateSummary = async (payload: {
  user_id: string;
  raw_text: string;
  session_id?: string;
  tier?: string;
  location?: string;
  region?: string;
}) => {
  const res = await fetch(`${apiV1Base()}/chat/summary`, {
    method: 'POST',
    headers: await authHeadersJson(),
    body: JSON.stringify({
      user_id: payload.user_id,
      raw_text: payload.raw_text,
      session_id: payload.session_id,
      tier: payload.tier,
      location: payload.location,
      region: payload.region,
    }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data?.message || data?.detail || `Summary failed (${res.status})`);
  }
  return data;
};

/** Non-streaming RAG reply. */
export const zoctorChatReply = async (payload: {
  user_id: string;
  message: string;
  context?: string;
  funnel_stage?: string;
  tier?: string;
  session_id?: string;
  location?: string;
  region?: string;
}) => {
  const res = await fetch(`${apiV1Base()}/chat/reply`, {
    method: 'POST',
    headers: await authHeadersJson(),
    body: JSON.stringify({
      user_id: payload.user_id,
      message: payload.message,
      context: payload.context ?? '',
      funnel_stage: payload.funnel_stage,
      tier: payload.tier,
      session_id: payload.session_id,
      location: payload.location,
      region: payload.region,
    }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data?.message || data?.detail || `Chat failed (${res.status})`);
  }
  return data as { reply: string };
};

export const listFamilyProfiles = async (userId: string) => {
  const res = await fetch(
    `${String(API_BASE_URL).replace(/\/$/, '')}/api/paid-reports/profiles/${encodeURIComponent(userId)}`,
    { headers: await authHeadersJson(), method: 'GET' }
  );
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data?.message || data?.detail || `Profiles failed (${res.status})`);
  }
  return data as { profiles: any[]; count: number };
};

export const addFamilyProfile = async (
  userId: string,
  body: { name: string; relation: string }
) => {
  const res = await fetch(
    `${String(API_BASE_URL).replace(/\/$/, '')}/api/paid-reports/profiles/${encodeURIComponent(userId)}`,
    {
      method: 'POST',
      headers: await authHeadersJson(),
      body: JSON.stringify({ name: body.name, relation: body.relation }),
    }
  );
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data?.message || data?.detail || `Add profile failed (${res.status})`);
  }
  return data;
};

export const deleteFamilyProfile = async (userId: string, profileId: string) => {
  const res = await fetch(
    `${String(API_BASE_URL).replace(
      /\/$/,
      ''
    )}/api/paid-reports/profiles/${encodeURIComponent(userId)}/${encodeURIComponent(profileId)}`,
    { method: 'DELETE', headers: await authHeadersJson() }
  );
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data?.message || data?.detail || `Delete profile failed (${res.status})`);
  }
  return data;
};

const paidReportsBase = () => `${String(API_BASE_URL).replace(/\/$/, '')}/api/paid-reports`;

/** Tier-1 Health Reveal: start simulated payment (use skip_report_check in dev without Firestore uploads). */
export const initiatePaidReport = async (
  userId: string,
  payload: { profile_id?: string | null; tier?: string; skip_report_check?: boolean } = {}
) => {
  const res = await fetch(`${paidReportsBase()}/initiate/${encodeURIComponent(userId)}`, {
    method: 'POST',
    headers: await authHeadersJson(),
    body: JSON.stringify({
      tier: payload.tier ?? 'tier_1',
      profile_id: payload.profile_id ?? null,
      skip_report_check: payload.skip_report_check ?? false,
    }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(
      (data as { message?: string })?.message ||
        (data as { detail?: string })?.detail ||
        `Initiate paid report failed (${res.status})`
    );
  }
  return data as Record<string, unknown>;
};

/** Confirm simulated payment (dev: use confirmation "confirm payment") and generate Tier-1 PDF on server. */
export const confirmPaidReport = async (
  userId: string,
  body: {
    payment_id: string;
    confirmation: string;
    patient_name?: string;
    language?: string;
    profile_id?: string | null;
    report_text?: string | null;
  }
) => {
  const res = await fetch(`${paidReportsBase()}/confirm/${encodeURIComponent(userId)}`, {
    method: 'POST',
    headers: await authHeadersJson(),
    body: JSON.stringify({
      payment_id: body.payment_id,
      confirmation: body.confirmation,
      patient_name: body.patient_name,
      language: body.language ?? 'en',
      profile_id: body.profile_id ?? null,
      report_text: body.report_text ?? null,
    }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(
      (data as { message?: string })?.message ||
        (data as { detail?: string })?.detail ||
        `Confirm paid report failed (${res.status})`
    );
  }
  return data as Record<string, unknown>;
};

/** Authenticated order status (safe: only returns data if order belongs to current user). */
export const getMyPaidOrderStatus = async (paymentId: string) => {
  const res = await fetch(`${paidReportsBase()}/me/order/${encodeURIComponent(paymentId)}`, {
    method: 'GET',
    headers: await authHeadersJson(),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(
      (data as { message?: string })?.message ||
        (data as { detail?: string })?.detail ||
        `Order status failed (${res.status})`
    );
  }
  return data as {
    found: boolean;
    status?: string;
    payment_id?: string;
    tier?: string;
    download_ready?: boolean;
    message?: string;
    created_at?: string;
    completed_at?: string;
  };
};

/** Download server-generated Tier-1 PDF (requires completed order). */
export const downloadPaidReportPdf = async (paymentId: string, filename?: string) => {
  if (typeof window === 'undefined') return;
  const res = await fetch(`${paidReportsBase()}/download/${encodeURIComponent(paymentId)}`, {
    method: 'GET',
    headers: await authHeadersJson(),
  });
  if (!res.ok) {
    const errText = await res.text();
    let msg = errText;
    try {
      const j = JSON.parse(errText) as { message?: string; detail?: string };
      msg = j?.message || j?.detail || errText;
    } catch {
      /* ignore */
    }
    throw new Error(msg || `Download failed (${res.status})`);
  }
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename || `Zoctor_Health_Reveal_${paymentId.replace(/[^a-zA-Z0-9_-]/g, '_').slice(-24)}.pdf`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export { normalizeApiError } from './apiErrors';

export default api;