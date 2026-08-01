import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import Login from './components/login';
import Registration from './components/regisration';
import ForgotPassword from './components/ForgotPassword';
import ResetPassword from './components/ResetPassword';
import './App.css';

function Navigation() {
  const location = useLocation();
  return (
    <nav className="navbar">
      <div className="nav-brand"></div>
      <div className="nav-links">
        <Link to="/login" className={location.pathname === '/login' || location.pathname === '/' ? 'active' : ''}>Login</Link>
        <Link to="/register" className={location.pathname === '/register' ? 'active' : ''}>Register</Link>
      </div>
    </nav>
  );
}

function App() {
  return (
    <Router>
      <div className="app-container">
        <div className="glass-panel">
          <Navigation />
          <div className="page-content">
            <Routes>
              <Route path="/" element={<Login />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Registration />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password/:token" element={<ResetPassword />} />
            </Routes>
          </div>
        </div>
      </div>
    </Router>
  );
}

export default App;
