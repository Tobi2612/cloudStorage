const jwt = require('jsonwebtoken');
const asyncHandler = require('./async');
const ErrorResponse = require('../utils/errorResponse');
const db = require("../config/db");


//protect routes
exports.protect = asyncHandler(async (req, res, next) => {
    let token;

    //set token from bearer token in header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }

    //set token from cookie
    // else if (req.cookies.token) {
    //     token = req.cookies.token
    // }

    //check if token exist
    if (!token) {
        return next(new ErrorResponse('Unauthorized access to route', 401));
    }

    try {
        //verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const { rows } = await db.query('SELECT * FROM users WHERE id =$1', [decoded.id]);
        req.user = rows[0]

        next();

    } catch (err) {
        return next(new ErrorResponse('Unauthorized access to route', 401));
    }
});

//grant access to specific roles
exports.authorize = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return next(new ErrorResponse(`User role '${req.user.role}' is not authorized to access this route`, 403))
        }
        next();
    }
}