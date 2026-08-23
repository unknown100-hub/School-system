import React, { useState } from 'react';

const menuItems = ['Dashboard', 'Settings'];

export const branches = [
  { name: 'Githurai Branch', subItems: ['Students', 'Finance'] },
  { name: 'Umoja Branch', subItems: ['Students', 'Finance'] },
  { name: 'Kirigiti Branch', subItems: ['Students', 'Finance'] },
  { name: 'MugumoBranch', subItems: ['Students', 'Finance'] },

];
export default function Sidebar({ activeTab, onTabChange, students = [], studentCount = 0, user, staff = [] }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <aside className="dashboard-sidebar">
      <div className="sidebar-brand">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div className="school-mark">GA</div>
          <div>
            <p className="eyebrow">{user?.role === 'admin' ? 'Admin Portal' : 'Secretary Portal'}</p>
            <h1>Green Angels</h1>
          </div>
        </div>
        <button className="mobile-toggle" onClick={() => setIsOpen(!isOpen)} aria-label="Toggle Menu">
          {isOpen ? '✕' : '☰'}
        </button>
      </div>

      <div className={`sidebar-menu ${isOpen ? 'open' : ''}`}>
        <div className="dashboard-nav">
          {menuItems.map((item) => (
            <button
              key={item}
              type="button"
              className={activeTab === item ? 'dashboard-nav-active' : ''}
              onClick={() => {
                onTabChange(item);
                setIsOpen(false);
              }}
            >
              {item}
            </button>
          ))}
        </div>

        <div className="sidebar-footer">
          <button
            type="button"
            className="signout-button"
            onClick={() => onTabChange('log out')}
          >
            log out
          </button>
        </div>
      </div>
    </aside>
  );
}
