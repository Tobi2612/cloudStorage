const path = require('path');
const fs = require('fs')
const ErrorResponse = require('../utils/errorResponse')
const asyncHandler = require('../middleware/async');
const AWS = require('aws-sdk');
const db = require("../config/db");

const s3 = new AWS.S3({
    accessKeyId: process.env.AWS_ACCESS,
    secretAccessKey: process.env.AWS_SECRET
});


//@desc     Upload file
//@route    POST /api/v1/file/upload
//@access   Private
exports.uploadFile = asyncHandler(async (req, res, next) => {
    if (!req.user) {
        return next(new ErrorResponse(`Unauthorised access to route`, 401))
    }



    if (!req.files) {
        return next(new ErrorResponse(`Please upload a file`, 400));
    }

    const file = req.files.file

    //check file size
    if (file.size > process.env.MAX_FILE_UPLOAD) {
        return next(new ErrorResponse(`Please upload an image less than ${process.env.MAX_FILE_UPLOAD}`, 400))
    }
    const naming = Date.now()
    //create custom filename
    file.name = `file_${naming}${path.parse(file.name).ext}`;

    file.mv(`${process.env.FILE_UPLOAD_PATH}/${file.name}`, async err => {
        if (err) {
            console.error(err);
            return next(new ErrorResponse('Problem with file upload', 500));
        }

        const params = {
            Bucket: process.env.AWS_BUCKET_NAME,
            Key: file.name,
            Body: file.data,
            ContentType: file.mimetype
        };

        // Uploading files to the bucket
        let s = await s3.upload(params, function (err, data) {
            if (err) {
                throw err;
            }

            console.log(`File uploaded successfully. ${data.Location}`);
        });
        const file_pathh = `https://s3.amazonaws.com/${process.env.AWS_BUCKET_NAME}/${file.name}`

        const { rows } = await db.query(
            "INSERT INTO files (file_name, file_path, created_by) VALUES ($1, $2, $3)",
            [file.name, file_pathh, req.user.id]
        );

        res.status(200).json({
            success: true,
            data: file.name
        });
    })
})



// @desc     Download file
// @route    GET / api / v1 / file / download
// @access   Private
exports.downloadFile = asyncHandler(async (req, res, next) => {
    const { file_name } = req.body

    const { rows } = await db.query('SELECT * FROM files WHERE file_name = $1', [file_name]);
    const files = rows[0]

    if (files.created_by != req.user.id || req.user.role != 'admin') {
        return next(new ErrorResponse(`Unauthorised download action`, 401))
    }
    const pathh = path.join(__dirname, '..', 'public', 'downloads', `${file_name}`)

    const params = {
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: `${file_name}`
    };

    s3.getObject(params, (err, data) => {
        if (err) console.error(err);

        // console.log(this.config.baseFolder + baseImage);
        fs.writeFileSync(pathh, data.Body);
        console.log("Image Downloaded.");

        res.download(pathh, function (err) {
            if (err) {
                // Handle error, but keep in mind the response may be partially-sent
                // so check res.headersSent
                console.log(res.headersSent)
            } else {
                // decrement a download credit, etc. // here remove temp file
                fs.unlink(pathh, function (err) {
                    if (err) {
                        console.error(err);
                    }
                    console.log('Temp File Delete');
                });
            }
        })

        console.log(`${pathh} has been created!`);
    });

});