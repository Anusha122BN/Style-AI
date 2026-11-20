const API_BASE = '/api';

export const getAuthToken = () => localStorage.getItem('styleai_token') || localStorage.getItem('aura_token');
export const setAuthToken = (token) => {
  localStorage.setItem('styleai_token', token);
};
export const removeAuthToken = () => {
  localStorage.removeItem('styleai_token');
  localStorage.removeItem('aura_token');
};

const authHeaders = () => {
  const token = getAuthToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

/**
 * Safely parses the HTTP response without crashing if the body is empty,
 * HTML, or non-JSON. Extracts descriptive error details when !res.ok.
 */
async function handleResponse(res, defaultErrorMsg = 'Request failed') {
  let text = '';
  try {
    text = await res.text();
  } catch (err) {
    throw new Error(`Network read error: ${err.message}`);
  }

  let data = null;
  if (text && text.trim().length > 0) {
    try {
      data = JSON.parse(text);
    } catch {
      data = null;
    }
  }

  if (!res.ok) {
    let errorMsg = defaultErrorMsg;
    if (data) {
      if (typeof data.detail === 'string') {
        errorMsg = data.detail;
      } else if (Array.isArray(data.detail) && data.detail.length > 0) {
        errorMsg = data.detail
          .map((d) => (typeof d === 'string' ? d : d.msg || JSON.stringify(d)))
          .join(', ');
      } else if (data.message) {
        errorMsg = data.message;
      } else if (data.error) {
        errorMsg = data.error;
      }
    } else if (text && text.trim().length > 0 && text.length < 250) {
      errorMsg = text.trim();
    } else {
      errorMsg = `${defaultErrorMsg} (HTTP ${res.status})`;
    }
    const error = new Error(errorMsg);
    error.status = res.status;
    error.data = data;
    throw error;
  }

  return data !== null ? data : {};
}

/**
 * Robust wrapper around fetch with network failure protection.
 */
async function safeFetch(url, options = {}, defaultErrorMsg = 'Request failed') {
  let res;
  try {
    res = await fetch(url, options);
  } catch (netErr) {
    throw new Error(
      'Unable to connect to the Style AI backend server. Please verify that the server is running on http://127.0.0.1:8000'
    );
  }
  return handleResponse(res, defaultErrorMsg);
}

export const api = {
  // Auth
  async signup(data) {
    return safeFetch(
      `${API_BASE}/auth/signup`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      },
      'Signup failed. Please try again.'
    );
  },

  async login(data) {
    return safeFetch(
      `${API_BASE}/auth/login`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      },
      'Login failed. Please verify credentials.'
    );
  },

  async getMe() {
    return safeFetch(
      `${API_BASE}/auth/me`,
      {
        headers: { ...authHeaders() },
      },
      'Session invalid'
    );
  },

  async updateProfile(updates) {
    return safeFetch(
      `${API_BASE}/auth/profile`,
      {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body: JSON.stringify(updates),
      },
      'Profile update failed'
    );
  },

  async forgotPassword(email) {
    return safeFetch(
      `${API_BASE}/auth/forgot-password`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      },
      'Failed to request reset token'
    );
  },

  async resetPassword(email, reset_token, new_password) {
    return safeFetch(
      `${API_BASE}/auth/reset-password`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, reset_token, new_password }),
      },
      'Password reset failed'
    );
  },

  async deleteAccount() {
    return safeFetch(
      `${API_BASE}/auth/account`,
      {
        method: 'DELETE',
        headers: { ...authHeaders() },
      },
      'Account deletion failed'
    );
  },

  // CV Analysis
  async analyzeSinglePhoto(formData) {
    return safeFetch(
      `${API_BASE}/cv/analyze-single-photo`,
      {
        method: 'POST',
        body: formData,
      },
      'Photo analysis failed. Please ensure your body is fully visible.'
    );
  },

  async analyzeBody(formData) {
    return safeFetch(
      `${API_BASE}/cv/analyze-body`,
      {
        method: 'POST',
        body: formData,
      },
      'Body analysis failed'
    );
  },

  async analyzeSkin(formData) {
    return safeFetch(
      `${API_BASE}/cv/analyze-skin`,
      {
        method: 'POST',
        body: formData,
      },
      'Skin analysis failed'
    );
  },

  // Recommendations
  async getFashionRecommendations({ gender, bodyShape, category, occasions, budgetTier, favoriteColors }) {
    const params = new URLSearchParams({
      gender: gender || 'women',
      body_shape: bodyShape || 'Hourglass',
    });
    if (category && category !== 'All') params.append('category', category);
    if (occasions && occasions.length) params.append('occasions', occasions.join(','));
    if (budgetTier && budgetTier !== 'All') params.append('budget_tier', budgetTier);
    if (favoriteColors && favoriteColors.length) params.append('favorite_colors', favoriteColors.join(','));

    return safeFetch(
      `${API_BASE}/recommendations/fashion?${params.toString()}`,
      {},
      'Failed to fetch fashion recommendations'
    );
  },

  async getMakeupRecommendations({ monkToneId, undertone, makeupStyle }) {
    const params = new URLSearchParams({
      monk_tone_id: monkToneId || 'MST-04',
      undertone: undertone || 'Warm',
      makeup_style: makeupStyle || 'Office makeup',
    });
    return safeFetch(
      `${API_BASE}/recommendations/makeup?${params.toString()}`,
      {},
      'Failed to fetch makeup recommendations'
    );
  },

  async getColorPalette({ monkToneId, undertone }) {
    const params = new URLSearchParams({
      monk_tone_id: monkToneId || 'MST-04',
      undertone: undertone || 'Warm',
    });
    return safeFetch(
      `${API_BASE}/recommendations/palette?${params.toString()}`,
      {},
      'Failed to fetch color palette'
    );
  },

  // XAI Explanations
  async explainDress({ dressId, gender, bodyShape, measurements }) {
    const params = new URLSearchParams({
      dress_id: dressId,
      gender: gender || 'women',
      body_shape: bodyShape || 'Hourglass',
      shoulder_to_hip_ratio: measurements?.shoulder_to_hip_ratio || 1.0,
      waist_to_hip_ratio: measurements?.waist_to_hip_ratio || 0.74,
      torso_to_leg_ratio: measurements?.torso_to_leg_ratio || 0.65,
      shoulder_width_cm: measurements?.shoulder_width_cm || 38.0,
      hip_width_cm: measurements?.hip_width_cm || 38.0,
      waist_width_cm: measurements?.waist_width_cm || 28.0,
    });
    return safeFetch(
      `${API_BASE}/xai/explain-dress?${params.toString()}`,
      {},
      'Explanation request failed'
    );
  },

  async getCounterfactuals({ gender, bodyShape, measurements }) {
    const params = new URLSearchParams({
      gender: gender || 'women',
      body_shape: bodyShape || 'Hourglass',
      shoulder_to_hip_ratio: measurements?.shoulder_to_hip_ratio || 1.0,
      waist_to_hip_ratio: measurements?.waist_to_hip_ratio || 0.74,
    });
    return safeFetch(
      `${API_BASE}/xai/counterfactuals?${params.toString()}`,
      {},
      'Counterfactuals request failed'
    );
  },

  // Shopping
  async getShoppingLinks(query, category = '', color = '') {
    const params = new URLSearchParams({ query, category, color });
    return safeFetch(
      `${API_BASE}/shopping/links?${params.toString()}`,
      {},
      'Failed to generate shopping links'
    );
  },

  // Feedback & Privacy
  async submitFeedback(payload) {
    return safeFetch(
      `${API_BASE}/feedback`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      },
      'Failed to submit feedback'
    );
  },

  async getPrivacyPolicy() {
    return safeFetch(
      `${API_BASE}/privacy/policy`,
      {},
      'Failed to load privacy policy'
    );
  },

  // Multilingual AI Stylist Chat
  async sendChatMessage(payload) {
    return safeFetch(
      `${API_BASE}/chat`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...authHeaders(),
        },
        body: JSON.stringify(payload),
      },
      'Failed to send chat message'
    );
  },
};
