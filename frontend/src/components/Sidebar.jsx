import { useState } from 'react';
import { Building2, LayoutDashboard, LogOut, Menu, Settings, UsersRound, X } from 'lucide-react';

const menuItems = ['Dashboard', 'Settings'];

export const branches = [
  { name: 'Githurai Branch', subItems: ['Students', 'Finance'] },
  { name: 'Umoja Branch', subItems: ['Students', 'Finance'] },
  { name: 'Kirigiti Branch', subItems: ['Students', 'Finance'] },
  { name: 'MugumoBranch', subItems: ['Students', 'Finance'] },

];
export default function Sidebar({ activeTab, onTabChange, students = [], studentCount = 0, user, staff = [] }) {
  const [isOpen, setIsOpen] = useState(false);
  const initials = user?.name?.split(' ').map((part) => part[0]).join('').slice(0, 2).toUpperCase() || 'GA';

  const menuIcons = { Dashboard: LayoutDashboard, Settings };

  return (
    <aside className="dashboard-sidebar">
      <div className="sidebar-brand">
        <div className="sidebar-brand-copy">
          <div className="school-mark">GA</div>
          <div>
            <p className="eyebrow">{user?.role === 'admin' ? 'Admin Portal' : 'Secretary Portal'}</p>
            <h1>Green Angels</h1>
          </div>
        </div>
        <button className="mobile-toggle" type="button" onClick={() => setIsOpen(!isOpen)} aria-label="Toggle menu">
          {isOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      <div className={`sidebar-menu ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-user">
          <div className="sidebar-avatar">{initials}</div>
          <div>
            <strong>{user?.name || 'Staff member'}</strong>
            <span>{user?.role || 'Staff'} · {user?.branch || 'All branches'}</span>
          </div>
        </div>

        <div className="sidebar-summary" aria-label="Account summary">
          <div><UsersRound size={16} /><span><strong>{studentCount}</strong> learners</span></div>
          <div><Building2 size={16} /><span>{user?.branch || 'All branches'}</span></div>
        </div>

        <p className="sidebar-label">Workspace</p>
        <div className="dashboard-nav">
          {menuItems.map((item) => (
            (() => {
              const Icon = menuIcons[item];
              return <button
              key={item}
              type="button"
              className={activeTab === item ? 'dashboard-nav-active' : ''}
              onClick={() => {
                onTabChange(item);
                setIsOpen(false);
              }}
            >
              <Icon size={18} aria-hidden="true" />
              {item}
            </button>;
            })()
          ))}
        </div>

        <div className="sidebar-footer">
          <p className="sidebar-label">Account</p>
          <button
            type="button"
            className="signout-button"
            onClick={() => onTabChange('log out')}
          >
            <LogOut size={18} aria-hidden="true" />
            Log out
          </button>
        </div>
      </div>
    </aside>
  );
}
