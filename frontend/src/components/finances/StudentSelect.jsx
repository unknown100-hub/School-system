export default function StudentSelect({ students, value, onChange, colors }) {
  const student = students.find((s) => String(s.Admission_Number) === String(value));
  return (
    <div className="space-y-2">
      <div>
        <label className="block text-xs font-medium text-gray-500 mb-1">Student</label>
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 ${colors.ring}`}
        >
          <option value="">Select a student</option>
          {students.map((s) => (
            <option key={s.Admission_Number} value={s.Admission_Number}>
              {`${s.First_Name || ''} ${s.Last_Name || ''}`.trim()} — {s.class}
            </option>
          ))}
        </select>
      </div>
      {student && (
        <div className="bg-gray-50 border border-gray-200 rounded-md px-3 py-2 text-xs text-gray-600 space-y-0.5">
          <p>Admission no: <span className="text-gray-900">{student.Admission_Number}</span></p>
          <p>Parent/guardian: <span className="text-gray-900">{student.parent_guardian || 'N/A'}</span></p>
        </div>
      )}
    </div>
  );
}
