// import React, { useState } from 'react';
// import { Link } from 'react-router-dom';
// import '../styles/SignupForm.css';

// const SignupForm = () => {
//   const [username, setUsername] = useState('');
//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');
//   const [confirmPassword, setConfirmPassword] = useState('');

//   const handleSubmit = (e) => {
//     e.preventDefault();
    
//     if (password !== confirmPassword) {
//       alert("Passwords do not match!");
//       return;
//     }

//     // Implement signup logic here
//     console.log('Signup with:', { username, email, password });
//   };

//   return (
//     <form className="signup-form" onSubmit={handleSubmit}>
//       <h2>Sign Up</h2>
      
//       <input
//         type="text"
//         placeholder="Username"
//         value={username}
//         onChange={(e) => setUsername(e.target.value)}
//         required
//       />

//       <input
//         type="email"
//         placeholder="Email"
//         value={email}
//         onChange={(e) => setEmail(e.target.value)}
//         required
//       />

//       <input
//         type="password"
//         placeholder="Password"
//         value={password}
//         onChange={(e) => setPassword(e.target.value)}
//         required
//       />

//       <input
//         type="password"
//         placeholder="Confirm Password"
//         value={confirmPassword}
//         onChange={(e) => setConfirmPassword(e.target.value)}
//         required
//       />

//       <button type="submit">Sign Up</button>
      
//       <p>
//         Already have an account? <Link to="/login">Login</Link>
//       </p>
//     </form>
//   );
// };

// export default SignupForm;

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signup } from '../api/auth';
import { useAuthContext } from '../context/useAuthContext';
import '../styles/SignupForm.css';

const SignupForm = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState(null);

  const navigate = useNavigate();
  const { saveSession } = useAuthContext(); // Get session management function

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      setError("Passwords do not match!");
      return;
    }

    try {
      const response = await signup({ username, email, password });
      saveSession(response); // Save access and refresh tokens
      navigate('/login'); // Redirect to homepage after successful signup
    } catch (err) {
      setError(err.response?.data?.message || "Signup failed! Please try again.");
    }
  };

  return (
    <form className="signup-form" onSubmit={handleSubmit}>
      <h2>Sign Up</h2>

      {error && <p className="error-message">{error}</p>}

      <input
        type="text"
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        required
      />

      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />

      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />

      <input
        type="password"
        placeholder="Confirm Password"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        required
      />

      <button type="submit">Sign Up</button>

      <p>
        Already have an account? <Link to="/login">Login</Link>
      </p>
    </form>
  );
};

export default SignupForm;
