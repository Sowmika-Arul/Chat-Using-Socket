import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import axios from 'axios';
import './App.css';

const socket = io('http://localhost:5000'); // Connect to the backend server

function App() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [token, setToken] = useState('');
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');

  useEffect(() => {
    // Fetch chat history when the user logs in
    if (isAuthenticated) {
      axios.get('http://localhost:5000/messages', {
        headers: {
          Authorization: token
        }
      }).then(response => {
        setMessages(response.data);
      }).catch(error => {
        console.log('Error fetching messages:', error);
      });
    }

    // Listen for new messages from the server
    socket.on('message', (message) => {
      setMessages((prevMessages) => [...prevMessages, message]);
    });

    return () => {
      socket.off('message');
    };
  }, [isAuthenticated, token]);

  const handleLogin = async () => {
    try {
      const response = await axios.post('http://localhost:5000/login', {
        username,
        password
      });
      setToken(response.data.token);
      setIsAuthenticated(true);
    } catch (error) {
      console.log('Login error:', error);
    }
  };

  const handleRegister = async () => {
    try {
      await axios.post('http://localhost:5000/register', {
        username,
        password
      });
      alert('User registered, you can now log in.');
    } catch (error) {
      console.log('Registration error:', error);
    }
  };

  const sendMessage = () => {
    socket.emit('sendMessage', { sender: username, content: inputMessage });
    setInputMessage('');
  };

  return (
    <div>
      {!isAuthenticated ? (
        <div>
          <h2>Login or Register</h2>
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button onClick={handleLogin}>Login</button>
          <button onClick={handleRegister}>Register</button>
        </div>
      ) : (
        <div>
          <h2>Chat Room</h2>
          <div className="chat-box">
            {messages.map((msg, index) => (
              <div key={index}>
                <strong>{msg.sender}:</strong> {msg.content}
              </div>
            ))}
          </div>
          <input
            type="text"
            placeholder="Enter message"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
          />
          <button onClick={sendMessage}>Send</button>
        </div>
      )}
    </div>
  );
}

export default App;
