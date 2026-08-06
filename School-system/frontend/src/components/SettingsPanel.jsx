import React from 'react';

export default function SettingsPanel() {
  return (
    <section className="dashboard-panel">
      <div className="panel-head">
        <div>
          <p className="eyebrow">Settings</p>
          <h3>Admin settings</h3>
        </div>
      </div>

      <div style={{ display: 'grid', gap: '16px' }}>
        {[
          { label: 'Notification emails', value: 'Enabled' },
          { label: 'User access', value: 'Super Admin' },
          { label: 'Theme mode', value: 'Light' },
        ].map((item) => (
          <div key={item.label} style={{ padding: '14px', borderRadius: '14px', background: '#fcfaf4', border: '1px solid #ece4d3' }}>
            <p style={{ margin: 0, color: '#6c817b', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '.12em' }}>{item.label}</p>
            <strong style={{ color: '#173c3d' }}>{item.value}</strong>
          </div>
        ))}
      </div>
    </section>
  );
}
