import { useState } from 'react';
import Sidebar, { branches } from '../components/Sidebar';
import StudentPanel from '../components/BranchModules/students/StudentPanel';
import SettingsPanel from '../components/settings/SettingsPanel';
import FinanceDashboard from '../components/BranchModules/finances/financeDashboard';
import LogOut from '../components/logout';
export default function Dashboard({ user, staff = [], students = [], studentCount = 0, onAddStudent, onUpdateStudent, onDeleteStudent, onSignOut }) {
  const [activeTab, setActiveTab] = useState('Dashboard');
  const [showProfileEdit, setShowProfileEdit] = useState(false);
  const [profileName, setProfileName] = useState(user?.name || '');
  const [profileRole, setProfileRole] = useState(user?.role || '');

  const visibleBranches = user?.role === 'admin' 
    ? branches 
    : branches.filter(b => b.name === user?.branch);

  const visibleStudents = user?.role === 'admin'
    ? students
    : students.filter(s => (s.branch || 'Githurai Branch') === user?.branch);

  const visibleStudentCount = user?.role === 'admin'
    ? studentCount
    : visibleStudents.length;

  const visibleStaff = user?.role === 'admin'
    ? staff
    : staff.filter(s => s.branch === user?.branch);

  return (
    <div className="dashboard-shell">
      <Sidebar
        activeTab={activeTab}
        onTabChange={(tab) => {
          if (tab === 'log out') {
            if (onSignOut) onSignOut();
          } else {
            setActiveTab(tab);
          }
        }}
        students={visibleStudents}
        studentCount={visibleStudentCount}
        user={user}
        staff={staff}
      />

      <section className="dashboard-content">
        <div className="dashboard-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <p className="eyebrow">{user?.role === 'admin' ? 'Admin dashboard' : 'Secretary dashboard'}</p>
          </div>
          {user && (
            <div style={{ position: 'relative' }}>
              <div 
                className="profile-card"
                onClick={() => setShowProfileEdit(!showProfileEdit)}
                style={{ cursor: 'pointer', margin: 0, padding: '8px 16px', background: '#fffdf8', border: '1px solid #e1d8c7', boxShadow: '0 2px 8px rgba(33, 61, 58, .04)', transition: 'background 0.2s' }}
                onMouseEnter={(e) => e.currentTarget.style.background = '#fefcf8'}
                onMouseLeave={(e) => e.currentTarget.style.background = '#fffdf8'}
              >
                <div className="profile-avatar">{profileName.charAt(0)?.toUpperCase() || 'U'}</div>
                <div>
                  <strong style={{ color: '#173c3d' }}>{profileName}</strong>
                  <p style={{ textTransform: 'capitalize', color: '#63736e', margin: 0 }}>{profileRole}</p>
                </div>
              </div>

              {showProfileEdit && (
                <div style={{ position: 'absolute', top: 'calc(100% + 8px)', right: 0, background: '#fff', border: '1px solid #e1d8c7', borderRadius: '8px', padding: '16px', width: '250px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', zIndex: 10 }}>
                  <h4 style={{ margin: '0 0 12px', color: '#173c3d', fontFamily: '"Playfair Display", serif' }}>Edit Profile</h4>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: '#63736e', fontWeight: '500' }}>
                    Name
                    <input 
                      type="text" 
                      value={profileName} 
                      onChange={(e) => setProfileName(e.target.value)}
                      style={{ width: '100%', marginTop: '4px', padding: '8px', border: '1px solid #e2e8f0', borderRadius: '4px', outline: 'none' }}
                    />
                  </label>
                  <label style={{ display: 'block', marginBottom: '16px', fontSize: '14px', color: '#63736e', fontWeight: '500' }}>
                    Role
                    <input 
                      type="text" 
                      value={profileRole} 
                      onChange={(e) => setProfileRole(e.target.value)}
                      style={{ width: '100%', marginTop: '4px', padding: '8px', border: '1px solid #e2e8f0', borderRadius: '4px', outline: 'none' }}
                    />
                  </label>
                  <button 
                    onClick={() => setShowProfileEdit(false)}
                    style={{ width: '100%', padding: '8px', background: '#10b981', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: '600' }}
                  >
                    Save Changes
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {activeTab === 'Dashboard' && (
          <div>
            <h3 style={{ margin: '0 0 16px', color: '#173c3d', fontSize: '24px', fontFamily: '"Playfair Display", serif' }}>
              System Overview
            </h3>
            <div className="dashboard-stats">
              <div className="stat-card accent-1">
                <span>{visibleStudentCount}</span>
                <p>Total Enrolled Students</p>
              </div>
              <div className="stat-card accent-2">
                <span>{visibleStaff.length}</span>
                <p>Active Staff Members</p>
              </div>
              <div className="stat-card accent-3" style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', padding: '24px', borderRadius: '12px' }}>
                <span style={{ fontSize: user?.role === 'admin' ? '32px' : '24px', fontWeight: '600', color: '#166534', display: 'block', marginBottom: '8px' }}>
                  {user?.role === 'admin' ? visibleBranches.length : user?.branch}
                </span>
                <p style={{ margin: 0, color: '#166534', fontWeight: '500' }}>
                  {user?.role === 'admin' ? 'Total Branches' : 'Assigned Branch'}
                </p>
              </div>
            </div>

            <h3 style={{ margin: '32px 0 16px', color: '#173c3d', fontSize: '20px', fontFamily: '"Playfair Display", serif' }}>
              Active Branches
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
              {visibleBranches.map(branch => (
                <div key={branch.name} style={{ background: '#fff', padding: '20px', borderRadius: '12px', border: '1px solid #e1d8c7', boxShadow: '0 2px 8px rgba(33, 61, 58, .04)', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981' }}></div>
                    <h4 style={{ margin: 0, color: '#173c3d', fontSize: '18px', fontWeight: '600' }}>{branch.name}</h4>
                  </div>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {branch.subItems.map(item => (
                      <button
                        key={item}
                        type="button"
                        onClick={() => setActiveTab(`${branch.name}-${item}`)}
                        style={{
                          flex: 1,
                          padding: '8px 12px',
                          background: '#f8fafc',
                          border: '1px solid #e2e8f0',
                          borderRadius: '6px',
                          color: '#475569',
                          fontSize: '14px',
                          fontWeight: '500',
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                          textAlign: 'center'
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.background = '#f1f5f9'; e.currentTarget.style.borderColor = '#cbd5e1'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = '#f8fafc'; e.currentTarget.style.borderColor = '#e2e8f0'; }}
                      >
                        {item}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}


        {activeTab.endsWith('-Students') && (() => {
          const branchName = activeTab.split('-')[0];
          const branchStudents = students.filter(s => (s.branch || 'Githurai Branch') === branchName);
          return (
            <StudentPanel
              branchName={branchName}
              students={branchStudents}
              studentCount={branchStudents.length}
              onAddStudent={onAddStudent}
              onUpdateStudent={onUpdateStudent}
              onDeleteStudent={onDeleteStudent}
            />
          );
        })()}

        {activeTab === 'Settings' && <SettingsPanel />}
        {activeTab.endsWith('-Finance') && (() => {
          const branchName = activeTab.split('-')[0];
          const branchStudents = students.filter(s => (s.branch || 'Githurai Branch') === branchName);
          return <FinanceDashboard students={branchStudents} branchName={branchName} />;
        })()}
      </section>
    </div>

  );
}
