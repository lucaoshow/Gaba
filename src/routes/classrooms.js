// Express
var express = require('express');
var router = express.Router();

// GET /classrooms
router.get('/', (req, res, next) => {
    res.render('classrooms', { title: 'Gaba' });
});

//getting data to build the page
router.get('/select', (req, res, next) => {

    const userId = parseInt(req.query.userId);

    const sql = `SELECT class.id AS class_id, class.name AS class_name, reg.student_id AS std_id, std.name AS std_name FROM classrooms AS class LEFT OUTER JOIN registrations AS reg ON reg.classroom_id = class.id  LEFT OUTER JOIN students AS std ON std.id = reg.student_id WHERE class.user_id = ${userId} ORDER BY class.id;`

    req.db.all(sql, [], (err, rows) => {
        if (err) {
            return res.status(400).json({error: err.message});
        }
        res.status(200).json(rows);
    });
});

//adding students
router.post('/addStudent', (req, res, next) => {
    const sql = `INSERT INTO students(name) VALUES ("${req.query.stdName}");`
    const class_id = req.query.classId;

    let std_id = '';
    req.db.run(sql, [], function (err) {
        if (err) {
            return res.status(400).json({error: err.message});
        }
        std_id = this.lastID;
        secondPost(req, res, class_id, std_id);
        res.status(201).json();
    });
});

//putting students in specified classrooms
function secondPost(req, res, class_id, std_id){
    const sql = `INSERT INTO registrations(classroom_id, student_id) VALUES (${parseInt(class_id)}, ${std_id});`

    req.db.run(sql, [], function (err) {
        if (err) {
            return res.status(400).json({error: err.message});
        }
        res.status(201).json();
    });

};

//creating classrooms
router.post('/addClass', (req, res, next) => {
    const sql = `INSERT INTO classrooms(name, user_id, subject, year) VALUES ("${req.query.className}", 1, "${req.query.subject}", ${req.query.year});`

    req.db.run(sql, [], function (err) {
        if (err) {
            console.log(err)
            return res.status(400).json({error: err.message});
        }
        res.status(201).json();
    });
});

// PUT /classrooms/:id
router.put('/:id', (req, res, next) => {
    const {name, user_id, subject} = req.body;
    const sql = "UPDATE classrooms SET name = ?, user_id = ?, subject = ? WHERE id = ?";

    req.db.run(sql, [name, user_id, subject, req.params.id], function (err) {
        if (err) {
            return res.status(400).json({error: err.message});
        }
        res.status(200).json({changes: this.changes});
    });
});

//removing students from classrooms
router.delete('/delete', (req, res, next) => {
    const std_id = req.query.stdId;
    const sql = `DELETE FROM registrations WHERE student_id = ${std_id}`;

    req.db.run(sql, req.params.id, function (err) {
        if (err) {
            return res.status(400).json({error: err.message});
        }
        res.status(200).json();
    });

    const sql2 = `DELETE FROM students WHERE id = ${std_id}`;

    req.db.run(sql2, req.params.id, function (err) {
        if (err) {
            return res.status(400).json({error: err.message});
        }
        res.status(200).json();
    });
});

module.exports = router;
