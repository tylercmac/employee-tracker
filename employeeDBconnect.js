const mysql = require('mysql');
const inquirer = require('inquirer');

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
        .prompt( {
            type: 'list',
            message: 'EMPLOYEE MANAGER',
            choices: ['View All Employees'],
            name: 'choices'
        })
        .then(answers => {
            switch(answers.choices) {
                case 'View All Employees':
                    viewEmployees();
                    break;
                // case 'By song':
                //     songSearch();
                //     break;
                // case 'By year range':
                //     rangeSearch();
                //     break;
                // case 'Artists who appear multiple times':
                //     artistMult();
                //     break;
                // case 'Artist with top album and top in same year':
                //     artistAlbum();
                //     break;
                default:
                    console.log('Thanks for using our app!');
                    connection.end();
            }
        })
}