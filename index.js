
const express = require('express'),
app = express(),
passport = require('passport'),
port = process.env.PORT || 80,
cors = require('cors')

const bcrypt = require('bcrypt')

const db = require('./database.js')
let users = db.users

require('./passport.js')

const router = require('express').Router(),
jwt = require('jsonwebtoken')


app.use(cors({ origin: 'http://localhost:3000' }))

app.use('/api', router)
router.use(express.json())
router.use(express.urlencoded({ extended: false }))

router.post('/login', (req, res, next) => {
passport.authenticate('local', { session: false }, (err, user, info) => {
    console.log('Login: ', req.body, user, err, info)
    if (err) return next(err)
    if (user) {

        if (req.body.remember == true) {        //
            time_exp = "7d";                    //
        }
        else time_exp = "1d";
        const token = jwt.sign(user, db.SECRET, {
            expiresIn: time_exp,
        });

        var decoded = jwt.decode(token);    //เพิ่ม
        //let time = "" + new Date(decoded.exp * 1000);

        let time = new Date(decoded.exp * 1000);
        //let str = time.substring(0, 10);

        console.log(new Date(decoded.exp * 1000));
        return res.json({ user, token, time })     //

    } else
        return res.status(422).json(info)
})(req, res, next)
})

/* GET user profile. */
router.get('/profile',
passport.authenticate('jwt', { session: false }),
(req, res, next) => {
    res.send(req.user)
});

router.post('/register',
async (req, res) => {
    try {
        const SALT_ROUND = 10
        const { username, email } = req.body
        if (db.checkExistingUser(username) !== db.NOT_FOUND)
            return res.json({ status: "Duplicated user" })

        let id = (users.users.length) ? users.users[users.users.length - 1].id + 1 : 1
        const password = await bcrypt.hash(req.body.password, SALT_ROUND)
        users.users.push({ id, username, password, email })
        res.json({ message: "Register success" })
    } catch {
        res.json({ message: "Cannot register" })
    }
})


router.get('/', (req, res, next) => {
res.send('Respond without authentication');
});

// Error Handler
app.use((err, req, res, next) => {
let statusCode = err.status || 500
res.status(statusCode);
res.json({
    error: {
        status: statusCode,
        message: err.message,
    }
});
});

// Start Server
app.listen(port, () => console.log(`Server is running on port ${port}`))

