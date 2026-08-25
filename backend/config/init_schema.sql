-- Disable foreign key checks temporarily
SET FOREIGN_KEY_CHECKS = 0;

-- 1. Branches (Top Level)
CREATE TABLE IF NOT EXISTS branches (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Students (Core Details)
CREATE TABLE IF NOT EXISTS students (
    id INT AUTO_INCREMENT PRIMARY KEY,
    first_name VARCHAR(255) NOT NULL,
    middle_name VARCHAR(255),
    last_name VARCHAR(255) NOT NULL,
    parent_guardian VARCHAR(255),
    date_of_birth DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Student Enrollments (Links Student to Branch & Class)
CREATE TABLE IF NOT EXISTS student_enrollments (
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
CREATE TABLE IF NOT EXISTS fee_categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    default_amount DECIMAL(10,2)
);

-- 5b. Tuition fee schedule by class group and school term
CREATE TABLE IF NOT EXISTS tuition_fee_structure (
    class_group VARCHAR(50) NOT NULL,
    term VARCHAR(32) NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    PRIMARY KEY (class_group, term)
);

-- 6. Invoices (Belongs to Student)
CREATE TABLE IF NOT EXISTS invoices (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT NOT NULL,
    invoice_date DATE NOT NULL,
    due_date DATE NOT NULL,
    total_amount DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    status ENUM('Unpaid', 'Partial', 'Paid') DEFAULT 'Unpaid',
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
);

-- 7. Invoice Items (Belongs to Invoice, Links to Fee Category)
CREATE TABLE IF NOT EXISTS invoice_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    invoice_id INT NOT NULL,
    fee_category_id INT NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (invoice_id) REFERENCES invoices(id) ON DELETE CASCADE,
    FOREIGN KEY (fee_category_id) REFERENCES fee_categories(id) ON DELETE RESTRICT
);

-- 8. Payments (Belongs to Student)
CREATE TABLE IF NOT EXISTS payments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT NOT NULL,
    receipt_no VARCHAR(255) UNIQUE NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    payment_method VARCHAR(255) NOT NULL,
    payment_date DATE NOT NULL,
    fee_category_id INT NULL,
    term VARCHAR(32) NULL,
    remarks TEXT,
    status ENUM('Pending', 'Success', 'Failed') DEFAULT 'Success',
    mpesa_receipt_number VARCHAR(255) NULL UNIQUE,
    checkout_request_id VARCHAR(255) NULL,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    FOREIGN KEY (fee_category_id) REFERENCES fee_categories(id) ON DELETE SET NULL
);

SET FOREIGN_KEY_CHECKS = 1;

-- Seed Data (Uses IGNORE to avoid duplicating if already exists)

-- Insert branches
INSERT IGNORE INTO branches (name) VALUES 
('Githurai Branch'),
('Umoja Branch'),
('Kirigiti Branch'),
('MugumoBranch');

-- Insert Fee Categories
INSERT IGNORE INTO fee_categories (code, name, default_amount) VALUES
('TUI', 'Tuition fee', 15000.00);

INSERT IGNORE INTO tuition_fee_structure (class_group, term, amount) VALUES
('Playgroup', 'T1-2026', 10800.00), ('Playgroup', 'T2-2026', 9000.00), ('Playgroup', 'T3-2026', 8500.00),
('PP1', 'T1-2026', 11500.00), ('PP1', 'T2-2026', 10700.00), ('PP1', 'T3-2026', 10200.00),
('PP2', 'T1-2026', 11500.00), ('PP2', 'T2-2026', 10700.00), ('PP2', 'T3-2026', 12200.00),
('Grade 1-3', 'T1-2026', 12800.00), ('Grade 1-3', 'T2-2026', 12000.00), ('Grade 1-3', 'T3-2026', 11500.00),
('Grade 4-5', 'T1-2026', 16300.00), ('Grade 4-5', 'T2-2026', 15000.00), ('Grade 4-5', 'T3-2026', 14500.00),
('Grade 6', 'T1-2026', 17800.00), ('Grade 6', 'T2-2026', 16500.00), ('Grade 6', 'T3-2026', 18000.00),
('Grade 7-8', 'T1-2026', 19500.00), ('Grade 7-8', 'T2-2026', 19000.00), ('Grade 7-8', 'T3-2026', 18500.00),
('Grade 9', 'T1-2026', 19500.00), ('Grade 9', 'T2-2026', 19000.00), ('Grade 9', 'T3-2026', 21500.00);
