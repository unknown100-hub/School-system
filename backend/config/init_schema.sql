-- Disable foreign key checks to drop tables safely
SET FOREIGN_KEY_CHECKS = 0;

-- Drop tables if they exist
DROP TABLE IF EXISTS invoice_items;
DROP TABLE IF EXISTS payments;
DROP TABLE IF EXISTS invoices;
DROP TABLE IF EXISTS fee_categories;
DROP TABLE IF EXISTS student_enrollments;
DROP TABLE IF EXISTS branches;
DROP TABLE IF EXISTS students;

SET FOREIGN_KEY_CHECKS = 1;

-- 1. Branches (Top Level)
CREATE TABLE branches (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);



-- 3. Students (Core Details)
CREATE TABLE students (
    id INT AUTO_INCREMENT PRIMARY KEY,
    first_name VARCHAR(255) NOT NULL,
    middle_name VARCHAR(255),
    last_name VARCHAR(255) NOT NULL,
    parent_guardian VARCHAR(255),
    date_of_birth DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Student Enrollments (Links Student to Branch & Class)
CREATE TABLE student_enrollments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT NOT NULL,
    branch_id INT NOT NULL,
    class_name VARCHAR(255) NOT NULL,
    admission_number VARCHAR(255) UNIQUE NOT NULL,
    enrollment_date DATE NOT NULL,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE CASCADE
);

-- 5. Fee Categories (Master list of fee types)
CREATE TABLE fee_categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL, -- e.g., 'TUI', 'BUS'
    name VARCHAR(255) NOT NULL,       -- e.g., 'Tuition Fee'
    default_amount DECIMAL(10,2)
);

-- 6. Invoices (Belongs to Student)
CREATE TABLE invoices (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT NOT NULL,
    invoice_date DATE NOT NULL,
    due_date DATE NOT NULL,
    total_amount DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    status ENUM('Unpaid', 'Partial', 'Paid') DEFAULT 'Unpaid',
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
);

-- 7. Invoice Items (Belongs to Invoice, Links to Fee Category)
CREATE TABLE invoice_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    invoice_id INT NOT NULL,
    fee_category_id INT NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (invoice_id) REFERENCES invoices(id) ON DELETE CASCADE,
    FOREIGN KEY (fee_category_id) REFERENCES fee_categories(id) ON DELETE RESTRICT
);

-- 8. Payments (Belongs to Student)
CREATE TABLE payments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT NOT NULL,
    receipt_no VARCHAR(255) UNIQUE NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    payment_method VARCHAR(255) NOT NULL,
    payment_date DATE NOT NULL,
    remarks TEXT,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
);

-- Seed Data

-- Insert branches
INSERT INTO branches (name) VALUES 
('Githurai Branch'),
('Umoja Branch'),
('Kirigiti Branch'),
('MugumoBranch');

-- Insert Fee Categories
INSERT INTO fee_categories (code, name, default_amount) VALUES
('TUI', 'Tuition fee', 15000.00),
('BUS', 'Transport fee', 5000.00),
('BKG', 'Book fee', 2000.00);
