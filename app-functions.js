const mysql = require('mysql');
const inquirer = require('inquirer');
const connect = require('./employeeDBconnect');

const viewEmployees = () => {
    connect.connection.query(`
    SELECT e.first_name AS First, e.last_name AS Last, title, d.name AS department, salary, CONCAT(m.first_name, " ", m.last_name) AS Manager
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

const viewBudget = () => {
    connect.connection.query('SELECT * FROM department', (err, res) => {
        if (err) throw err;
        const deptNames = [];
        res.forEach(item => {
            deptNames.push(`${item.id}: ${item.name}`);
        })
        inquirer
            .prompt([
                {
                    type: 'list',
                    message: 'Which department budget would you like to see?',
                    choices: deptNames,
                    name: 'department'
                },
            ])
            .then(answer => {
                connect.connection.query(
                    `SELECT d.name AS Department, SUM(salary) AS Budget
                    FROM role r
                    JOIN department d
                    ON r.department_id = d.id
                    WHERE ?;`,
                    {
                        department_id: parseInt(answer.department)
                    },
                    (err, res) => {
                        if (err) throw err;
                        console.table(res);
                        connect.start();
                    }
                )
            })
    })
}

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
        const roleNames = [];
        res.forEach(item => {
            roleNames.push(`${item.id}: ${item.title}`);
        })
        connect.connection.query('SELECT * FROM employee', (err, res) => {
            if (err) throw err;
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
        const roles = [];
        res.forEach(item => {
            roles.push(item.title);
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
                let chosenEmpID;
                let chosenRoleID;
                items.forEach(item => {
                    if (`${item.first_name} ${item.last_name}` === emp) {
                        chosenEmpID = item.id;
                    }
                })
                res.forEach(item => {
                    if (item.title === answer.role) {
                        chosenRoleID = item.id;
                    }
                })
                connect.connection.query(
                    'UPDATE employee SET ? WHERE ?',
                    [
                        {
                            role_id: chosenRoleID,
                        },
                        {
                            id: chosenEmpID,
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
const updateManager = () => {
    connect.connection.query('SELECT * FROM employee', (err, res) => {
        if (err) throw err;
        const empNames = [];
        res.forEach(item => {
            empNames.push(`${item.first_name} ${item.last_name}`);
        })
        inquirer
            .prompt([
                {
                    type: 'list',
                    message: 'Which employee are you updating?',
                    choices: empNames,
                    name: 'empchoice'
                },
                {
                    type: 'list',
                    message: 'Who is their new manager?',
                    choices: empNames,
                    name: 'manager'
                }])
            .then(answers => {
                let empID;
                let manID;
                res.forEach(item => {
                    if (`${item.first_name} ${item.last_name}` === answers.empchoice) {
                        empID = item.id;
                    }
                    if (`${item.first_name} ${item.last_name}` === answers.manager) {
                        manID = item.id;
                    }
                })
                connect.connection.query(
                    'UPDATE employee SET ? WHERE ?',
                    [
                        {
                            manager_id: manID,
                        },
                        {
                            id: empID,
                        },
                    ],
                    (err) => {
                        if (err) throw err;
                        console.log(`Manager Updated!\n`);
                        connect.start();
                    }
                );
            })

    })
};


const deptChoose = () => {
    connect.connection.query('SELECT * FROM role', (err, res) => {
        if (err) throw err;
        const roleNames = [];
        res.forEach(item => {
            roleNames.push(item.title);
        })
        inquirer
            .prompt(
                {
                    type: 'list',
                    message: 'Which role are you updating?',
                    choices: roleNames,
                    name: 'rolechoice'
                })
            .then(answer => {
                let roleID;
                res.forEach(item => {
                    if (item.title === answer.rolechoice) {
                        roleID = item.id
                    }
                })
                updateDept(roleID)
            })

    })
};

const updateDept = (ID) => {
    connect.connection.query('SELECT * FROM department', (err, res) => {
        if (err) throw err;
        const depts = [];
        res.forEach(item => {
            depts.push(item.name);
        })
        console.log(depts);

        inquirer
            .prompt([
                {
                    type: 'list',
                    message: 'Which department is this role now in?',
                    choices: depts,
                    name: 'dept'
                }
            ])
            .then(answer => {
                let chosenDept;
                for (const item of res) {
                    if (item.name === answer.dept) {
                        chosenDept = item.id;
                    }
                }
                connect.connection.query(
                    'UPDATE role SET ? WHERE ?',
                    [
                        {
                            department_id: chosenDept,
                        },
                        {
                            id: ID,
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



const removeEmployee = () => {
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
                    message: 'Which employee are you removing?',
                    choices: empNames,
                    name: 'empchoice'
                }
            )
            .then(answer => {
                let chosenEmp;
                for (const item of res) {
                    if (`${item.first_name} ${item.last_name}` === answer.empchoice) {
                        chosenEmp = item;
                    }
                }
                connect.connection.query(
                    'DELETE FROM employee WHERE ?',
                    {
                        id: chosenEmp.id,
                    },
                    (err) => {
                        if (err) throw err;
                        console.log(`${chosenEmp.first_name} deleted!\n`);
                        connect.start();
                    }
                );
            })
    })

};

const removeRole = () => {
    connect.connection.query('SELECT * FROM role', (err, res) => {
        if (err) throw err;
        const roles = [];
        res.forEach(item => {
            roles.push(`${item.title}`);
        })
        inquirer
            .prompt([
                {
                    type: 'list',
                    message: 'Which role would you like to remove?',
                    choices: roles,
                    name: 'role'
                }
            ])
            .then(answer => {
                let chosenRole;
                for (const item of res) {
                    if (`${item.title}` === answer.role) {
                        chosenRole = item;
                    }
                }
                connect.connection.query('SELECT * FROM employee', (err, res) => {
                    if (err) throw err;
                    let chosenEmp;
                    for (const item of res) {
                        if (item.role_id === chosenRole.id) {
                            chosenEmp = item;
                        }
                    }
                    if (chosenEmp.role_id === chosenRole.id) {
                        console.log(`You can't remove a role that a current employee has!`);
                        removeRole();
                    } else {
                        connect.connection.query(
                            'DELETE FROM role WHERE ?',
                            {
                                id: chosenRole.id,
                            },
                            (err) => {
                                if (err) throw err;
                                console.log(`${chosenRole.title} deleted!\n`);
                                connect.start();
                            }
                        )
                    }
                })
            })
    })
}


