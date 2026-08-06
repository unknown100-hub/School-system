<<<<<<< HEAD
const menuItems = ['Students', 'Finance', 'Settings'];
=======
const menuItems = ['Students', 'Settings'];
>>>>>>> 1e306443c2980a7937b2805b4105bec477224ffe

export default function Sidebar({ activeTab, onTabChange }) {
  return (
    <aside className="dashboard-sidebar">
      <div className="sidebar-brand">
        <div className="school-mark">GA</div>
        <div>
          <p className="eyebrow">Admin Portal</p>
          <h1>Green Angels</h1>
        </div>
      </div>

      <div className="dashboard-nav">
        {menuItems.map((item) => (
          <button
            key={item}
            type="button"
            className={item === activeTab ? 'dashboard-nav-active' : ''}
            onClick={() => onTabChange(item)}
          >
            {item}
          </button>
        ))}
      </div>
    </aside>
  );
}
