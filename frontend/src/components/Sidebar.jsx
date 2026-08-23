import React, { useState } from 'react';

const menuItems = ['Dashboard', 'Settings'];

export const branches = [
  { name: 'Githurai Branch', subItems: ['Students', 'Finance'] },
  { name: 'Umoja Branch', subItems: ['Students', 'Finance'] },
  { name: 'Kirigiti Branch', subItems: ['Students', 'Finance'] },
  { name: 'MugumoBranch', subItems: ['Students', 'Finance'] },

];
export default function Sidebar({ activeTab, onTabChange, students = [], studentCount = 0, user, staff = [] }) {
  return (
    <aside className="dashboard-sidebar" style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
      <div className="sidebar-brand">
        <div className="school-mark">GA</div>
        <div>
          <p className="eyebrow">{user?.role === 'admin' ? 'Admin Portal' : 'Secretary Portal'}</p>
          <h1>Green Angels</h1>
        </div>
      </div>

      <div className="dashboard-nav" style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {menuItems.map((item) => (
          <button
            key={item}
            type="button"
            className={activeTab === item ? 'dashboard-nav-active' : ''}
            onClick={() => onTabChange(item)}
          >
            {item}
          </button>
        ))}
      </div>

      <div style={{ padding: '16px 0', marginTop: 'auto' }}>
        <button
          type="button"
          className="signout-button"
          onClick={() => onTabChange('log out')}
        >
          log out
        </button>
      </div>
    </aside>
  );
}
