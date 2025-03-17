const inquirer = require('inquirer');
const { Pool } = require('pg');
require('dotenv').config(); // Ensure .env file is loaded

const pool = new Pool({
  user: process.env.DB_USER,        // Correct env variable name
  password: process.env.DB_PASSWORD, // Remove incorrect quotes
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
});

const queryDB = async (query, params = []) => {
  try {
    const { rows } = await pool.query(query, params);
    return rows;
  } catch (err) {
    console.error('Error executing query:', err);
  }
};


// Get options from the database
const getOptions = async (query) => {
  const rows = await queryDB(query);
  return rows.map(row => ({ value: row.id, name: row.name || `${row.first_name} ${row.last_name}` }));
};

// Prompt user
const promptUser = async (questions) => {
  return inquirer.prompt(questions);
};

// Main function
const main = async () => {
  while (true) {
    const { userChoice } = await promptUser([
      {
        type: 'list',
        message: 'What would you like to do?',
        choices: [
          'View All Employees', 'Add Employee', 'Update Employee Role', 'View All Roles', 'Add Role',
          'View All Departments', 'Add Department', 'View Employees By Manager', 'View Employees By Department',
          'Remove an Employee', 'View Budget', 'Quit'
        ],
        name: 'userChoice'
      }
    ]);

    switch (userChoice) {
      case 'View All Employees':
        console.table(await queryDB(`
          SELECT e1.id AS "ID", e1.first_name AS "First Name", e1.last_name AS "Last Name",
                 r.title AS "Role", d.name AS "Department", r.salary AS "Salary",
                 CONCAT(m.first_name, ' ', m.last_name) AS "Manager"
          FROM employee e1
          JOIN role r ON e1.role_id = r.id
          JOIN department d ON r.department_id = d.id
          LEFT JOIN employee m ON e1.manager_id = m.id;
        `));
        break;

      case 'View All Roles':
        console.table(await queryDB(`
          SELECT r.id AS "ID", r.title AS "Title", d.name AS "Department", r.salary AS "Salary"
          FROM role r
          JOIN department d ON r.department_id = d.id;
        `));
        break;

      case 'View All Departments':
        console.table(await queryDB('SELECT id AS "ID", name AS "Department" FROM department'));
        break;

      case 'Add Employee':
        const employeeData = await promptUser([
          { type: 'input', message: "What is the employee's first name?", name: 'first_name' },
          { type: 'input', message: "What is the employee's last name?", name: 'last_name' },
          { type: 'list', message: "What is the employee's role?", choices: await getOptions('SELECT id AS "id", title AS "name" FROM role'), name: 'role_id' },
          { type: 'list', message: "Who is the employee's manager?", choices: [...await getOptions('SELECT id AS "id", first_name AS "name" FROM employee WHERE manager_id IS NULL'), { value: 0, name: 'None' }], name: 'manager_id' }
        ]);
        await queryDB('INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES ($1, $2, $3, $4)', [
          employeeData.first_name,
          employeeData.last_name,
          employeeData.role_id,
          employeeData.manager_id === 0 ? null : employeeData.manager_id
        ]);
        break;

      case 'Add Role':
        const roleData = await promptUser([
          { type: 'input', message: 'What is the name of the role?', name: 'title' },
          { type: 'number', message: 'What is the salary of the role?', name: 'salary' },
          { type: 'list', message: 'What department does the role belong to?', choices: await getOptions('SELECT id AS "id", name AS "name" FROM department'), name: 'department_id' }
        ]);
        await queryDB('INSERT INTO role (title, salary, department_id) VALUES ($1, $2, $3)', [
          roleData.title,
          roleData.salary,
          roleData.department_id
        ]);
        break;

      case 'Add Department':
        const deptData = await promptUser([{ type: 'input', message: 'What is the name of the department?', name: 'name' }]);
        await queryDB('INSERT INTO department (name) VALUES ($1)', [deptData.name]);
        break;

      case 'Update Employee Role':
        const updateData = await promptUser([
          { type: 'list', message: "Which employee's role do you want to update?", choices: await getOptions('SELECT id AS "id", first_name || \' \' || last_name AS "name" FROM employee'), name: 'employee_id' },
          { type: 'list', message: "Which role do you want to assign to the selected employee?", choices: await getOptions('SELECT id AS "id", title AS "name" FROM role'), name: 'role_id' }
        ]);
        await queryDB('UPDATE employee SET role_id = $1 WHERE id = $2', [updateData.role_id, updateData.employee_id]);
        break;

      case 'View Employees By Manager':
        const managerData = await promptUser([
          { type: 'list', message: "Choose which manager you'd like to view the employees of:", choices: [...await getOptions('SELECT id AS "id", first_name || \' \' || last_name AS "name" FROM employee WHERE manager_id IS NULL'), { value: 0, name: 'All Managers' }], name: 'manager_id' }
        ]);
        const managerQuery = managerData.manager_id === 0 ?
          `SELECT CONCAT(e2.first_name, ' ', e2.last_name) AS "Manager", CONCAT(e1.first_name, ' ', e1.last_name) AS "Employee"
           FROM employee e1 LEFT JOIN employee e2 ON e1.manager_id = e2.id` :
          `SELECT CONCAT(e2.first_name, ' ', e2.last_name) AS "Manager", CONCAT(e1.first_name, ' ', e1.last_name) AS "Employee"
           FROM employee e1 LEFT JOIN employee e2 ON e1.manager_id = e2.id WHERE e2.id = $1`;
        console.table(await queryDB(managerQuery, managerData.manager_id === 0 ? [] : [managerData.manager_id]));
        break;

      case 'View Employees By Department':
        const deptViewData = await promptUser([
          { type: 'list', message: "Choose which department you want to view:", choices: await getOptions('SELECT id AS "id", name AS "name" FROM department'), name: 'department_id' }
        ]);
        console.table(await queryDB(`
          SELECT d.name AS "Department", r.title AS "Role", CONCAT(e.first_name, ' ', e.last_name) AS "Employee"
          FROM employee e
          JOIN role r ON e.role_id = r.id
          JOIN department d ON r.department_id = d.id
          WHERE d.id = $1
        `, [deptViewData.department_id]));
        break;

      case 'Remove an Employee':
        const removeEmployeeData = await promptUser([
          { type: 'list', message: "Choose which employee you want to delete:", choices: await getOptions('SELECT id AS "id", first_name || \' \' || last_name AS "name" FROM employee'), name: 'employee_id' }
        ]);
        await queryDB('DELETE FROM employee WHERE id = $1', [removeEmployeeData.employee_id]);
        break;

      case 'View Budget':
        const budgetData = await promptUser([
          { type: 'list', message: "Choose which department you want to view:", choices: [...await getOptions('SELECT id AS "id", name AS "name" FROM department'), { value: 0, name: 'All Departments' }], name: 'department_id' }
        ]);
        const budgetQuery = budgetData.department_id === 0 ?
          `SELECT d.name AS "Department", SUM(r.salary) AS "Salary"
           FROM role r
           JOIN department d ON r.department_id = d.id
           GROUP BY d.name` :
          `SELECT d.name AS "Department", SUM(r.salary) AS "Salary"
           FROM role r
           JOIN department d ON r.department_id = d.id
           WHERE d.id = $1
           GROUP BY d.name`;
        console.table(await queryDB(budgetQuery, budgetData.department_id === 0 ? [] : [budgetData.department_id]));
        break;

      case 'Quit':
        process.exit(0);
    }
  }
};

main();