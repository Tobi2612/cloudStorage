const ErrorResponse = require('../utils/errorResponse')
const asyncHandler = require('../middleware/async');
const AWS = require('aws-sdk');
const db = require("../config/db");

const s3 = new AWS.S3({
    accessKeyId: process.env.AWS_ACCESS,
    secretAccessKey: process.env.AWS_SECRET
});



//@desc     Flag File
//@route    PUT /api/v1/admin/flag
//@access   Private Admin
exports.flagFile = asyncHandler(async (req, res, next) => {

    const { file_name } = req.body

    const { rows } = await db.query('UPDATE files SET flagged = $1, flagged_by = $2 WHERE file_name = $3',
        [true, req.user.id, file_name]);
    const files = rows[0]

    //send response
    res.status(200).send({
        success: true,
        file_name,
        message: "File marked as unsafe"
    });

});

//@desc     Review Flagged FIle
//@route    POST /api/v1/admin/review
//@access   Private Admin
exports.reviewFile = asyncHandler(async (req, res, next) => {

    const { file_name, delete_file } = req.body

    const { rows } = await db.query('SELECT * FROM files WHERE file_name = $1', [file_name]);
    const files = rows[0]

    if (files.flagged) {
        if (files.flagged_by == req.user.id) {
            return next(new ErrorResponse(`You can't review a file you marked as unsafe`, 400))
        }
        if (delete_file) {
            const { rows } = await db.query('DELETE FROM files WHERE file_name = $1', [file_name]);
            const files = rows[0]

            const params = {
                Bucket: process.env.AWS_BUCKET_NAME,
                Key: `${file_name}`
            };

            s3.deleteObject(params, function (err, data) {
                if (err) console.log(err, err.stack);  // error
                else console.log();                 // deleted

            });
        }

        else {
            const { rows } = await db.query('UPDATE files SET flagged = $1, flagged_by = $2 WHERE file_name = $3',
                [false, null, file_name]);
            return res.status(200).send({
                success: true,
                file_name,
                message: "File has been marked as safe"
            });

        }




        //send response
        return res.status(200).send({
            success: true,
            file_name,
            message: "File reviewed and deleted successfully"
        });
    }

    else {
        return res.status(200).send({
            success: false,
            file_name,
            message: 'This File has not been marked as unsafe'
        })
    }
});

