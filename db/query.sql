-- See all departments
SELECT
  department.id AS "ID",
  department.name AS "Department"
FROM department;

-- See all roles, their salaries, and the departments they belong to
SELECT 
  role.id AS "ID", 
  role.title AS "Title", 
  department.name AS "Department",
  role.salary AS "Salary"
FROM role
JOIN department ON role.department_id = department.id;

-- See all employees, their roles, departments, salaries, and their managers
SELECT
  e1.id AS "ID",
  e1.first_name AS "First Name",
  e1.last_name AS "Surname",
  role.title AS "Job Description",
  department.name AS "Department",
  role.salary AS "Salary",
  CONCAT(e2.first_name, ' ', e2.last_name) AS "Manager"
FROM employee e1
JOIN role ON e1.role_id = role.id
JOIN department ON role.department_id = department.id
LEFT JOIN employee e2 ON e1.manager_id = e2.id;

-- Select a manager and see which employees work under them
SELECT 
  CONCAT(e2.first_name, ' ', e2.last_name) AS "Manager",
  CONCAT(e1.first_name, ' ', e1.last_name) AS "Employee"
FROM employee e1
LEFT JOIN employee e2 ON e1.manager_id = e2.id
WHERE e2.id = 1;

-- Select all managers
SELECT
  e1.manager_id AS "value",
  CONCAT(e2.first_name, ' ', e2.last_name) AS "name"
FROM employee e1
INNER JOIN employee e2 ON e1.manager_id = e2.id;

-- Select departments and the roles within each department
SELECT
  department.name AS "Department",
  role.title AS "Role"
FROM department
JOIN role ON department.id = role.department_id;

-- Select departments, roles within the departments, and employees working in those roles
SELECT
  department.name AS "Department",
  role.title AS "Role",
  CONCAT(employee.first_name, ' ', employee.last_name) AS "Employee"
FROM employee
JOIN role ON employee.role_id = role.id
JOIN department ON role.department_id = department.id;

-- Select a department and its total salary
SELECT
  department.name AS "Department",
  SUM(role.salary) AS "Salary"
FROM role
JOIN department ON role.department_id = department.id
WHERE department.id = 2
GROUP BY department.name;

-- Select employees with no manager
SELECT
  employee.id,
  employee.first_name,
  employee.last_name
FROM employee
JOIN role ON employee.role_id = role.id
JOIN department ON role.department_id = department.id
WHERE employee.manager_id IS NULL;

-- Select all managers and their employees, including those with no manager
SELECT 
  e1.*
FROM employee e1
INNER JOIN (
  SELECT DISTINCT manager_id
  FROM employee
) e2 ON e2.manager_id = e1.id
UNION
SELECT *
FROM employee
WHERE manager_id IS NULL;

-- Select just the managers and their IDs
SELECT 
  employee.id AS "value",
  CONCAT(employee.first_name, ' ', employee.last_name) AS "name"
FROM employee
WHERE employee.manager_id IS NULL;