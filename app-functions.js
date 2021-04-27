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
            console.log(`----------------------------`)
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
            console.log(`----------------------------`)
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
            console.log(`----------------------------`)
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
                        console.log(`----------------------------`)
                        connect.start();
                    }
                )
            })
    })
}

const addDepartment = () => {
    inquirer
        .prompt([
            {
                type: 'input',
                message: 'Enter the department name:',
                name: 'name'
            },
            {
                type: 'list',
                message: 'Add Department?',
                choices: ['CONFIRM', 'RETURN TO MENU'],
                name: 'confirm'
            }
        ])
        .then(answers => {
            if (answers.confirm === `RETURN TO MENU`) {
                console.log(`----------------------------`)
                console.log(`RETURNING....`)
                console.log(`----------------------------`)
                setTimeout(() => {
                    connect.start();
                }, 1000);
            } else {
                connect.connection.query(
                    'INSERT INTO department SET ?',
                    {
                        name: answers.name,
                    },
                    (err) => {
                        if (err) throw err;
                        console.log(`----------------------------`)
                        console.log(`${answers.name} added!`);
                        console.log(`----------------------------`)
                        connect.start();
                    }
                );
            }
        })
        .catch(err => {
            if (err) throw err;
        })
};

const addRole = () => {
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
                {
                    type: 'list',
                    message: 'Add Role?',
                    choices: ['CONFIRM', 'RETURN TO MENU'],
                    name: 'confirm'
                }
            ])
            .then(answers => {
                if (answers.confirm === `RETURN TO MENU`) {
                    console.log(`----------------------------`)
                    console.log(`RETURNING....`)
                    console.log(`----------------------------`)
                    setTimeout(() => {
                        connect.start();
                    }, 1000);
                } else {
                    connect.connection.query(
                        `INSERT INTO role SET ?;`,
                        {
                            title: answers.name,
                            salary: answers.salary,
                            department_id: parseInt(answers.department)
                        },
                        (err) => {
                            if (err) throw err;
                            console.log(`----------------------------`)
                            console.log(`${answers.name} added!`);
                            console.log(`----------------------------`)
                            connect.start();
                        }
                    );
                }
            })
            .catch(err => {
                if (err) throw err;
            })
    })
};

