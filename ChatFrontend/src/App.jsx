import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignUpPage";
import HomePage from "./pages/HomePage";

import { GlobalProvider } from "./components/wrapper/GlobalProvider";

// Define an array of route objects
const routes = [
  { path: "/", element: <Navigate to="/login" /> }, // Redirect "/" to "/login"
  { path: "/login", element: <LoginPage /> },
  { path: "/signup", element: <SignupPage /> },
  { path: "/home", element: <HomePage /> },
];

function App() {
  return (
    <Router>
      <GlobalProvider>
        <Routes>
          {routes.map((route, index) => (
            <Route key={index} path={route.path} element={route.element} />
          ))}
        </Routes>
      </GlobalProvider>
    </Router>
  );
}

export default App;
