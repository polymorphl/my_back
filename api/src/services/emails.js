const mjml2html = require('mjml');

const path = require('path');
const fs = require('fs');
const nodemailer = require('nodemailer');
// const smtpTransport = require('nodemailer-smtp-transport');
const pug = require('pug');

const env = process.env.NODE_ENV || 'development';
const FROM = 'contact@thelastfrontiergame.com';

/*
** Define the transporter
 */
let transporter = null;

if (env != 'production') {
  let opt =  {
    host: process.env.MAIL_HOST,
    port: process.env.MAIL_PORT,
    auth: {
      user: process.env.MAIL_AUTH_USER,
      pass: process.env.MAIL_AUTH_PASS
    }
  };
 transporter = nodemailer.createTransport("SMTP", opt);
} else {
  // TODO: create a transporter for producton usage
  transporter = 'InvalidNow+TODO';
}

/*
 ** Compile template
 */

function managePugTpl(tpl, data) {
  var tpl_file = path.join(__dirname, 'emails', 'tpl', (tpl + '.pug'));

  var file = fs.readFileSync(tpl_file, 'utf8');
  var fnTpl = pug.compile(file, { filename: tpl });
  return fnTpl(data);
};

function manageMjmlTpl(html) {
  return mjml2html(html);
}

/*
 ** Method - Send Email
 */
var sendEmail = function (from, to, subject, tpl, data) {

  // Add subject as data
  data.subject = subject;

  // Compile all data together
  let html = manageMjmlTpl(managePugTpl(tpl, data)).html;

  let opt = {
    from: from ? from.trim() : FROM,
    to: to,
    subject: subject,
    html: html
  };

  return new Promise(function(resolve, reject) {
    transporter.sendMail(opt, function (err, info) {
      resolve({err: err, data: info});
    });
  });
}

module.exports = {
  sendEmail: sendEmail
}