const addEmployee = () => {
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
                    {
                        type: 'list',
                        message: 'Add this employee?',
                        choices: ['CONFIRM', 'RETURN TO MENU'],
                        name: 'confirm'
                    }
                ])
                .then(answers => {
                    if (answers.confirm === `RETURN TO MENU`) {
                        console.log(`----------------------------`)
                        console.log(`RETURNING....`)
                        console.log(`----------------------------`)
                        setTimeout(() => {
                            connect.start();
                        }, 1000);
                    } else {
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
                            (err) => {
                                if (err) throw err;
                                console.log(`----------------------------`)
                                console.log(`${answers.firstname} added!`);
                                console.log(`----------------------------`)
                                connect.start();
                            }
                        );
                    }
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
        empNames.push(`RETURN TO MENU`);
        inquirer
            .prompt(
                {
                    type: 'list',
                    message: 'Which employee are you updating?',
                    choices: empNames,
                    name: 'empchoice'
                })
            .then(answers => {
                if (answers.empchoice === `RETURN TO MENU`) {
                    console.log(`----------------------------`)
                    console.log(`RETURNING....`)
                    console.log(`----------------------------`)
                    setTimeout(() => {
                        connect.start();
                    }, 1000);
                } else {
                    updateRole(answers.empchoice, res)
                }
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
        roles.push(`RETURN TO MENU`);
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
                if (answer.role === `RETURN TO EMPLOYEE CHOICE`) {
                    empChoose();
                } else {
                    let chosenEmpID;
                    let chosenRoleID;
                    items.forEach(item => {
                        if (`${item.first_name} ${item.last_name}` === emp) {
                            chosenEmpID = item;
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
                                id: chosenEmpID.id,
                            },
                        ],
                        (err) => {
                            if (err) throw err;
                            console.log(`----------------------------`)
                            console.log(`${chosenEmpID.first_name} Updated!`);
                            console.log(`----------------------------`)
                            connect.start();
                        }
                    );
                }
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
        empNames.push(`RETURN TO MENU`);
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
                if (answers.empchoice === `RETURN TO MENU` || answers.manager === `RETURN TO MENU`) {
                    console.log(`----------------------------`)
                    console.log(`RETURNING....`)
                    console.log(`----------------------------`)
                    setTimeout(() => {
                        connect.start();
                    }, 1000);
                } else {
                    let empID;
                    let manID;
                    res.forEach(item => {
                        if (`${item.first_name} ${item.last_name}` === answers.empchoice) {
                            empID = item;
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
                                id: empID.id,
                            },
                        ],
                        (err) => {
                            if (err) throw err;
                            console.log(`----------------------------`)
                            console.log(`${empID.first_name} Updated!`);
                            console.log(`----------------------------`)
                            connect.start();
                        }
                    );
                }
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
        roleNames.push('RETURN TO MENU')
        inquirer
            .prompt(
                {
                    type: 'list',
                    message: 'Which department role are you updating?',
                    choices: roleNames,
                    name: 'rolechoice'
                })
            .then(answer => {
                if (answer.rolechoice === `RETURN TO MENU`) {
                    console.log(`----------------------------`)
                    console.log(`RETURNING....`)
                    console.log(`----------------------------`)
                    setTimeout(() => {
                        connect.start();
                    }, 1000);
                } else {
                    let roleID;
                    res.forEach(item => {
                        if (item.title === answer.rolechoice) {
                            roleID = item.id
                        }
                    })
                    updateDept(roleID)
                }
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
        depts.push('RETURN TO MENU')
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
                if (answer.dept === `RETURN TO MENU`) {
                    console.log(`----------------------------`)
                    console.log(`RETURNING....`)
                    console.log(`----------------------------`)
                    setTimeout(() => {
                        connect.start();
                    }, 1000);
                } else {
                    let chosenDept;
                    for (const item of res) {
                        if (item.name === answer.dept) {
                            chosenDept = item;
                        }
                    }
                    connect.connection.query(
                        'UPDATE role SET ? WHERE ?',
                        [
                            {
                                department_id: chosenDept.id,
                            },
                            {
                                id: ID,
                            },
                        ],
                        (err) => {
                            if (err) throw err;
                            console.log(`----------------------------`)
                            console.log(`Role Updated!`);
                            console.log(`----------------------------`)
                            connect.start();
                        }
                    );
                }
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
        empNames.push(`RETURN TO MENU`)
        inquirer
            .prompt(
                {
                    type: 'list',
                    message: 'Which employee are you removing?',
                    choices: empNames,
                    name: 'empchoice'
                },
            )
            .then(answer => {
                if (answer.empchoice === `RETURN TO MENU`) {
                    console.log(`----------------------------`)
                    console.log(`RETURNING....`)
                    console.log(`----------------------------`)
                    setTimeout(() => {
                        connect.start();
                    }, 1000);
                } else {
                    inquirer.prompt(
                        {
                            type: 'list',
                            message: 'Remove this employee?',
                            choices: ['CONFIRM', 'RETURN TO MENU'],
                            name: 'confirm'
                        }
                    )
                        .then(secanswer => {
                            if (secanswer.confirm === 'RETURN TO MENU') {
                                console.log(`----------------------------`)
                                console.log(`RETURNING....`)
                                console.log(`----------------------------`)
                                setTimeout(() => {
                                    connect.start();
                                }, 1000);
                            } else {
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
                                        console.log(`----------------------------`)
                                        console.log(`${chosenEmp.first_name} deleted!`);
                                        console.log(`----------------------------`)
                                        connect.start();
                                    }
                                );

                            }
                        })
                }
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
        roles.push(`RETURN TO MENU`)
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
                if (answer.role === `RETURN TO MENU`) {
                    console.log(`----------------------------`)
                    console.log(`RETURNING....`)
                    console.log(`----------------------------`)
                    setTimeout(() => {
                        connect.start();
                    }, 1000);
                } else {
                    let chosenRole;
                    for (const item of res) {
                        if (`${item.title}` === answer.role) {
                            chosenRole = item;
                        }
                    }
                    connect.connection.query('SELECT * FROM employee', (err, res) => {
                        if (err) throw err;
                        let roleTaken = false;
                        for (const item of res) {
                            if (item.role_id === chosenRole.id) {
                                roleTaken = true;
                            }
                        }
                        if (roleTaken) {
                            console.log(`----------------------------`)
                            console.log(`You can't remove a role that a current employee has!`);
                            console.log(`----------------------------`)
                            removeRole();
                        } else {
                            connect.connection.query(
                                'DELETE FROM role WHERE ?',
                                {
                                    id: chosenRole.id,
                                },
                                (err) => {
                                    if (err) throw err;
                                    console.log(`----------------------------`)
                                    console.log(`${chosenRole.title} deleted!`);
                                    console.log(`----------------------------`)
                                    connect.start();
                                }
                            )
                        }
                    })
                }
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
        depts.push(`RETURN TO MENU`)
        inquirer
            .prompt([
                {
                    type: 'list',
                    message: 'Which department would you like to remove?',
                    choices: depts,
                    name: 'dept'
                }
            ])
            .then(answer => {
                if (answer.dept === `RETURN TO MENU`) {
                    console.log(`----------------------------`)
                    console.log(`RETURNING....`)
                    console.log(`----------------------------`)
                    setTimeout(() => {
                        connect.start();
                    }, 1000);
                } else {
                    let chosenDept;
                    for (const item of res) {
                        if (item.name === answer.dept) {
                            chosenDept = item;
                        }
                    }
                    connect.connection.query('SELECT * FROM role', (err, response) => {
                        if (err) throw err;
                        let isUsed = false;
                        for (const item of response) {
                            if (item.department_id === chosenDept.id) {
                                isUsed = true;
                            }
                        }
                        if (!isUsed) {
                            connect.connection.query(
                                'DELETE FROM department WHERE ?',
                                [
                                    {
                                        id: chosenDept.id,
                                    },
                                ],
                                (err) => {
                                    if (err) throw err;
                                    console.log(`----------------------------`);
                                    console.log(`${chosenDept.name} removed!`);
                                    console.log(`----------------------------`);
                                    connect.start();
                                }
                            );
                        } else {
                            console.log(`----------------------------`);
                            console.log(`You must delete all roles in this department before removing!`);
                            console.log(`----------------------------`);
                            removeDept();
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
            managers.push(`RETURN TO MENU`)
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
                    if (answer.manager === `RETURN TO MENU`) {
                        console.log(`----------------------------`)
                        console.log(`RETURNING....`)
                        console.log(`----------------------------`)
                        setTimeout(() => {
                            connect.start();
                        }, 1000);
                    } else {
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
                                console.log(`----------------------------`)
                                connect.start();
                            }
                        )
                    }
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