const db = require('../config/db');

exports.getStudents = async (req, res) => {
    try {
        const { search } = req.query;

        let query = `
            SELECT
                s.id, 
                s.Admission_Number,
                s.First_Name, 
                s.Middle_Name,
                s.Last_Name,
                s.parent_guardian, 
                s.class
            FROM students AS s
        `;

        const params = [];

        if (search) {
            query += `
                WHERE 
                    s.First_Name LIKE ? OR
                    s.Last_Name LIKE ? OR
                    s.Admission_Number LIKE ?
            `;
            const searchPattern = `%${search}%`;
            params.push(searchPattern, searchPattern, searchPattern);
        }

        query += ` ORDER BY s.id DESC LIMIT 10`;

        const [rows] = await db.query(query, params);

        // 🔥 return raw DB data
        res.json(rows);

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Unable to retrieve student list.' });
    }
};