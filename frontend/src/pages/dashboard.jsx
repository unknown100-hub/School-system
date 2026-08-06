import { useState } from 'react';
import Sidebar from '../components/Sidebar';
import StudentPanel from '../components/students/StudentPanel';
import SettingsPanel from '../components/SettingsPanel';

<<<<<<< HEAD

=======
>>>>>>> 1e306443c2980a7937b2805b4105bec477224ffe
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
<<<<<<< HEAD
          </div>
=======
        </div>
>>>>>>> 1e306443c2980a7937b2805b4105bec477224ffe
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
      </section>
    </div>

  );
}
