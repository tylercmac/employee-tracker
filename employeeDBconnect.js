const mysql = require('mysql');
const inquirer = require('inquirer');
const appFunc = require('./app-functions');
const fs = require('fs');

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
    fs.readFile('ascii1.txt', 'utf8', (err, data) => {
        if (err) throw err;
        console.log(data);
        start();
    })
});

function start() {
    inquirer
        .prompt({
            type: 'list',
            message: 'What would you like to do?',
            choices: ['View All Employees', 'View All Departments', 'View All Roles', 'View Budget by Department', 'View All Employees by Manager', 'Add Employee', 'Add Department', 'Add Role', 'Update Role for Employee', 'Update Department for Role', 'Update Manager for Employee', 'Remove Employee', 'Remove Role', 'Remove Department', 'EXIT'],
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
                case 'View Budget by Department':
                    appFunc.viewBudget();
                    break;
                case 'View All Employees by Manager':
                    appFunc.viewEmpsByMan();
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
                case 'Update Role for Employee':
                    appFunc.empChoose();
                    break;
                case 'Update Manager for Employee':
                    appFunc.updateManager();
                    break;
                case 'Update Department for Role':
                    appFunc.deptChoose();
                    break;
                case 'Remove Employee':
                    appFunc.removeEmployee();
                    break;
                case 'Remove Role':
                    appFunc.removeRole();
                    break;
                case 'Remove Department':
                    appFunc.removeDept();
                    break;
                default:
                    fs.readFile('ascii2.txt', 'utf8', (err, data) => {
                        if (err) throw err;
                        console.log(data);
                        connection.end();
                    })
            }
        })
};


module.exports.start = start;
module.exports.connection = connection;
