-- Insert departments
INSERT INTO department (name)
VALUES
  ('Marketing'),
  ('Product Development'),
  ('Human Resources'),
  ('Operations');

-- Insert roles
INSERT INTO role (title, salary, department_id)
VALUES
  ('Marketing Manager', 105000, 1),
  ('Marketing Specialist', 85000, 1),
  ('Product Lead', 155000, 2),
  ('Product Designer', 115000, 2),
  ('HR Director', 165000, 3),
  ('Recruiter', 130000, 3),
  ('Operations Manager', 260000, 4),
  ('Logistics Coordinator', 195000, 4);

-- Insert employees
INSERT INTO employee (first_name, last_name, role_id, manager_id)
VALUES
  ('Alice', 'Johnson', 1, NULL),
  ('Bob', 'Smith', 2, 1),
  ('Carol', 'White', 3, NULL),
  ('David', 'Lee', 4, 3),
  ('Eve', 'Davis', 5, NULL),
  ('Frank', 'Miller', 6, 5),
  ('Grace', 'Wilson', 7, NULL),
  ('Henry', 'Taylor', 8, 7);