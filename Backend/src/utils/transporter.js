const nodemailer = require("nodemailer")

const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",        
      port:  465,                      
      auth: {
        user: "tanujarora1515@gmail.com",     
        pass: "anbsxvrnxoqvujaz",     
      },
      logger: true,
      debug: true
    });

    module.exports = transporter;