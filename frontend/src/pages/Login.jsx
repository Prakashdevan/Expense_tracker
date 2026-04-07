import { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import { Wallet } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', padding: '24px', justifyContent: 'center' }}>
      <div className="glass-panel animate-fade" style={{ textAlign: 'center' }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
          <div style={{ background: 'var(--primary-color)', padding: '16px', borderRadius: '20px' }}>
            <Wallet size={40} color="white" />
          </div>
        </div>
        <h1 style={{ marginBottom: '8px', fontSize: '28px' }}>Smart Expense</h1>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '32px' }}>Welcome back! Please login.</p>
        
        {error && <p style={{ color: 'var(--expense-color)', marginBottom: '16px' }}>{error}</p>}

        <form onSubmit={handleSubmit}>
          <input 
            type="email" 
            placeholder="Email Address" 
            className="input-field"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input 
            type="password" 
            placeholder="Password" 
            className="input-field"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button type="submit" className="btn" style={{ marginTop: '16px' }}>Login</button>
        </form>

        <p style={{ marginTop: '24px', color: 'var(--text-secondary)' }}>
          Don't have an account? <Link to="/register" style={{ color: 'var(--primary-color)', textDecoration: 'none', fontWeight: 600 }}>Sign up</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
