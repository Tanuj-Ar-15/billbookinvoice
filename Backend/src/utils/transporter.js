const nodemailer = require("nodemailer")

const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
        user: "tanujarora1515@gmail.com",
        pass: "eyhz vifh ahep tdzw",
    },
    logger: true,
    debug: true
});

module.exports = transporter;