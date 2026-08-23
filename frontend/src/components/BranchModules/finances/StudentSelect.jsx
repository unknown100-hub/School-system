import { useState, useEffect } from "react";

export default function StudentSelect({ students, value, onChange, colors }) {
  const [inputValue, setInputValue] = useState("");
  
  const student = students.find((s) => String(s.Admission_Number) === String(value));

  useEffect(() => {
    if (!value) {
      setInputValue("");
    } else if (student) {
      setInputValue(`${student.First_Name || ''} ${student.Last_Name || ''}`.trim());
    }
  }, [value, student]);

  const handleInputChange = (e) => {
    const newVal = e.target.value;
    setInputValue(newVal);
    
    const matchedStudent = students.find(s => `${s.First_Name || ''} ${s.Last_Name || ''}`.trim() === newVal);
    
    if (matchedStudent) {
      onChange(matchedStudent.Admission_Number);
    } else {
      onChange(newVal);
    }
  };

  return (
    <div className="space-y-2">
      <div>
        <label className="block text-xs font-medium text-gray-500 mb-1">Student</label>
        <div className="relative">
          <input
            type="text"
            list="student-list"
            value={inputValue}
            onChange={handleInputChange}
            placeholder="Type a name to search or select..."
            className={`w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 ${colors.ring}`}
            style={{ border: "1px solid #d1d5db" }}
          />
          <datalist id="student-list">
            {students.map((s) => (
              <option key={s.Admission_Number} value={`${s.First_Name || ''} ${s.Last_Name || ''}`.trim()}>
                {s.class} (Adm: {s.Admission_Number})
              </option>
            ))}
          </datalist>
        </div>
      </div>
      {student && (
        <div className="bg-gray-50 border border-gray-200 rounded-md px-3 py-2 text-xs text-gray-600 space-y-0.5" style={{ background: "#f9fafb", border: "1px solid #e5e7eb", marginTop: "8px" }}>
          <p>Admission no: <span className="text-gray-900" style={{ color: "#111827" }}>{student.Admission_Number}</span></p>
          <p>Parent/guardian: <span className="text-gray-900" style={{ color: "#111827" }}>{student.parent_guardian || 'N/A'}</span></p>
        </div>
      )}
    </div>
  );
}
