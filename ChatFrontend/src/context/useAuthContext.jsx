import { createContext, useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCookie, setCookie, deleteCookie, hasCookie } from 'cookies-next';

const AuthContext = createContext(undefined);

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const navigate = useNavigate();

  // Retrieve session from access token instead of authSessionKey
  const getSession = () => {
    return hasCookie("access_token"); // Check if access token exists
  };

  const [isAuthenticated, setIsAuthenticated] = useState(getSession());

  // Save session
  const saveSession = (sessionData) => {
    setCookie("access_token", sessionData.access);
    setCookie("refresh_token", sessionData.refresh);
    setCookie("user", sessionData.user); // contains id, username, email
    setIsAuthenticated(true); // Set auth state
  };

  // Remove session
  const removeSession = async () => {
    try {
      deleteCookie("access_token");
      deleteCookie("refresh_token");
      deleteCookie("user");
      
      setIsAuthenticated(false); // Update auth state
      
      navigate("/login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, saveSession, removeSession }}>
      {children}
    </AuthContext.Provider>
  );
};
