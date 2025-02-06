// import React, { useState } from 'react';
// import { Link } from 'react-router-dom';
// import '../styles/LoginForm.css';

// const LoginForm = () => {
//   const [username, setUsername] = useState('');
//   const [password, setPassword] = useState('');

//   const handleSubmit = (e) => {
//     e.preventDefault();
//     // Implement login logic here
//     console.log('Login with:', username, password);
//   };

//   return (
//     <form className="login-form" onSubmit={handleSubmit}>
//       <h2>Login</h2>
//       <input
//         type="text"
//         placeholder="Username"
//         value={username}
//         onChange={(e) => setUsername(e.target.value)}
//         required
//       />
//       <input
//         type="password"
//         placeholder="Password"
//         value={password}
//         onChange={(e) => setPassword(e.target.value)}
//         required
//       />
//       <button type="submit">Login</button>
//       <p>
//         Don't have an account? <Link to="/signup">Sign up</Link>
//       </p>
//     </form>
//   );
// };

// export default LoginForm;


import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthContext } from '../context/useAuthContext';
import { login } from '../api/auth';
import '../styles/LoginForm.css';

const LoginForm = () => {
  const [username, setUsername] = useState('testuser3');
  const [password, setPassword] = useState('securepassword123');
  const [error, setError] = useState(null);
  
  const { saveSession } = useAuthContext(); // Get saveSession from AuthContext
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null); // Clear previous errors

    try {
      const result = await login({ username, password }); // Call login API
      console.log('login result = ',result);
      saveSession(result); // Store session data in AuthContext
      navigate('/home'); // Redirect user after successful login
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    }
  };

  return (
    <form className="login-form" onSubmit={handleSubmit}>
      <h2>Login</h2>

      {error && <p className="error">{error}</p>}

      <input
        type="text"
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        required
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />
      
      <button type="submit">Login</button>

      <p>
        Don't have an account? <Link to="/signup">Sign up</Link>
      </p>
    </form>
  );
};

export default LoginForm;
