import { useEffect, useMemo, useState } from 'react';
import { BrowserRouter, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import Dashboard from './pages/dashboard';
import api from './components/api';
import './App.css';
import { branches } from './components/Sidebar';

const PERSISTENT_SESSION_KEY = 'school-system.persistent-session';
const SESSION_KEY = 'school-system.session';
const REMEMBERED_EMAIL_KEY = 'school-system.remembered-email';
const blankLogin = { email: '', password: '', keepSignedIn: false };
const blankRegistration = { name: '', email: '', password: '', role: '', branch: '' };
const blankStudent = { name: '', parentName: '', class: '', admNumber: '', Date_of_birth: '' };
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const EMAIL_TYPOS = { 'gmial.com': 'gmail.com', 'gmal.com': 'gmail.com', 'gmail.co': 'gmail.com', 'yaho.com': 'yahoo.com', 'hotmai.com': 'hotmail.com', 'outlok.com': 'outlook.com' };
function loadSavedSession() {
  try {
    return JSON.parse(
      localStorage.getItem(PERSISTENT_SESSION_KEY)
      || sessionStorage.getItem(SESSION_KEY)
      || 'null'
    );
  } catch {
    return null;
  }
}

function loadRememberedEmail() {
  try { return localStorage.getItem(REMEMBERED_EMAIL_KEY) || ''; } catch { return ''; }
}

function evaluateEmail(rawEmail) {
  const email = rawEmail.trim().toLowerCase();
  if (!email) return { state: 'empty' };
  if (!EMAIL_REGEX.test(email)) return { state: 'invalid', message: 'Enter a valid email address.' };
  const [name, domain] = email.split('@');
  if (EMAIL_TYPOS[domain]) return { state: 'typo', suggestion: `${name}@${EMAIL_TYPOS[domain]}` };
  return { state: 'ok' };
}

function evaluatePassword(password) {
  const rules = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    number: /[0-9]/.test(password),
    symbol: /[^A-Za-z0-9]/.test(password),
  };
  return { rules, score: Object.values(rules).filter(Boolean).length };
}

function Stamp({ status }) {
  if (!status) return null;
  return <div className={`stamp ${status.type}`}>{status.message}</div>;
}

function PasswordInput({ value, onChange, placeholder, autoComplete, visible, onToggle, className = '' }) {
  return (
    <div className="password-input">
      <input className={className} value={value} onChange={onChange} type={visible ? 'text' : 'password'} placeholder={placeholder} autoComplete={autoComplete} required />
      <button type="button" onClick={onToggle} aria-label={visible ? 'Hide password' : 'Show password'}>
        {visible ? <EyeOff size={17} /> : <Eye size={17} />}
      </button>
    </div>
  );
}

