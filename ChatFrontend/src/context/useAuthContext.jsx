// import { createContext, useContext, useState } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { getCookie, setCookie, deleteCookie, hasCookie } from 'cookies-next';
// // import { logout } from '@/api/auth';  // Assuming you have an API call for logout if needed
// //import { useChatContext } from '@/context/useChatContext';

// const AuthContext = createContext(undefined);

// export const useAuthContext = () => {
//   const context = useContext(AuthContext);
//   if (context === undefined) {
//     throw new Error('useAuthContext must be used within an AuthProvider');
//   }
//   return context;
// };

// const authSessionKey = '_SS_AUTH_KEY_';

// export const AuthProvider = ({ children }) => {
//   const navigate = useNavigate();

//   // Retrieve session from cookies
//   const getSession = () => {
//     const cookieData = getCookie(authSessionKey);
//     return cookieData ? JSON.parse(cookieData) : null;
//   };

//   const [user, setUser] = useState(getSession());

//   // Save session
//   const saveSession = (sessionData) => {
//     setCookie('access_token', sessionData.access);
//     setCookie('refresh_token', sessionData.refresh);
//     // setCookie(authSessionKey, JSON.stringify(sessionData.user));
//     // setUser(sessionData.user);
//   };

//   // Remove session and call logout API
  
//   const removeSession = async () => {
//     try {
//       // Call the logout API
//       //await logout();  // Make sure you handle this API call as needed
     
//       // Delete session cookies
//       deleteCookie(authSessionKey);
//       deleteCookie('access_token');
//       deleteCookie('refresh_token');
      
//       setUser(null);  // Clear the user state
      
//       navigate('/login');  // Redirect to the login page
//     } catch (error) {
//       console.error("Logout API call failed:", error);
//       // Handle the error gracefully if necessary
//     }
//   };

//   return (
//     <AuthContext.Provider value={{ user, isAuthenticated: hasCookie(authSessionKey), saveSession, removeSession,setUser }}>
//       {children}
//     </AuthContext.Provider>
//   );
// };


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
    setIsAuthenticated(true); // Set auth state
  };

  // Remove session
  const removeSession = async () => {
    try {
      deleteCookie("access_token");
      deleteCookie("refresh_token");
      
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