const removeDept = () => {
    connect.connection.query('SELECT * FROM department', (err, res) => {
        if (err) throw err;
        const depts = [];
        res.forEach(item => {
            depts.push(item.name);
        })
        console.log(depts);
        inquirer
            .prompt([
                {
                    type: 'list',
                    message: 'Which department would you like to remove?',
                    choices: [`${depts}`, `Return`],
                    name: 'dept'
                }
            ])
            .then(answer => {
                if (answer.dept === 'Return') {
                    connect.start();
                } else {
                    let chosenDept;
                    for (const item of res) {
                        if (item.name === answer.dept) {
                            chosenDept = item.id;
                        }
                    }
                    connect.connection.query('SELECT * FROM role', (err, res) => {
                        if (err) throw err;
                        let chosenRole;
                        for (const item of res) {
                            if (item.department_id === chosenDept) {
                                chosenRole = item.department_id;
                            }
                        }
                        if (chosenRole === chosenDept) {
                            console.log(`You can't remove a department with current roles!`);
                            removeDept();
                        } else {
                            connect.connection.query(
                                'DELETE FROM department WHERE ?',
                                [
                                    {
                                        id: chosenDept,
                                    },
                                ],
                                (err) => {
                                    if (err) throw err;
                                    console.log(`Department removed!\n`);
                                    connect.start();
                                }
                            );
                        }
                    })
                }
            })
    })
}

const viewEmpsByMan = () => {
    connect.connection.query(`
    SELECT distinct CONCAT(m.first_name, " ", m.last_name) AS Manager
        FROM employee e
        LEFT JOIN employee m 
        ON m.id = e.manager_id;`,
        (err, res) => {
            if (err) throw err;
            const managers = [];
            res.forEach(item => {
                if (item.Manager !== null) {
                    managers.push(`${item.Manager}`);
                }
            })
            inquirer
                .prompt([
                    {
                        type: 'list',
                        message: 'From which manager would you like to see their employees?',
                        choices: managers,
                        name: 'manager'
                    }
                ])
                .then(answer => {
                    connect.connection.query(
                        `SELECT e.first_name, e.last_name, title, d.name AS department, salary, CONCAT(m.first_name, " ", m.last_name) AS Manager
                    FROM employee e
                    LEFT JOIN employee m 
                    ON m.id = e.manager_id
                    JOIN role r
                    ON e.role_id = r.id
                    LEFT JOIN department d
                    ON r.department_id = d.id
                    WHERE CONCAT(m.first_name, " ", m.last_name) = '${answer.manager}';`,
                        (err, res) => {
                            if (err) throw err;
                            console.table(res);
                            connect.start();
                        })
                })
        }
    )
}











module.exports.viewEmployees = viewEmployees;
module.exports.viewDepartments = viewDepartments;
module.exports.viewRoles = viewRoles;
module.exports.viewBudget = viewBudget;
module.exports.addDepartment = addDepartment;
module.exports.addRole = addRole;
module.exports.addEmployee = addEmployee;
module.exports.empChoose = empChoose;
module.exports.updateRole = updateRole;
module.exports.deptChoose = deptChoose;
module.exports.updateDept = updateDept;
module.exports.updateManager = updateManager;
module.exports.removeEmployee = removeEmployee;
module.exports.removeRole = removeRole;
module.exports.removeDept = removeDept;
module.exports.viewEmpsByMan = viewEmpsByMan;