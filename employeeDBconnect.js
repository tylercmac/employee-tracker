const mysql = require('mysql');
const inquirer = require('inquirer');
const appFunc = require('./app-functions');

const connection = mysql.createConnection({
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: 'password',
    database: 'employees_DB',
});

connection.connect((err) => {
    if (err) throw err;
    console.log(`connected as id ${connection.threadId}
`);
    start();
});

function start() {
    inquirer
        .prompt({
            type: 'list',
            message: 'EMPLOYEE MANAGER',
            choices: ['View All Employees', 'View All Departments', 'View All Roles', 'Add Employee', 'Add Department', 'Add Role', 'Update Role', 'Exit'],
            name: 'choices'
        })
        .then(answers => {
            switch (answers.choices) {
                case 'View All Employees':
                    appFunc.viewEmployees();
                    break;
                case 'View All Departments':
                    appFunc.viewDepartments();
                    break;
                case 'View All Roles':
                    appFunc.viewRoles();
                    break;
                case 'Add Employee':
                    appFunc.addEmployee();
                    break;
                case 'Add Department':
                    appFunc.addDepartment();
                    break;
                case 'Add Role':
                    appFunc.addRole();
                    break;
                case 'Update Role':
                    appFunc.empChoose();
                    break;
                default:
                    console.log('Thanks for using our app!');
                    connection.end();
            }
        })
}

module.exports.start = start;
module.exports.connection = connection;
