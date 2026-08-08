import { useState } from 'react';
import Sidebar from '../components/Sidebar';
import StudentPanel from '../components/students/StudentPanel';
import SettingsPanel from '../components/settings/SettingsPanel';
import FinanceDashboard from '../components/finances/financeDashboard';

export default function Dashboard({ students = [], studentCount = 0, onAddStudent, onUpdateStudent, onDeleteStudent }) {
  const [activeTab, setActiveTab] = useState('Students');

  return (
    <div className="dashboard-shell">
      <Sidebar
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      <section className="dashboard-content">
        <div className="dashboard-header">
          <div>
            <p className="eyebrow">Admin dashboard</p>
          </div>

        </div>


        {activeTab === 'Students' && (
          <StudentPanel
            students={students}
            studentCount={studentCount}
            onAddStudent={onAddStudent}
            onUpdateStudent={onUpdateStudent}
            onDeleteStudent={onDeleteStudent}
          />
        )}

        {activeTab === 'Settings' && <SettingsPanel />}
        {activeTab === 'Finance' && <FinanceDashboard students={students} />}
      </section>
    </div>

  );
}
