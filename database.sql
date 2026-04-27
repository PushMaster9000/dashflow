-- DashFlow Database Schema

CREATE DATABASE IF NOT EXISTS dashflow_db;
USE dashflow_db;

-- Table for Users (Authentication)
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert default admin user (password is 'admin123' hashed with MD5 for simplicity in this lab, though bcrypt is better)
-- Using a simple hash for demonstration. MD5('admin123') = 0192023a7bbd73250516f069df18b500
INSERT IGNORE INTO users (username, password) VALUES ('admin', '0192023a7bbd73250516f069df18b500');

-- Table for Tasks
CREATE TABLE IF NOT EXISTS tasks (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    status ENUM('todo', 'in_progress', 'done') DEFAULT 'todo',
    priority ENUM('low', 'medium', 'high') DEFAULT 'medium',
    due_date DATE NULL,
    user_id INT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table for Smart Notes
CREATE TABLE IF NOT EXISTS notes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    user_id INT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Insert some dummy data for initial view
INSERT INTO tasks (title, status, priority, due_date) VALUES 
('Finish Web Dev Lab Project', 'in_progress', 'high', '2026-05-01'),
('Review PHP Notes', 'todo', 'medium', '2026-04-25');

INSERT INTO notes (title, content) VALUES
('Meeting Notes', 'Need to integrate weather API and dark mode mandatory');

-- Table for Habits
CREATE TABLE IF NOT EXISTS habits (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    streak INT DEFAULT 0,
    user_id INT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table for Reminders
CREATE TABLE IF NOT EXISTS reminders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    message VARCHAR(255) NOT NULL,
    reminder_time DATETIME NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    user_id INT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