function Portal() {
  const navigate = useNavigate();
  const location = useLocation();
  const [mode, setMode] = useState('login');
  const [studentCount, setStudentCount] = useState(null);
  const [students, setStudents] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [currentUser, setCurrentUser] = useState(() => {
    const savedSession = loadSavedSession();
    return savedSession?.user || null;
  });
  const [login, setLogin] = useState(() => ({ ...blankLogin, email: loadRememberedEmail(), keepSignedIn: Boolean(loadRememberedEmail()) }));
  const [registration, setRegistration] = useState(blankRegistration);
  const [registrationConfirmPassword, setRegistrationConfirmPassword] = useState('');
  const [studentForm, setStudentForm] = useState(blankStudent);
  const [loginStatus, setLoginStatus] = useState(null);
  const [registrationStatus, setRegistrationStatus] = useState(null);
  const [studentStatus, setStudentStatus] = useState(null);
  const [forgotEmail, setForgotEmail] = useState('');
  const [resetEmail, setResetEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showRegistrationPassword, setShowRegistrationPassword] = useState(false);
  const [showRegistrationConfirmation, setShowRegistrationConfirmation] = useState(false);
  const [passwordStatus, setPasswordStatus] = useState(null);
  const staff = useMemo(() => accounts.map((account, index) => ({
    id: account.email || index,
    name: account.name,
    email: account.email,
    role: account.role,
    branch: account.branch,
  })), [accounts]);
  const loginEmailResult = evaluateEmail(login.email);
  const registrationEmailResult = evaluateEmail(registration.email);
  const registrationPassword = evaluatePassword(registration.password);
  const passwordsMatch = registration.password === registrationConfirmPassword;

  useEffect(() => {
    const savedSession = loadSavedSession();
    if (savedSession?.token) api.defaults.headers.common.Authorization = `Bearer ${savedSession.token}`;
  }, []);

  useEffect(() => {
    const loadStudentData = async () => {
      try {
        const [countResponse, studentsResponse] = await Promise.all([
          api.get('/api/dashboard/students/count'),
          api.get('/api/dashboard/students'),
        ]);

        setStudentCount(countResponse.data.studentCount ?? 0);
        setStudents(studentsResponse.data.students ?? studentsResponse.data ?? []);
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

  const signIn = async (event) => {
    event.preventDefault();
    const emailStr = login.email.trim().toLowerCase();

    if (loginEmailResult.state !== 'ok') {
      setLoginStatus({ type: 'denied', message: 'Enter a valid staff email.' });
      return;
    }

    try {
      const { data } = await api.post('/api/auth/login', { email: emailStr, password: login.password });
      const session = JSON.stringify({ user: data.user, token: data.token });
      api.defaults.headers.common.Authorization = `Bearer ${data.token}`;
      if (login.keepSignedIn) { localStorage.setItem(PERSISTENT_SESSION_KEY, session); sessionStorage.removeItem(SESSION_KEY); }
      else { sessionStorage.setItem(SESSION_KEY, session); localStorage.removeItem(PERSISTENT_SESSION_KEY); }
      if (login.keepSignedIn) localStorage.setItem(REMEMBERED_EMAIL_KEY, emailStr);
      else localStorage.removeItem(REMEMBERED_EMAIL_KEY);
      setCurrentUser(data.user);
      setLoginStatus({ type: 'approved', message: 'ACCESS GRANTED' });
      navigate(`/dashboard/${data.user.role}`);
    } catch (error) { setLoginStatus({ type: 'denied', message: error.response?.data?.message || 'Unable to sign in.' }); }
  };

  const signOut = () => {
    localStorage.removeItem(PERSISTENT_SESSION_KEY);
    sessionStorage.removeItem(SESSION_KEY);
    delete api.defaults.headers.common.Authorization;
    setCurrentUser(null);
    setLogin(blankLogin);
    setLoginStatus(null);
    navigate('/');
  };

  const addStudent = async (studentOrEvent) => {
    const isEvent = studentOrEvent?.preventDefault;
    if (isEvent) studentOrEvent.preventDefault();

    const studentPayload = isEvent ? studentForm : studentOrEvent;
    const firstName = studentPayload.First_Name?.trim() || '';
    const middleName = studentPayload.Middle_Name?.trim() || '';
    const lastName = studentPayload.Last_Name?.trim() || '';
    const name = studentPayload.name?.trim() || [firstName, middleName, lastName].filter(Boolean).join(' ');
    const studentClass = studentPayload.class?.trim();
    const admNumber = studentPayload.admNumber?.trim();

    if (!name || !studentClass || !admNumber) {
      if (isEvent) setStudentStatus({ type: 'denied', message: 'CHECK DETAILS' });
      throw new Error('CHECK DETAILS');
    }

    try {
      const response = await api.post('/api/dashboard/students', {
        name,
        First_Name: firstName,
        Middle_Name: middleName,
        Last_Name: lastName,
        parentName: studentPayload.parentName?.trim() || '',
        class: studentClass,
        admNumber,
        Date_of_birth: studentPayload.Date_of_birth?.trim() || '',
        branch: studentPayload.branch || 'Githurai Branch',
      });

      const createdStudent = response.data.student;
      setStudents((currentStudents) => [createdStudent, ...currentStudents]);
      setStudentCount((currentCount) => (Number(currentCount) || 0) + 1);

      if (isEvent) {
        setStudentForm(blankStudent);
        setStudentStatus({ type: 'approved', message: 'STUDENT ADDED' });
        return;
      }

      return createdStudent;
    } catch (error) {
      console.error('Unable to add student:', error);
      if (isEvent) {
        setStudentStatus({ type: 'denied', message: 'FAILED TO SAVE' });
        return;
      }
      throw error;
    }
  };

  const updateStudent = async (admissionNumber, updates) => {
    const response = await api.put(`/api/dashboard/students/${encodeURIComponent(admissionNumber)}`, updates);
    const updatedStudent = response.data.student;

    setStudents((currentStudents) => currentStudents.map((student) =>
      String(student.Admission_Number ?? student.admNumber) === String(admissionNumber)
        ? updatedStudent
        : student
    ));

    return updatedStudent;
  };

  const deleteStudent = async (admissionNumber) => {
    const student = students.find((s) => String(s.Admission_Number ?? s.admNumber) === String(admissionNumber));
    const branchQuery = student ? `?branch=${encodeURIComponent(student.branch || 'Githurai Branch')}` : '';
    await api.delete(`/api/dashboard/students/${encodeURIComponent(admissionNumber)}${branchQuery}`);

    setStudents((currentStudents) => currentStudents.filter((student) =>
      String(student.Admission_Number ?? student.admNumber) !== String(admissionNumber)
    ));
    setStudentCount((currentCount) => Math.max((Number(currentCount) || 1) - 1, 0));
  };

  const registerStaff = async (event) => {
    event.preventDefault();
    const email = registration.email.trim().toLowerCase();

    if (registrationEmailResult.state !== 'ok') {
      setRegistrationStatus({ type: 'denied', message: 'Enter a valid email address.' });
      return;
    }

    if (!registration.name.trim() || !email || !registration.role || (registration.role === 'secretary' && !registration.branch) || registrationPassword.score < 4 || !passwordsMatch) {
      setRegistrationStatus({ type: 'denied', message: 'CHECK DETAILS' });
      return;
    }

    try {
      const { data } = await api.post('/api/auth/register', { ...registration, email, password: registration.password });
      setAccounts((currentAccounts) => [...currentAccounts, data.user]);
      setRegistration(blankRegistration);
      setRegistrationConfirmPassword('');
      setRegistrationStatus({ type: 'approved', message: 'STAFF ADDED' });
      if (!currentUser) {
        localStorage.setItem(REMEMBERED_EMAIL_KEY, email);
        window.setTimeout(() => {
          setRegistrationStatus(null);
          setLogin({ ...blankLogin, email, keepSignedIn: true });
          setMode('login');
          navigate('/');
        }, 900);
      }
    } catch (error) { setRegistrationStatus({ type: 'denied', message: error.response?.data?.message || 'Unable to register. Please try again.' }); }
  };

  const requestReset = (event) => {
    event.preventDefault();
    setPasswordStatus({ type: 'denied', message: 'PASSWORD RESET IS NOT AVAILABLE YET' });
  };

  const resetPassword = (event) => {
    event.preventDefault();
    setPasswordStatus({ type: 'denied', message: 'PASSWORD RESET IS NOT AVAILABLE YET' });
  };

  if (location.pathname.startsWith('/dashboard') && currentUser) {
    return <Dashboard user={currentUser} staff={staff} studentCount={studentCount} students={students} onAddStudent={addStudent} onUpdateStudent={updateStudent} onDeleteStudent={deleteStudent} onRegister={() => setModeAndClear('register')} onSignOut={signOut} />;
  }

  if (location.pathname === '/' && currentUser) {
    return <Navigate to={`/dashboard/${currentUser.role}`} replace />;
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
              <label>D.O.B<input value={studentForm.Date_of_birth} onChange={(e) => setStudentForm({ ...studentForm, Date_of_birth: e.target.value })} placeholder="YYYY-MM-DD" /></label>
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
            <p>{mode === 'login' ? '' : mode === 'register' ? 'Add an Admin or Secretary to the staff roll.' : mode === 'forgot' ? 'Enter your staff email to verify your reset request.' : `Updating password for ${resetEmail}.`}</p>
          </header>

          {currentUser?.role === 'admin' && (
            <div className="mode-switch" role="tablist" aria-label="Authentication mode">
              <button className={mode === 'login' || mode === 'forgot' || mode === 'reset' ? 'selected' : ''} onClick={() => setModeAndClear('login')} type="button">Sign In</button>
              <button className={mode === 'register' ? 'selected' : ''} onClick={() => setModeAndClear('register')} type="button">Register Staff</button>
            </div>
          )}

          {mode === 'login' ? (
            <form className={`social-login-form ${loginStatus?.type === 'denied' ? 'shake' : ''}`} onSubmit={signIn}>
              <label>Email address<input value={login.email} onChange={(e) => setLogin({ ...login, email: e.target.value })} type="email" placeholder="staff email" list="staff-email-options" required /></label>
              <datalist id="staff-email-options">{accounts.map((account) => <option key={account.email} value={account.email} />)}</datalist>
              <label>Password<PasswordInput value={login.password} onChange={(e) => setLogin({ ...login, password: e.target.value })} placeholder="Your password" autoComplete="current-password" visible={showLoginPassword} onToggle={() => setShowLoginPassword((shown) => !shown)} /></label>
              <div className="login-options">
                <label className="keep-signed-in"><input checked={login.keepSignedIn} onChange={(e) => setLogin({ ...login, keepSignedIn: e.target.checked })} type="checkbox" />Remember me</label>
                <button className="forgot-link" type="button" onClick={() => setModeAndClear('forgot')}>Forgot password?</button>
              </div>
              <button className="submit-button" type="submit">Sign in</button>
              <Stamp status={loginStatus} />
              <div className="social-signup">
                <p>Not a member? <button type="button" onClick={() => setModeAndClear('register')}>Register</button></p>
              </div>
            </form>
          ) : mode === 'register' ? (
            <form className={`registration-form ${registrationStatus?.type === 'denied' ? 'shake' : ''}`} onSubmit={registerStaff}>
              {currentUser?.role === 'admin' && <div className="admin-gate open">Signed in as an administrator.</div>}
              <label>Full name<input value={registration.name} onChange={(e) => { setRegistration({ ...registration, name: e.target.value }); setRegistrationStatus(null); }} placeholder="Staff member name" autoComplete="name" required /></label>
              <label>Email address<input value={registration.email} onChange={(e) => { setRegistration({ ...registration, email: e.target.value }); setRegistrationStatus(null); }} type="email" placeholder="staff@gmail.com" autoComplete="email" required /></label>
              <label>Password<PasswordInput value={registration.password} onChange={(e) => { setRegistration({ ...registration, password: e.target.value }); setRegistrationStatus(null); }} placeholder="Create a password" autoComplete="new-password" visible={showRegistrationPassword} onToggle={() => setShowRegistrationPassword((shown) => !shown)} /></label>
              <p className="password-hint">Use at least 8 characters, including uppercase letters, numbers, and symbols.</p>
              <label>Confirm password<PasswordInput className={registrationConfirmPassword && !passwordsMatch ? 'invalid-input' : ''} value={registrationConfirmPassword} onChange={(e) => { setRegistrationConfirmPassword(e.target.value); setRegistrationStatus(null); }} placeholder="Re-enter password" autoComplete="new-password" visible={showRegistrationConfirmation} onToggle={() => setShowRegistrationConfirmation((shown) => !shown)} /></label>
              {registrationConfirmPassword && !passwordsMatch && <p className="field-error">Passwords do not match.</p>}
              <label>Role<select value={registration.role} onChange={(e) => { setRegistration({ ...registration, role: e.target.value, branch: '' }); setRegistrationStatus(null); }} required><option value="">Choose staff role</option><option value="admin">Admin</option><option value="secretary">Secretary</option></select></label>
              {registration.role === 'secretary' && (
                <label>Branch
                  <select value={registration.branch} onChange={(e) => setRegistration({ ...registration, branch: e.target.value })} required>
                    <option value="">Select Branch</option>
                    {branches.map(b => <option key={b.name} value={b.name}>{b.name}</option>)}
                  </select>
                </label>
              )}
              <button className="submit-button" type="submit">Add to staff roll <span>+</span></button>
              <Stamp status={registrationStatus} />
              {!currentUser && <button className="text-button" type="button" onClick={() => setModeAndClear('login')}>Already registered? Sign in</button>}
            </form>
          ) : mode === 'forgot' ? (
            <form className={passwordStatus?.type === 'denied' ? 'shake' : ''} onSubmit={requestReset}>
              <label>Staff email<input value={forgotEmail} onChange={(e) => setForgotEmail(e.target.value)} type="email" placeholder="you@gmail.com" required /></label>
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
            {currentUser ? <><span className={`role-dot ${currentUser.role}`} /> Signed in as {currentUser.name} <button type="button" onClick={signOut}>Sign out</button></> : ''}
          </footer>
        </div>

      </section>
    </main>
  );
}

export default function App() {
  return <BrowserRouter><Portal /></BrowserRouter>;
}
