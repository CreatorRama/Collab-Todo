import  { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import io from 'socket.io-client';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';
import './App.css';
const apiurl=import.meta.env.VITE_API_URL || "http://localhost:5000"
const App = () => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    if (token) {
      // Verify token and get user info
      fetch(`${apiurl}/api/users`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      .then(res => {
        if (res.ok) {
          const userData = JSON.parse(localStorage.getItem('user'));
          setUser(userData);
          
          // Initialize socket connection
          const newSocket = io(`${apiurl}`);
          setSocket(newSocket);
          
          return () => newSocket.close();
        } else {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setToken(null);
        }
      })
      .catch(err => {
        console.error('Token verification failed:', err);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setToken(null);
      });
    }
  }, [token]);

  const login = (token, userData) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setToken(token);
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
    if (socket) {
      socket.disconnect();
      setSocket(null);
    }
  };

  return (
    <Router>
      <div className="App">
        <Routes>
          <Route 
            path="/login" 
            element={!token ? <Login onLogin={login} /> : <Navigate to="/dashboard" />} 
          />
          <Route 
            path="/register" 
            element={!token ? <Register onLogin={login} /> : <Navigate to="/dashboard" />} 
          />
          <Route 
            path="/dashboard" 
            element={token ? <Dashboard user={user} token={token} socket={socket} onLogout={logout} /> : <Navigate to="/login" />} 
          />
          <Route path="/" element={<Navigate to={token ? "/dashboard" : "/login"} />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;