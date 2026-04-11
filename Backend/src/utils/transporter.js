const nodemailer = require("nodemailer")

const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    auth: {
        user: "tanujarora1515@gmail.com",
        pass: "eyhz vifh ahep tdzw",
    },
    secure: true
});

module.exports = transporter;