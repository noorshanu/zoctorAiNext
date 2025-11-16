/**
 * ZoctorAI API TypeScript Definitions
 * Base URL: https://zaidi123.pythonanywhere.com
 * Local: http://localhost:8000
 */

// ==================== Types ====================

export interface User {
  id: number;
  email: string;
  username: string;
  first_name: string;
  last_name: string;
  phone?: string;
  preferred_language?: string;
  preferred_contact_methods?: string[];
  description?: string;
  is_otp_verified: boolean;
  last_login?: string;
  date_joined: string;
}

export interface AuthTokens {
  access: string;
  refresh: string;
}

export interface AuthResponse {
  message: string;
  user: User;
  access: string;
  refresh: string;
}

export interface OTPResponse {
  message: string;
  session_id: string;
  ttl_seconds: number;
  cooldown_wait_seconds?: number;
}

// ==================== API Client Class ====================

export class ZoctorAIAPI {
  private baseUrl: string;
  private accessToken: string | null = null;
  private refreshToken: string | null = null;

  constructor(baseUrl: string = 'https://zaidi123.pythonanywhere.com') {
    this.baseUrl = baseUrl;
    // Load tokens from localStorage if available
    if (typeof window !== 'undefined') {
      this.accessToken = localStorage.getItem('access_token');
      this.refreshToken = localStorage.getItem('refresh_token');
    }
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.accessToken) {
      headers['Authorization'] = `Bearer ${this.accessToken}`;
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (response.status === 401 && this.refreshToken) {
      // Try to refresh token
      const refreshed = await this.refreshAccessToken();
      if (refreshed) {
        headers['Authorization'] = `Bearer ${this.accessToken}`;
        return fetch(url, { ...options, headers }).then((r) => r.json());
      }
    }

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'Unknown error' }));
      throw new Error(error.detail || `HTTP ${response.status}`);
    }

    return response.json();
  }

  // ==================== Authentication ====================

  async signup(data: {
    email: string;
    password: string;
    confirm_password: string;
    first_name?: string;
    last_name?: string;
    phone?: string;
    preferred_language?: string;
    preferred_contact_methods?: string[];
    description?: string;
  }): Promise<{
    message: string;
    user: User;
    session_id: string;
    ttl_seconds: number;
    cooldown_wait_seconds: number;
  }> {
    return this.request('/api/users/auth/signup', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async login(identifier: string, password: string): Promise<AuthResponse> {
    const response = await this.request<AuthResponse>('/api/users/auth/login', {
      method: 'POST',
      body: JSON.stringify({ identifier, password }),
    });
    this.setTokens(response.access, response.refresh);
    return response;
  }

  async sendOTP(identifier: string): Promise<OTPResponse> {
    return this.request('/api/users/auth/send-otp', {
      method: 'POST',
      body: JSON.stringify({ identifier }),
    });
  }

  async verifyOTP(sessionId: string, code: string): Promise<AuthResponse> {
    const response = await this.request<AuthResponse>('/api/users/auth/verify-otp', {
      method: 'POST',
      body: JSON.stringify({ session_id: sessionId, code }),
    });
    this.setTokens(response.access, response.refresh);
    return response;
  }

  async refreshAccessToken(): Promise<boolean> {
    if (!this.refreshToken) return false;

    try {
      const response = await this.request<{ access: string }>('/api/users/auth/refresh', {
        method: 'POST',
        body: JSON.stringify({ refresh: this.refreshToken }),
      });
      this.accessToken = response.access;
      if (typeof window !== 'undefined') {
        localStorage.setItem('access_token', response.access);
      }
      return true;
    } catch {
      this.logout();
      return false;
    }
  }

  async getMe(): Promise<{ user: User }> {
    return this.request('/api/users/auth/me');
  }

  async updateProfile(data: {
    first_name?: string;
    last_name?: string;
    phone?: string;
    preferred_language?: string;
    preferred_contact_methods?: string[];
    description?: string;
  }): Promise<{ user: User }> {
    return this.request('/api/users/auth/update', {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async logout(): Promise<{ message: string }> {
    const response = await this.request<{ message: string }>('/api/users/auth/logout', {
      method: 'POST',
    });
    this.clearTokens();
    return response;
  }

  private setTokens(access: string, refresh: string) {
    this.accessToken = access;
    this.refreshToken = refresh;
    if (typeof window !== 'undefined') {
      localStorage.setItem('access_token', access);
      localStorage.setItem('refresh_token', refresh);
    }
  }

  private clearTokens() {
    this.accessToken = null;
    this.refreshToken = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
    }
  }

  // ==================== Documents ====================

  async uploadDocument(data: {
    filename: string;
    data_base64: string;
    session_id?: string;
  }): Promise<{ id: number; gcs_uri: string }> {
    return this.request('/api/documents/upload/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Helper to convert File to base64
  async fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = (reader.result as string).split(',')[1];
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  // ==================== Chat ====================

  async createMessage(data: {
    message: string;
    conversation_id?: number;
  }): Promise<{
    stream_id: string;
    conversation_id: number;
    user_files: string[];
  }> {
    return this.request('/api/chat/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // SSE Stream helper
  streamChatResponse(
    streamId: string,
    onMessage: (word: string) => void,
    onDone: () => void,
    onError: (error: string) => void
  ): EventSource {
    const token = this.accessToken || '';
    const url = `${this.baseUrl}/api/chat/stream/${streamId}/?token=${token}`;
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

    return eventSource;
  }

  // ==================== Summaries ====================

  async generateSummary(data: {
    session_id?: string;
    raw_text?: string;
    document_id?: number;
  }): Promise<{
    id: number;
    summary: string;
    funnel_stage: string;
    tier: string;
    session_id: string;
  }> {
    return this.request('/api/summaries/generate/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // ==================== Retrieval ====================

  async lookupCost(treatment: string): Promise<{
    treatment: string;
    info: any;
  }> {
    return this.request(`/api/retrieval/cost/?treatment=${encodeURIComponent(treatment)}`);
  }

  async searchHospitals(query: string, city?: string): Promise<{
    results: any[];
  }> {
    const params = new URLSearchParams({ q: query });
    if (city) params.append('city', city);
    return this.request(`/api/retrieval/hospitals/?${params.toString()}`);
  }

  // ==================== Telemetry ====================

  async logFunnelEvent(data: {
    session_id?: string;
    event_type: string;
    source?: string;
    metadata?: Record<string, any>;
  }): Promise<{ id: number }> {
    return this.request('/api/telemetry/funnel/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // ==================== Accounts ====================

  async ensureSession(sessionId?: string): Promise<{ session_id: string }> {
    const url = sessionId
      ? `/api/accounts/session/?session_id=${sessionId}`
      : '/api/accounts/session/';
    return this.request(url);
  }
}

// ==================== Usage Example ====================

/*
// Initialize API client
const api = new ZoctorAIAPI('https://zaidi123.pythonanywhere.com');

// Signup flow
try {
  const signupResponse = await api.signup({
    email: 'user@example.com',
    password: 'SecurePass123!',
    confirm_password: 'SecurePass123!',
    first_name: 'John',
    last_name: 'Doe'
  });
  
  // Verify OTP
  const otpCode = prompt('Enter OTP from email:');
  const authResponse = await api.verifyOTP(signupResponse.session_id, otpCode);
  console.log('Logged in!', authResponse.user);
} catch (error) {
  console.error('Signup failed:', error);
}

// Login flow
try {
  const authResponse = await api.login('user@example.com', 'SecurePass123!');
  console.log('Logged in!', authResponse.user);
} catch (error) {
  console.error('Login failed:', error);
}

// Upload document
const file = document.querySelector('input[type="file"]').files[0];
const base64 = await api.fileToBase64(file);
const docResponse = await api.uploadDocument({
  filename: file.name,
  data_base64: base64
});

// Chat with streaming
const chatResponse = await api.createMessage({
  message: 'What are the key findings?'
});

api.streamChatResponse(
  chatResponse.stream_id,
  (word) => console.log('Received:', word),
  () => console.log('Stream complete'),
  (error) => console.error('Stream error:', error)
);
*/

