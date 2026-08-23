import { useState } from 'react';
import StudentSearch from './studentSearch';
import StudentTable from './studentTable';

const blankStudent = { First_Name: '', Middle_Name: '', Last_Name: '', parentName: '', class: '', admNumber: '', Date_of_birth: '' };

function getStudentDisplay(student) {
  const firstName = student.First_Name ?? '';
  const middleName = student.Middle_Name ?? '';
  const lastName = student.Last_Name ?? '';
  const name = [firstName, middleName, lastName].filter(Boolean).join(' ') || student.name || '';

  return {
    admissionNumber: student.Admission_Number ?? student.admNumber ?? '',
    name,
    guardian: student.parent_guardian ?? student.parentName ?? '',
    className: student.class ?? '',
  };
}

export default function StudentPanel({ branchName, students, studentCount, onAddStudent, onUpdateStudent, onDeleteStudent }) {
  const [form, setForm] = useState(blankStudent);
  const [status, setStatus] = useState(null);
  const [isAdding, setIsAdding] = useState(false);
  const [search, setSearch] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    setStatus(null);

    try {
      await onAddStudent({
        First_Name: form.First_Name.trim(),
        Middle_Name: form.Middle_Name.trim(),
        Last_Name: form.Last_Name.trim(),
        parentName: form.parentName.trim(),
        class: form.class.trim(),
        admNumber: form.admNumber.trim(),
        Date_of_birth: form.Date_of_birth.trim(),
        branch: branchName,
      });
      setForm(blankStudent);
      setStatus({ type: 'approved', message: 'Student added successfully' });
    } catch {
      setStatus({ type: 'denied', message: 'Failed to add student' });
    }
  };

  const handleEditStudent = async (student, updates) => {
    const display = getStudentDisplay(student);

    try {
      await onUpdateStudent(display.admissionNumber, {
        First_Name: updates.First_Name.trim(),
        Middle_Name: updates.Middle_Name.trim(),
        Last_Name: updates.Last_Name.trim(),
        parent_guardian: updates.parent_guardian.trim(),
        Date_of_birth: updates.Date_of_birth.trim(),
        class: updates.class.trim(),
      });
      setStatus({ type: 'approved', message: 'Student updated successfully' });
    } catch {
      setStatus({ type: 'denied', message: 'Failed to update student' });
    }
  };

  const handleDeleteStudent = async (student) => {
    const display = getStudentDisplay(student);
    const shouldDelete = window.confirm(`Delete ${display.name || 'this student'}?`);
    if (!shouldDelete) return;

    try {
      await onDeleteStudent(display.admissionNumber);
      setStatus({ type: 'approved', message: 'Student deleted successfully' });
    } catch {
      setStatus({ type: 'denied', message: 'Failed to delete student' });
    }
  };

  const normalizedSearch = search.trim().toLowerCase();
  const filteredStudents = students.filter((student) => {
    if (!normalizedSearch) return true;

    const haystack = [
      getStudentDisplay(student).admissionNumber,
      getStudentDisplay(student).name,
      getStudentDisplay(student).guardian,
      getStudentDisplay(student).className,
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase();

    return haystack.includes(normalizedSearch);
  });

  return (
    <div className="dashboard-panel">
      <div className="panel-head">
        <div>
          <p className="eyebrow">{branchName || 'Students'}</p>
          <h3>Student roster</h3>
        </div>
        <button className="dashboard-action" type="button" onClick={() => setIsAdding((value) => !value)}>
          {isAdding ? 'Hide form' : 'Add student'}
        </button>
      </div>

      {isAdding && (
        <form className="form-panel" onSubmit={handleSubmit} style={{ marginBottom: '18px' }}>
          <div className="form-row">
            <label>
              Student First name

              <input value={form.First_Name} onChange={(e) => setForm({ ...form, First_Name: e.target.value })} placeholder="Student first name" required />
            </label>
            <label>
              Student Middle name

              <input value={form.Middle_Name} onChange={(e) => setForm({ ...form, Middle_Name: e.target.value })} placeholder="Student middle name" />
            </label>
            <label>

              Student Last name

              <input value={form.Last_Name} onChange={(e) => setForm({ ...form, Last_Name: e.target.value })} placeholder="Student last name" required />
            </label>
            <label>

              Parent name

              <input value={form.parentName} onChange={(e) => setForm({ ...form, parentName: e.target.value })} placeholder="Parent or guardian" />
            </label>
          </div>
          <div className="form-row">
            <label>
              Class
              <input value={form.class} onChange={(e) => setForm({ ...form, class: e.target.value })} placeholder="e.g. Grade 5" required />
            </label>
            <label>
              Admission number
              <input value={form.admNumber} onChange={(e) => setForm({ ...form, admNumber: e.target.value })} placeholder="ADM number" required />
            </label>
            <label>
              D.O.B
              <input value={form.Date_of_birth} onChange={(e) => setForm({ ...form, Date_of_birth: e.target.value })} placeholder="YYYY-MM-DD" />
            </label>
            <label>
              Branch
              <input value={branchName || 'Githurai Branch'} disabled style={{ background: '#f8fafc', color: '#64748b' }} />
            </label>
          </div>
          <button className="dashboard-action" type="submit">Save student</button>
          {status && <div className={`stamp ${status.type}`} style={{ marginTop: '14px' }}>{status.message}</div>}
        </form>
      )}

        
      <div style={{ marginBottom: '15px' }}>

        <p className="end">Total students</p>

        <strong style={{ fontSize: '2rem' }}>{studentCount ?? students.length}</strong>
      </div>


      <div className="student-list-card">
        <div style={{ marginBottom: '12px' }}>
          <StudentSearch search={search} setSearch={setSearch} />
        </div>

        {filteredStudents.length === 0 ? (
          <div className="student-list-empty">
            {search.trim() ? 'No students match your search.' : 'No students found yet.'}
          </div>
        ) : (
          <StudentTable students={filteredStudents} onEditStudent={handleEditStudent} onDeleteStudent={handleDeleteStudent} />
        )}
      </div>
    </div>
  );
}
