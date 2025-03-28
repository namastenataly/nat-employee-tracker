-- Drop the database if it exists and create a new one
DROP DATABASE IF EXISTS employees_db;
CREATE DATABASE employees_db;

-- Connect to the newly created database
\c employees_db;

-- Create the department table
CREATE TABLE department (
  id SERIAL PRIMARY KEY,
  name VARCHAR(30) UNIQUE NOT NULL
);

-- Create the role table
CREATE TABLE role (
  id SERIAL PRIMARY KEY,
  title VARCHAR(30) UNIQUE NOT NULL,
  salary DECIMAL NOT NULL,
  department_id INTEGER NOT NULL,
  
  FOREIGN KEY (department_id)
  REFERENCES department(id)
  ON DELETE SET NULL
);

-- Create the employee table
CREATE TABLE employee (
  id SERIAL PRIMARY KEY,
  first_name VARCHAR(30) NOT NULL,
  last_name VARCHAR(30) NOT NULL,
  role_id INTEGER NOT NULL,
  manager_id INTEGER,
  
  FOREIGN KEY (role_id)
  REFERENCES role(id)
  ON DELETE SET NULL,

  FOREIGN KEY (manager_id)
  REFERENCES employee(id)
  ON DELETE SET NULL
);