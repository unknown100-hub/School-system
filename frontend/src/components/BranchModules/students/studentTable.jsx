import StudentRow from "./StudentRow";

export default function StudentTable({ students, onEditStudent, onDeleteStudent }) {
    return (
        <table className="student-table">
            <thead>
                <tr>
                    <th aria-label="Select student"></th>
                    <th>Admission number</th>
                    <th>First name</th>
                    <th>Middle name</th>
                    <th>Last name</th>
                    <th>Parent/Guardian</th>
                    <th>Class</th>
                    <th>Date of birth</th>
                    <th>Branch</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                {students.map((student) => (
                    <StudentRow
                        key={student.Admission_Number ?? student.admNumber}
                        student={student}
                        onEditStudent={onEditStudent}
                        onDeleteStudent={onDeleteStudent}
                    />
                ))}
            </tbody>
        </table>
    );
}
