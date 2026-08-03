import { useState } from 'react';

const blankStudent = { name: '', parentName: '', class: '', admNumber: '' };

export default function StudentPanel({ students, studentCount, onAddStudent }) {
  const [form, setForm] = useState(blankStudent);
  const [status, setStatus] = useState(null);
  const [isAdding, setIsAdding] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setStatus(null);

    try {
      await onAddStudent({
        name: form.name.trim(),
        parentName: form.parentName.trim(),
        class: form.class.trim(),
        admNumber: form.admNumber.trim(),
      });
      setForm(blankStudent);
      setStatus({ type: 'approved', message: 'Student added successfully' });
    } catch (error) {
      setStatus({ type: 'denied', message: 'Failed to add student' });
    }
  };

  return (
    <div className="dashboard-panel">
      <div className="panel-head">
        <div>
          <p className="eyebrow">Students</p>
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
              Student name
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Student full name" required />
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
        <div className="student-table-head">
          <span>Name</span>
          <span>Parent/Guardian</span>
          <span>Class</span>
          <span>ADM</span>
        </div>

        {students.length === 0 ? (
          <div className="student-list-empty">No students found yet.</div>
        ) : (
          <div className="student-list-body">
            {students.map((student) => {
              const id = student.id ?? student._id ?? student.admNumber ?? student.name;
              return (
                <div key={id} className="student-table-row">
                  <span>{student.name}</span>
                  <span>{student.parentName || '—'}</span>
                  <span>{student.class || '—'}</span>
                  <span>{student.admNumber || '—'}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
