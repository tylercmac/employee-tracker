USE employees_db;

INSERT INTO department (name ) VALUES ('Marketing');

INSERT INTO role (title, salary, department_id) VALUES ('The BossMan', 120000, 1), ('Marketing Lead', 100000, 1), ('CTO', 80000, 1), ('Data Analyst', 70000, 1), ('Sales Member', 75000, 1), ('Graphic Design', 50000, 1), ('Intern', 20000, 1);

INSERT INTO employee (first_name, last_name, role_id) VALUES ('Ty', 'McFarland', 1);
INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES ('Gandalf', 'The Grey', 2, 1), ('Sarumon', 'The White', 3, 1), ('Grima', 'Wormtongue', 4, 3), ('Frodo', 'Baggins', 5, 1), ('Samwise', 'Gamgee', 5, 1), ('Merry', 'Branduybuck', 5, 1), ('Pippin', 'Took', 5, 1), ('Gollum', 'AKA Smeagol', 6, 1);