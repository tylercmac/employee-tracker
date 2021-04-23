USE employees_db;

-- SELECT first_name, last_name, title, d.name AS department, salary 
-- FROM employee e
-- JOIN role r
-- ON e.role_id = r.id
-- LEFT JOIN department d
-- ON r.department_id = d.id;

SELECT e.first_name, e.last_name, CONCAT(m.first_name, " ", m.last_name) AS MANAGER
FROM employee e
LEFT JOIN employee m ON m.id = e.manager_id;

