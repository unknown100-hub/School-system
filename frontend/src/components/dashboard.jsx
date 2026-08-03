export default function Dashboard({ user, staff, studentCount, students, onAddStudent, onRegister, onSignOut }) {
  const isAdmin = user.role === 'admin';
  const actions = isAdmin
    ? ['Review staff access', 'Approve new registrations', 'View school reports']
    : ['Manage front desk', 'Record visitor details', 'Prepare daily notices'];

  const summaryCards = [
    { label: 'Students enrolled', value: studentCount ?? '—', accent: 'accent-1' },
    { label: isAdmin ? 'Staff on roll' : 'Visitors today', value: isAdmin ? staff.length : '12', accent: 'accent-2' },
    { label: isAdmin ? 'Pending reviews' : 'Messages queued', value: isAdmin ? '03' : '07', accent: 'accent-3' },
  ];

  const recentStudents = (students || []).slice(0, 3);

  return (
    <main className="dashboard-shell">
      <aside className="dashboard-sidebar">
        <div className="sidebar-brand">
          <div className="school-mark" aria-hidden="true">GA</div>
          <div>
            <p className="eyebrow">Green Angels Academy</p>
            <h1>{isAdmin ? 'Admin' : 'Secretary'} Desk</h1>
          </div>
        </div>
        <nav className="dashboard-nav" aria-label="Dashboard navigation">
          <button className="dashboard-nav-active" type="button">◉ Overview</button>
          <button type="button">◌ {isAdmin ? 'Staff management' : 'Office register'}</button>
          <button type="button">◌ Notifications</button>
          <button type="button">◌ Reports</button>
        </nav>
        <div className="sidebar-card">
          <p>Today’s focus</p>
          <strong>Keep student records updated</strong>
        </div>
        <div className="profile-card">
          <div className="profile-avatar">{user.name.split(' ')[0][0]}{user.name.split(' ').slice(-1)[0][0]}</div>
          <div>
            <strong>{user.name}</strong>
            <p>{user.email || 'admin@greenangels.edu'}</p>
          </div>
        </div>
        <button className="signout-button" type="button" onClick={onSignOut}>Sign out</button>
      </aside>

      <section className="dashboard-content">
        <header className="dashboard-header">
          <div>
            <p className="eyebrow">School management portal</p>
            <h2>Welcome back, {user.name.split(' ')[0]}.</h2>
            <p>Monitor admissions, staff activity, and guardian updates in one streamlined view.</p>
          </div>
          <div className="header-tools">
            <div className="search-box">⌕ Search students</div>
            <button className="header-action" type="button" onClick={onAddStudent}>+ Add student</button>
          </div>
        </header>

        <section className="hero-card">
          <div>
            <p className="eyebrow">Live overview</p>
            <h3>Everything important is visible at a glance.</h3>
            <p>Track records, prioritize actions, and keep the school running smoothly.</p>
          </div>
          <div className="hero-badge">
            <span className={`role-tag ${user.role}`}>{user.role}</span>
            <small>Live dashboard</small>
          </div>
        </section>

        <div className="dashboard-stats">
          {summaryCards.map((card) => (
            <article key={card.label} className={`stat-card ${card.accent}`}>
              <span>{card.value}</span>
              <p>{card.label}</p>
            </article>
          ))}
        </div>

        <div className="dashboard-grid">
          <section className="dashboard-panel">
            <div className="panel-heading">
              <div>
                <p className="eyebrow">Your priorities</p>
                <h3>{isAdmin ? 'Administration queue' : 'Office queue'}</h3>
              </div>
              <span className="panel-pill">Priority</span>
            </div>
            <ul className="priority-list">
              {actions.map((action) => (
                <li key={action}>{action}<span>→</span></li>
              ))}
            </ul>
          </section>

          <section className="dashboard-panel activity-panel">
            <div className="panel-heading">
              <div>
                <p className="eyebrow">Today</p>
                <h3>{isAdmin ? 'Staff roll' : 'Reception status'}</h3>
              </div>
              <span className="panel-pill">Live</span>
            </div>
            <p className="activity-copy">
              {isAdmin
                ? `${staff.length} staff accounts are currently listed in the live ledger.`
                : 'Front office is open. No outstanding visitor check-outs.'}
            </p>
            {isAdmin && (
              <button className="dashboard-action" type="button" onClick={onRegister}>
                Register staff <span>+</span>
              </button>
            )}
          </section>
        </div>

        <section className="dashboard-panel insight-panel">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">Performance</p>
              <h3>{isAdmin ? 'School health snapshot' : 'Office health snapshot'}</h3>
            </div>
            <span className="panel-pill">Live</span>
          </div>

          <div className="insight-grid">
            <div className="insight-card">
              <p className="insight-label">Enrollment</p>
              <strong>{studentCount ?? '—'} active</strong>
              <div className="progress-track">
                <div className="progress-fill fill-1" style={{ width: `${Math.min(100, ((Number(studentCount) || 0) / 40) * 100)}%` }} />
              </div>
              <small>Tracking current student intake</small>
            </div>
            <div className="insight-card">
              <p className="insight-label">Response time</p>
              <strong>Under 10 min</strong>
              <div className="progress-track">
                <div className="progress-fill fill-2" style={{ width: '86%' }} />
              </div>
              <small>Fast support for office requests</small>
            </div>
            <div className="insight-card">
              <p className="insight-label">Follow-ups</p>
              <strong>{isAdmin ? '03 pending' : '07 queued'}</strong>
              <div className="progress-track">
                <div className="progress-fill fill-3" style={{ width: isAdmin ? '62%' : '74%' }} />
              </div>
              <small>{isAdmin ? 'Staff approvals waiting' : 'Notice prep in progress'}</small>
            </div>
          </div>
        </section>

        <section className="dashboard-panel overview-panel">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">Students</p>
              <h3>Recent student overview</h3>
            </div>
            <button type="button" className="panel-link">View all</button>
          </div>

          <div className="parent-spotlight">
            <div>
              <p className="eyebrow">Parent focus</p>
              <strong>{recentStudents[0]?.parentName || 'No parent record yet'}</strong>
              <p>
                {recentStudents[0]
                  ? `Guardian for ${recentStudents[0].name}`
                  : 'Parent details will appear here as student records are added.'}
              </p>
            </div>
            <span className="spotlight-pill">Guardian</span>
          </div>

          <div className="student-table">
            <div className="student-table-head">
              <span>Name</span>
              <span>Parent</span>
              <span>Class</span>
              <span>Admission</span>
            </div>
            {recentStudents.length > 0 ? (
              recentStudents.map((student) => (
                <div className="student-table-row" key={student.id}>
                  <span>{student.name}</span>
                  <span>{student.parentName || '—'}</span>
                  <span>{student.class}</span>
                  <span className="status-pill present">{student.admNumber}</span>
                </div>
              ))
            ) : (
              <div className="student-table-row">
                <span>No students found</span>
                <span>—</span>
                <span>—</span>
                <span className="status-pill present">—</span>
              </div>
            )}
          </div>
        </section>
      </section>
    </main>
  );
}
