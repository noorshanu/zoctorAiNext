import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000';

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

// Add request interceptor for debugging
api.interceptors.request.use(
  (config) => {
    console.log('Request config:', {
      url: config.url,
      method: config.method,
      headers: config.headers,
      data: config.data instanceof FormData ? 'FormData' : config.data
    });
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

// Add response interceptor for debugging
api.interceptors.response.use(
  (response) => {
    console.log('Response:', {
      status: response.status,
      headers: response.headers,
      data: response.data
    });
    return response;
  },
  (error) => {
    console.error('Response error:', {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
      headers: error.response?.headers
    });
    if (error.response?.status === 401) {
      // Handle token refresh or logout
      localStorage.removeItem('accessToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// File upload function with enhanced error handling
export const uploadFile = async (file) => {
  try {
    // Validate file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      throw new Error('File size exceeds 10MB limit');
    }

    // Validate file type
    if (file.type !== 'application/pdf') {
      throw new Error('Only PDF files are allowed');
    }

    const formData = new FormData();
    formData.append('file', file);

    // Log form data
    console.log('FormData contents:', {
      file: file.name,
      size: file.size,
      type: file.type
    });

    const response = await api.post('/uploadFile', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        const percentCompleted = Math.round(
          (progressEvent.loaded * 100) / (progressEvent.total || 0)
        );
        console.log('Upload progress:', percentCompleted + '%');
      },
    });

    return response.data;
  } catch (error) {
    console.error('Upload error:', {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
      stack: error.stack
    });
    throw error;
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
    return {
      status: response.status >= 200 && response.status < 300,
      message: response.data?.message ?? "Registration completed",
      sessionId: response.data?.session_id,
      ttlSeconds: response.data?.ttl_seconds,
      cooldownWaitSeconds: response.data?.cooldown_wait_seconds,
      user: response.data?.user
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
export const loginUser = async (credentials: { identifier: string; password: string }) => {
  try {
    const response = await api.post('/api/auth/login', credentials);
    
    // Transform backend response to match frontend expectations
    return {
      status: response.data.success,
      message: response.data.success ? "Login successful!" : "Login failed",
      accessToken: response.data.access_token,
      userId: response.data.user.user_id,
      firstName: response.data.user.first_name,
      user: response.data.user
    };
  } catch (error: any) {
    console.error("Login error:", error.response?.data || error.message);
    throw error.response?.data || error.message;
  }
};

// Refresh Token
export const refreshAccessToken = async () => {
  try {
    const response = await api.post('/api/auth/refresh');
    return response.data;
  } catch (error) {
    console.error('Token refresh error:', error);
    throw error;
  }
};

// Logout User
export const logoutUser = async () => {
  try {
    const response = await api.post('/api/auth/logout');
    return response.data;
  } catch (error) {
    console.error('Logout error:', error);
    throw error;
  }
};

// Update fetchUserInfo to use apiClient
export const fetchUserInfo = async (userId) => {
  try {
    const response = await api.get(`/api/auth/me`);
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

    const response = await api.put(`/api/auth/update`, allowedUpdates, {
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

export default api;