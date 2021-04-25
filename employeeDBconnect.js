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
    fs.readFile('ascii.txt', 'utf8', (err, data) => {
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
            choices: ['View All Employees', 'View All Departments', 'View All Roles', 'Add Employee', 'Add Department', 'Add Role', 'Update Role', 'Remove Employee', 'Remove Role', 'Exit'],
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
                case 'Remove Employee':
                    appFunc.removeEmployee();
                    break;
                case 'Remove Role':
                    appFunc.removeRole();
                    break;
                default:
                    console.log('Thanks for using our app!');
                    connection.end();
            }
        })
};


module.exports.start = start;
module.exports.connection = connection;
