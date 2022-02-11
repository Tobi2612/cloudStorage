const ErrorResponse = require('../utils/errorResponse')
const asyncHandler = require('../middleware/async');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const db = require("../config/db");



//@desc     Register User
//@route    POST /api/v1/auth/register
//@access   Public
exports.register = asyncHandler(async (req, res, next) => {

    let { full_name, email, password, role } = req.body;

    if (!role) {
        role = 'user'
    }

    //encrypt password
    const salt = await bcrypt.genSalt(10);
    password = await bcrypt.hash(password, salt);

    // const created_at = +Date.now()
    // const created_at = Math.round(current_time.getTime() / 1000)
    //insert into db
    const { rows } = await db.query(
        "INSERT INTO users (full_name, email, password, role) VALUES ($1, $2, $3, $4)",
        [full_name, email, password, role]
    );

    //send response
    res.status(201).send({
        success: true,
        message: "User Created successfully!"
    });

});


//@desc     Login User
//@route    POST api/v1/auth/login
//@access   Public
exports.login = asyncHandler(async (req, res, next) => {
    const { email, password } = req.body;

    //validate email and password
    if (!email || !password) {
        return next(new ErrorResponse(`Please input email and password`, 400))
    }

    const { rows } = await db.query('SELECT * FROM users WHERE email = $1', [email]);
    const user = rows[0]

    if (!user) {
        return next(new ErrorResponse(`Invalid Credentials`, 401))
    }

    //check if password matches
    const isMatch = await matchPassword(email, password);

    if (!isMatch) {
        return next(new ErrorResponse(`Invalid Credentials`, 401))
    }

    const token = getSignedJwtToken(user.id)

    res.status(200).send({
        success: true,
        token,
    });

})


//sign jwt and return
const getSignedJwtToken = (user_id) => {
    return jwt.sign({ id: user_id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE
    })
}

//hash check password
const matchPassword = async (email, enteredPassword) => {
    const { rows } = await db.query('SELECT * FROM users WHERE email = $1', [email]);
    const user = rows[0]
    return await bcrypt.compare(enteredPassword, user.password);
}