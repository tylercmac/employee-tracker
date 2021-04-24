const mysql = require('mysql');
const inquirer = require('inquirer');
const connect = require('./employeeDBconnect');

const viewEmployees = () => {
    connect.connection.query(`
    SELECT e.first_name, e.last_name, title, d.name AS department, salary, CONCAT(m.first_name, " ", m.last_name) AS Manager
    FROM employee e
    LEFT JOIN employee m 
    ON m.id = e.manager_id
    JOIN role r
    ON e.role_id = r.id
    LEFT JOIN department d
    ON r.department_id = d.id;`,
        (err, res) => {
            if (err) throw err;
            console.table(res);
            connect.start();
        });
};

const viewDepartments = () => {
    connect.connection.query(`
    SELECT department.name
    FROM department`,
        (err, res) => {
            if (err) throw err;
            console.table(res);
            connect.start();
        });
};

const viewRoles = () => {
    connect.connection.query(`
    SELECT title, salary, d.name AS department
    FROM role r
    LEFT JOIN department d
    ON r.department_id = d.id;`,
        (err, res) => {
            if (err) throw err;
            console.table(res);
            connect.start();
        });
};

const addDepartment = () => {
    console.log('Add a department!\n');
    inquirer
        .prompt([
            {
                type: 'input',
                message: 'Enter the department name:',
                name: 'name'
            }
        ])
        .then(answers => {
            connect.connection.query(
                'INSERT INTO department SET ?',
                {
                    name: answers.name,
                },
                (err, res) => {
                    if (err) throw err;
                    console.log(`${answers.name} added!\n`);
                    connect.start();
                }
            );
        })
        .catch(err => {
            if (err) throw err;
        })
};

const addRole = () => {
    console.log('Add a Role!\n');
    connect.connection.query('SELECT * FROM department', (err, res) => {
        if (err) throw err;
        const deptNames = [];
        res.forEach(item => {
            deptNames.push(`${item.id}: ${item.name}`);
        })
        inquirer
            .prompt([
                {
                    type: 'input',
                    message: 'Enter the role title:',
                    name: 'name'
                },
                {
                    type: 'input',
                    message: 'Enter the salary:',
                    name: 'salary',
                    validate: (value) => {
                        if (Number(value)) {
                            return true;
                        }
                        return false;
                    }
                },
                {
                    type: 'list',
                    message: 'Which department is it in?',
                    choices: deptNames,
                    name: 'department'
                },
            ])
            .then(answers => {
                connect.connection.query(
                    `INSERT INTO role SET ?;`,
                    {
                        title: answers.name,
                        salary: answers.salary,
                        department_id: parseInt(answers.department)
                    },
                    (err, res) => {
                        if (err) throw err;
                        console.log(`${answers.name} added!\n`);
                        connect.start();
                    }
                );
            })
            .catch(err => {
                if (err) throw err;
            })
    })
};

const addEmployee = () => {
    console.log('Add an Employee!\n');
    connect.connection.query('SELECT * FROM role', (err, res) => {
        if (err) throw err;
        console.table(res);
        const roleNames = [];
        res.forEach(item => {
            roleNames.push(`${item.id}: ${item.title}`);
        })
        connect.connection.query('SELECT * FROM employee', (err, res) => {
            if (err) throw err;
            console.table(res);
            const empNames = ['None'];
            res.forEach(item => {
                empNames.push(`${item.id}: ${item.first_name} ${item.last_name}`);
            })
            inquirer
                .prompt([
                    {
                        type: 'input',
                        message: 'Enter their first name:',
                        name: 'firstname'
                    },
                    {
                        type: 'input',
                        message: 'Enter their last name:',
                        name: 'lastname'
                    },
                    {
                        type: 'list',
                        message: 'What is their role?',
                        choices: roleNames,
                        name: 'role'
                    },
                    {
                        type: 'list',
                        message: 'Who is their manager?',
                        choices: empNames,
                        name: 'manager'
                    },
                ])
                .then(answers => {
                    if (answers.manager === 'None') {
                        answers.manager = 0
                    }
                    connect.connection.query(
                        `INSERT INTO employee SET ?;`,
                        {
                            first_name: answers.firstname,
                            last_name: answers.lastname,
                            role_id: parseInt(answers.role),
                            manager_id: parseInt(answers.manager)
                        },
                        (err, res) => {
                            if (err) throw err;
                            console.log(`${answers.firstname} added!\n`);
                            connect.start();
                        }
                    );
                })
                .catch(err => {
                    if (err) throw err;
                })
        })
    })
};


const empChoose = () => {
    connect.connection.query('SELECT * FROM employee', (err, res) => {
        if (err) throw err;
        console.table(res);
        const empNames = [];
        res.forEach(item => {
            empNames.push(`${item.first_name} ${item.last_name}`);
        })
        inquirer
            .prompt(
                {
                    type: 'list',
                    message: 'Which employee are you updating?',
                    choices: empNames,
                    name: 'empchoice'
                })
            .then(answers => {
                updateRole(answers.empchoice, res)
            })

    })
};

const updateRole = (emp, items) => {
    connect.connection.query('SELECT * FROM role', (err, res) => {
        if (err) throw err;
        console.table(res);
        const roles = [];
        res.forEach(item => {
            roles.push(`${item.id}: ${item.title}`);
        })
        inquirer
            .prompt([
                {
                    type: 'list',
                    message: 'Which role does this employee now have?',
                    choices: roles,
                    name: 'role'
                }
            ])
            .then(answer => {
                let chosenEmp;
                for (const item of items) {
                    if (`${item.first_name} ${item.last_name}` === emp) {
                        chosenEmp = item;
                    }
                }
                connect.connection.query(
                    'UPDATE employee SET ? WHERE ?',
                    [
                        {
                            role_id: parseInt(answer.role),
                        },
                        {
                            id: chosenEmp.id,
                        },
                    ],
                    (err) => {
                        if (err) throw err;
                        console.log(`Role Updated!\n`);
                        connect.start();
                    }
                );
            })
    })
}












module.exports.viewEmployees = viewEmployees;
module.exports.viewDepartments = viewDepartments;
module.exports.viewRoles = viewRoles;
module.exports.addDepartment = addDepartment;
module.exports.addRole = addRole;
module.exports.addEmployee = addEmployee;
module.exports.empChoose = empChoose;
module.exports.updateRole = updateRole;