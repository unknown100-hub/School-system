import { useState } from 'react';

export default function StudentRow({ student, onEditStudent, onDeleteStudent }) {
  const admissionNumber = student.Admission_Number ?? student.admNumber ?? '—';
  const nameParts = String(student.name || '').split(' ').filter(Boolean);
  const firstName = student.First_Name || nameParts[0] || '—';
  const middleName = student.Middle_Name || (nameParts.length > 2 ? nameParts.slice(1, -1).join(' ') : '') || '—';
  const lastName = student.Last_Name || (nameParts.length > 1 ? nameParts[nameParts.length - 1] : '') || '—';
  const guardian = student.parent_guardian ?? student.parentName ?? '—';
  const className = student.class ?? '—';
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    First_Name: firstName === '—' ? '' : firstName,
    Middle_Name: middleName === '—' ? '' : middleName,
    Last_Name: lastName === '—' ? '' : lastName,
    parent_guardian: guardian === '—' ? '' : guardian,
    class: className === '—' ? '' : className,
  });

  const updateEditForm = (field, value) => {
    setEditForm((currentForm) => ({ ...currentForm, [field]: value }));
  };

  const handleSave = async () => {
    await onEditStudent(student, editForm);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditForm({
      First_Name: firstName === '—' ? '' : firstName,
      Middle_Name: middleName === '—' ? '' : middleName,
      Last_Name: lastName === '—' ? '' : lastName,
      parent_guardian: guardian === '—' ? '' : guardian,
      class: className === '—' ? '' : className,
    });
    setIsEditing(false);
  };

  return (
    <tr>
      <td>
        <input type="checkbox" />
      </td>

      <td>{admissionNumber}</td>

      <td>
        {isEditing ? <input className="student-table-input" value={editForm.First_Name} onChange={(event) => updateEditForm('First_Name', event.target.value)} /> : firstName}
      </td>

      <td>
        {isEditing ? <input className="student-table-input" value={editForm.Middle_Name} onChange={(event) => updateEditForm('Middle_Name', event.target.value)} /> : middleName}
      </td>

      <td>
        {isEditing ? <input className="student-table-input" value={editForm.Last_Name} onChange={(event) => updateEditForm('Last_Name', event.target.value)} /> : lastName}
      </td>

      <td>
        {isEditing ? <input className="student-table-input" value={editForm.parent_guardian} onChange={(event) => updateEditForm('parent_guardian', event.target.value)} /> : guardian}
      </td>

      <td>
        {isEditing ? <input className="student-table-input" value={editForm.class} onChange={(event) => updateEditForm('class', event.target.value)} /> : className}
      </td>
      <td>
        {isEditing ? <input className="student-table-input" value={editForm.Date_of_birth} onChange={(event) => updateEditForm('Date_of_birth', event.target.value)} /> : student.Date_of_birth}
      </td>
      <td>
        {isEditing ? (
          <div style={{ display: 'flex', gap: '8px' }}>
            <button onClick={handleSave} style={{ color: 'green', cursor: 'pointer', background: 'none', border: 'none', padding: 0 }}>Save</button>
            <button onClick={handleCancel} style={{ color: 'gray', cursor: 'pointer', background: 'none', border: 'none', padding: 0 }}>Cancel</button>
          </div>
        ) : (
          <div style={{ display: 'flex', gap: '8px' }}>
            <button onClick={() => setIsEditing(true)} style={{ color: 'blue', cursor: 'pointer', background: 'none', border: 'none', padding: 0 }}>Edit</button>
            <button onClick={() => onDeleteStudent(student)} style={{ color: 'red', cursor: 'pointer', background: 'none', border: 'none', padding: 0 }}>Delete</button>
          </div>
        )}
      </td>
    </tr>
  );
}
