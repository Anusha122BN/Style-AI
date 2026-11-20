import React, { createContext, useContext, useState, useEffect } from 'react';
import { api, getAuthToken, setAuthToken, removeAuthToken } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Stored analysis in current session
  const [singlePhotoAnalysis, setSinglePhotoAnalysis] = useState(() => {
    const saved = sessionStorage.getItem('styleai_single_photo_analysis') || sessionStorage.getItem('aura_single_photo_analysis');
    return saved ? JSON.parse(saved) : null;
  });

  const [bodyAnalysis, setBodyAnalysis] = useState(() => {
    const saved = sessionStorage.getItem('styleai_body_analysis') || sessionStorage.getItem('aura_body_analysis');
    return saved ? JSON.parse(saved) : null;
  });

  const [skinAnalysis, setSkinAnalysis] = useState(() => {
    const saved = sessionStorage.getItem('styleai_skin_analysis') || sessionStorage.getItem('aura_skin_analysis');
    return saved ? JSON.parse(saved) : null;
  });

  const [selectedCategory, setSelectedCategoryState] = useState(() => {
    return sessionStorage.getItem('styleai_selected_category') || sessionStorage.getItem('aura_selected_category') || 'Traditional Wear';
  });

  const setSelectedCategory = (cat) => {
    setSelectedCategoryState(cat);
    sessionStorage.setItem('styleai_selected_category', cat);
  };

  useEffect(() => {
    const initAuth = async () => {
      const token = getAuthToken();
      if (token) {
        try {
          const profile = await api.getMe();
          setUser(profile);
        } catch (e) {
          removeAuthToken();
          setUser(null);
        }
      }
      setLoading(false);
    };
    initAuth();
  }, []);

  const login = async (email, password) => {
    const data = await api.login({ email, password });
    setAuthToken(data.access_token);
    setUser(data.user);
    return data;
  };

  const signup = async (payload) => {
    const data = await api.signup(payload);
    setAuthToken(data.access_token);
    setUser(data.user);
    return data;
  };

  const logout = () => {
    removeAuthToken();
    setUser(null);
    sessionStorage.removeItem('styleai_single_photo_analysis');
    sessionStorage.removeItem('styleai_body_analysis');
    sessionStorage.removeItem('styleai_skin_analysis');
    sessionStorage.removeItem('styleai_selected_category');
    sessionStorage.removeItem('aura_single_photo_analysis');
    sessionStorage.removeItem('aura_body_analysis');
    sessionStorage.removeItem('aura_skin_analysis');
    sessionStorage.removeItem('aura_selected_category');
    setSinglePhotoAnalysis(null);
    setBodyAnalysis(null);
    setSkinAnalysis(null);
  };

  const updateProfile = async (updates) => {
    const updated = await api.updateProfile(updates);
    setUser(updated);
    return updated;
  };

  const saveSinglePhotoAnalysis = (data) => {
    setSinglePhotoAnalysis(data);
    sessionStorage.setItem('styleai_single_photo_analysis', JSON.stringify(data));

    // Synchronize body analysis
    if (data.measurements && data.classification) {
      const bodyData = {
        status: data.status,
        gender: data.gender,
        measurements: data.measurements,
        classification: data.classification,
        annotated_landmark_image: data.annotated_landmark_image,
        privacy_notice: data.privacy_notice
      };
      setBodyAnalysis(bodyData);
      sessionStorage.setItem('styleai_body_analysis', JSON.stringify(bodyData));
    }

    // Synchronize skin analysis if face was detected
    if (data.face_detected && data.skin_analysis) {
      setSkinAnalysis(data.skin_analysis);
      sessionStorage.setItem('styleai_skin_analysis', JSON.stringify(data.skin_analysis));
    }
  };

  const saveBodyAnalysis = (data) => {
    setBodyAnalysis(data);
    sessionStorage.setItem('styleai_body_analysis', JSON.stringify(data));
  };

  const saveSkinAnalysis = (data) => {
    setSkinAnalysis(data);
    sessionStorage.setItem('styleai_skin_analysis', JSON.stringify(data));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        signup,
        logout,
        updateProfile,
        singlePhotoAnalysis,
        saveSinglePhotoAnalysis,
        bodyAnalysis,
        saveBodyAnalysis,
        skinAnalysis,
        saveSkinAnalysis,
        selectedCategory,
        setSelectedCategory,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
