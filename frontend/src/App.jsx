import { useEffect, useState } from 'react';
import { BrowserRouter, useLocation, useNavigate } from 'react-router-dom';
import Dashboard from './components/dashboard';
import api from './components/api';
import './App.css';

const DEMO_ACCESS_CODE = 'KH-ADMIN-04';
const seededStaff = [
  { id: 1, name: 'George Kamau', email: 'admin01@gmail.com', role: 'admin' },

];

const demoAccounts = [
  { email: 'admin01@gmail.com', password: 'Admin#2026', role: 'admin', name: 'George Kamau' },
  { email: 'secretary@kestrellhill.edu', password: 'Secretary2026', role: 'secretary', name: 'Kestrell Hill Secretary' },
];

const blankLogin = { email: '', password: '', role: '' };
const blankRegistration = { name: '', email: '', password: '', role: '', accessCode: '' };
const blankStudent = { name: '', parentName: '', class: '', admNumber: '' };

function Stamp({ status }) {
  if (!status) return null;
  return <div className={`stamp ${status.type}`}>{status.message}</div>;
}

function Portal() {
  const navigate = useNavigate();
  const location = useLocation();
  const [mode, setMode] = useState('login');
  const [staff, setStaff] = useState(seededStaff);
  const [studentCount, setStudentCount] = useState(null);
  const [students, setStudents] = useState([]);
  const [accounts, setAccounts] = useState(demoAccounts);
  const [currentUser, setCurrentUser] = useState(null);
  const [login, setLogin] = useState(blankLogin);
  const [registration, setRegistration] = useState(blankRegistration);
  const [studentForm, setStudentForm] = useState(blankStudent);
  const [loginStatus, setLoginStatus] = useState(null);
  const [registrationStatus, setRegistrationStatus] = useState(null);
  const [studentStatus, setStudentStatus] = useState(null);
  const [forgotEmail, setForgotEmail] = useState('');
  const [resetEmail, setResetEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordStatus, setPasswordStatus] = useState(null);

  useEffect(() => {
    const loadStudentData = async () => {
      try {
        const [countResponse, studentsResponse] = await Promise.all([
          api.get('/api/dashboard/students/count'),
          api.get('/api/dashboard/students'),
        ]);

        setStudentCount(countResponse.data.studentCount ?? 0);
        setStudents(studentsResponse.data.students ?? []);
      } catch (error) {
        console.error('Unable to load the student data:', error);
        setStudentCount(0);
        setStudents([]);
      }
    };

    loadStudentData();
    const intervalId = window.setInterval(loadStudentData, 5000);

    return () => window.clearInterval(intervalId);
  }, []);

  const setModeAndClear = (nextMode) => {
    setMode(nextMode);
    setLoginStatus(null);
    setRegistrationStatus(null);
    setPasswordStatus(null);
    setStudentStatus(null);
    const targetPath = nextMode === 'login' ? '/' : nextMode === 'addStudent' ? '/add-student' : `/${nextMode}`;
    navigate(targetPath);
  };

  const signIn = (event) => {
    event.preventDefault();
    const account = accounts.find((candidate) =>
      candidate.email === login.email.trim().toLowerCase()
      && candidate.password === login.password
      && candidate.role === login.role,
    );

    if (!account) {
      setLoginStatus({ type: 'denied', message: 'DENIED' });
      return;
    }

    setCurrentUser(account);
    setLoginStatus({ type: 'approved', message: 'ACCESS GRANTED' });
    navigate(`/dashboard/${account.role}`);
  };

  const addStudent = async (event) => {
    event.preventDefault();

    if (!studentForm.name.trim() || !studentForm.class.trim() || !studentForm.admNumber.trim()) {
      setStudentStatus({ type: 'denied', message: 'CHECK DETAILS' });
      return;
    }

    try {
      const response = await api.post('/api/dashboard/students', {
        name: studentForm.name.trim(),
        parentName: studentForm.parentName.trim(),
        class: studentForm.class.trim(),
        admNumber: studentForm.admNumber.trim(),
      });

      const createdStudent = response.data.student;
      setStudents((currentStudents) => [createdStudent, ...currentStudents]);
      setStudentCount((currentCount) => (Number(currentCount) || 0) + 1);
      setStudentForm(blankStudent);
      setStudentStatus({ type: 'approved', message: 'STUDENT ADDED' });
    } catch (error) {
      console.error('Unable to add student:', error);
      setStudentStatus({ type: 'denied', message: 'FAILED TO SAVE' });
    }
  };

  const registerStaff = (event) => {
    event.preventDefault();
    const email = registration.email.trim().toLowerCase();

    if (currentUser?.role !== 'admin' || registration.accessCode !== DEMO_ACCESS_CODE) {
      setRegistrationStatus({ type: 'denied', message: 'DENIED' });
      return;
    }

    if (!registration.name.trim() || !email || !registration.password || !registration.role || staff.some((member) => member.email === email)) {
      setRegistrationStatus({ type: 'denied', message: 'CHECK DETAILS' });
      return;
    }

    setStaff((members) => [...members, {
      id: Date.now(),
      name: registration.name.trim(),
      email,
      role: registration.role,
    }]);
    setAccounts((currentAccounts) => [...currentAccounts, {
      email,
      password: registration.password,
      role: registration.role,
      name: registration.name.trim(),
    }]);
    setRegistration(blankRegistration);
    setRegistrationStatus({ type: 'approved', message: 'STAFF ADDED' });
  };

  const requestReset = (event) => {
    event.preventDefault();
    const email = forgotEmail.trim().toLowerCase();
    if (!accounts.some((account) => account.email === email)) {
      setPasswordStatus({ type: 'denied', message: 'DENIED' });
      return;
    }
    setResetEmail(email);
    setPasswordStatus({ type: 'approved', message: 'EMAIL VERIFIED' });
    window.setTimeout(() => {
      setPasswordStatus(null);
      setMode('reset');
      navigate('/reset');
    }, 700);
  };

  const resetPassword = (event) => {
    event.preventDefault();
    if (!newPassword || newPassword !== confirmPassword) {
      setPasswordStatus({ type: 'denied', message: 'PASSWORDS DIFFER' });
      return;
    }
    setAccounts((currentAccounts) => currentAccounts.map((account) =>
      account.email === resetEmail ? { ...account, password: newPassword } : account,
    ));
    setLogin({ ...blankLogin, email: resetEmail });
    setPasswordStatus({ type: 'approved', message: 'PASSWORD UPDATED' });
    window.setTimeout(() => {
      setPasswordStatus(null);
      setNewPassword('');
      setConfirmPassword('');
      setMode('login');
      navigate('/');
    }, 850);
  };

  if (location.pathname.startsWith('/dashboard') && currentUser) {
    return <Dashboard user={currentUser} staff={staff} studentCount={studentCount} students={students} onAddStudent={() => setModeAndClear('addStudent')} onRegister={() => setModeAndClear('register')} onSignOut={() => { setCurrentUser(null); setLoginStatus(null); navigate('/'); }} />;
  }

  if (location.pathname === '/add-student' && currentUser) {
    return (
      <main className="portal-shell">
        <section className="staff-roll" aria-label="Student entry guide">
          <div className="school-mark" aria-hidden="true">GA</div>
          <p className="eyebrow">Green Angels Academy</p>
          <h1>Add Student</h1>
          <p className="ledger-note">Capture a new student record directly into the live database.</p>
        </section>

        <section className="auth-area">
          <div className="auth-card">
            <header className="auth-header">
              <p className="eyebrow">Student registration</p>
              <h2>Enter new learner details</h2>
              <p>Fill in the student information below and save it instantly.</p>
            </header>

            <form className={studentStatus?.type === 'denied' ? 'shake' : ''} onSubmit={addStudent}>
              <label>Full name<input value={studentForm.name} onChange={(e) => setStudentForm({ ...studentForm, name: e.target.value })} placeholder="Student full name" required /></label>
              <label>Parent / guardian<input value={studentForm.parentName} onChange={(e) => setStudentForm({ ...studentForm, parentName: e.target.value })} placeholder="Parent or guardian name" /></label>
              <label>Class<input value={studentForm.class} onChange={(e) => setStudentForm({ ...studentForm, class: e.target.value })} placeholder="e.g. Grade 5" required /></label>
              <label>Admission number<input value={studentForm.admNumber} onChange={(e) => setStudentForm({ ...studentForm, admNumber: e.target.value })} placeholder="ADM number" required /></label>
              <button className="submit-button" type="submit">Save student <span>+</span></button>
              <Stamp status={studentStatus} />
              <button className="text-button" type="button" onClick={() => navigate('/dashboard/admin')}>Back to dashboard</button>
            </form>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="portal-shell">
      <section className="staff-roll" aria-label="Staff Roll">
        <div className="school-mark" aria-hidden="true">GA</div>
        <p className="eyebrow">Green Angels  Academy</p>
        <h1>Staff Roll</h1>
        <p className="ledger-note">Live demo ledger · resets on refresh</p>

        <div className="staff-list">
          {staff.map((member, index) => (
            <article className="staff-member" key={member.id}>
              <span className="staff-number">{String(index + 1).padStart(2, '0')}</span>
              <div>
                <h2>{member.name}</h2>
                <p>{member.email}</p>
              </div>
              <span className={`role-tag ${member.role}`}>{member.role}</span>
            </article>
          ))}
        </div>
      </section>

      <section className="auth-area">
        <div className="auth-card">
          <header className="auth-header">
            <p className="eyebrow">Secure staff portal</p>
            <h2>{mode === 'login' ? 'Sign In' : mode === 'register' ? 'Register Staff' : mode === 'forgot' ? 'Reset Password' : 'Choose a Password'}</h2>
            <p>{mode === 'login' ? 'Use a seeded account to enter the demo.' : mode === 'register' ? 'Add an Admin or Secretary to the staff roll.' : mode === 'forgot' ? 'Enter your staff email to verify your reset request.' : `Updating password for ${resetEmail}.`}</p>
          </header>

          <div className="mode-switch" role="tablist" aria-label="Authentication mode">
            <button className={mode === 'login' || mode === 'forgot' || mode === 'reset' ? 'selected' : ''} onClick={() => setModeAndClear('login')} type="button">Sign In</button>
            <button className={mode === 'register' ? 'selected' : ''} onClick={() => setModeAndClear('register')} type="button">Register Staff</button>
          </div>

          {mode === 'login' ? (
            <form className={loginStatus?.type === 'denied' ? 'shake' : ''} onSubmit={signIn}>
              <label>Email<input value={login.email} onChange={(e) => setLogin({ ...login, email: e.target.value })} type="email" placeholder="you@kestrellhill.edu" required /></label>
              <label>Password<input value={login.password} onChange={(e) => setLogin({ ...login, password: e.target.value })} type="password" placeholder="Your password" required /></label>
              <label>Role<select value={login.role} onChange={(e) => setLogin({ ...login, role: e.target.value })} required><option value="">Choose your role</option><option value="admin">Admin</option><option value="secretary">Secretary</option></select></label>
              <button className="submit-button" type="submit">Sign in securely <span>→</span></button>
              <Stamp status={loginStatus} />
              <button className="text-button" type="button" onClick={() => setModeAndClear('forgot')}>Forgot your password?</button>
            </form>
          ) : mode === 'register' ? (
            <form className={registrationStatus?.type === 'denied' ? 'shake' : ''} onSubmit={registerStaff}>
              <div className={`admin-gate ${currentUser?.role === 'admin' ? 'open' : ''}`}>
                {currentUser?.role === 'admin' ? 'Admin session verified — registration unlocked.' : 'Admin sign-in required before registering staff.'}
              </div>
              <label>Full name<input value={registration.name} onChange={(e) => setRegistration({ ...registration, name: e.target.value })} placeholder="Staff member name" required /></label>
              <label>Email<input value={registration.email} onChange={(e) => setRegistration({ ...registration, email: e.target.value })} type="email" placeholder="staff@kestrellhill.edu" required /></label>
              <label>Password<input value={registration.password} onChange={(e) => setRegistration({ ...registration, password: e.target.value })} type="password" placeholder="Create a password" required /></label>
              <label>Role<select value={registration.role} onChange={(e) => setRegistration({ ...registration, role: e.target.value })} required><option value="">Choose staff role</option><option value="admin">Admin</option><option value="secretary">Secretary</option></select></label>
              <label>Demo access code<input value={registration.accessCode} onChange={(e) => setRegistration({ ...registration, accessCode: e.target.value })} placeholder="KH-ADMIN-04" required /></label>
              <button className="submit-button" type="submit">Add to staff roll <span>+</span></button>
              <Stamp status={registrationStatus} />
            </form>
          ) : mode === 'forgot' ? (
            <form className={passwordStatus?.type === 'denied' ? 'shake' : ''} onSubmit={requestReset}>
              <label>Staff email<input value={forgotEmail} onChange={(e) => setForgotEmail(e.target.value)} type="email" placeholder="you@kestrellhill.edu" required /></label>
              <button className="submit-button" type="submit">Verify email <span>→</span></button>
              <Stamp status={passwordStatus} />
              <button className="text-button" type="button" onClick={() => setModeAndClear('login')}>Back to sign in</button>
            </form>
          ) : (
            <form className={passwordStatus?.type === 'denied' ? 'shake' : ''} onSubmit={resetPassword}>
              <label>New password<input value={newPassword} onChange={(e) => setNewPassword(e.target.value)} type="password" placeholder="Create a new password" required /></label>
              <label>Confirm password<input value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} type="password" placeholder="Type it again" required /></label>
              <button className="submit-button" type="submit">Update password <span>→</span></button>
              <Stamp status={passwordStatus} />
            </form>
          )}

          <footer className="auth-footer">
            {currentUser ? <><span className={`role-dot ${currentUser.role}`} /> Signed in as {currentUser.name} <button type="button" onClick={() => { setCurrentUser(null); setLoginStatus(null); navigate('/'); }}>Sign out</button></> : 'Demo accounts are pre-seeded for testing.'}
          </footer>
        </div>
    
      </section>
    </main>
  );
}

export default function App() {
  return <BrowserRouter><Portal /></BrowserRouter>;
}
