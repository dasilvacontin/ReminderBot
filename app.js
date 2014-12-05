
var nodemailer = require('nodemailer');
var config = require('./config');
var fs = require('fs');

var db = JSON.parse(fs.readFileSync('db.json'));

var transporter = nodemailer.createTransport({
    service: config.service,
    auth: config.auth
});

var mailOptions = {
    from: config.from,
    to: config.to,
    bcc: config.bcc,
    subject: config.subject,
    html: 'Hi ' + config.target + ',<br><br>' + config.you + ' sends you the following reminder:<br>' + config.reminderBody + '<br><br>This reminder will be sent every hour until the task is marked as done by ' + config.you + '.<br><br>Regards,<br><br>- ReminderBot<br><br>Made using node.js by <a href="https://twitter.com/dasilvacontin">@dasilvacontin</a><br>',
    generateTextFromHTML: true
};

function saveDB () {
    console.log('Saving DB...');
    fs.writeFileSync('db.json', JSON.stringify(db));
    console.log('Saved!');
}

function sendReminder(n) {
    
    if (n === undefined)    n = 0;
    console.log('Sending email (try #' + n + ')');
    // Sets up email's subject with reminder #
    mailOptions.subject = config.subject + ' #' + db.reminderNumber;
    
    transporter.sendMail(mailOptions, function (error, info) {
        
        if (error) {
            console.log(error);
            sendReminder(n + 1);
            return;
        }
        
        console.log('   Message sent: ' + info.response);
        console.log('   with subject: ' + mailOptions.subject);
        console.log('   to ' + config.to);
        
        db.reminderNumber += 1;
        saveDB();
        
    });
    
}

function emailCheck() {

    if (db.lastEmail === undefined || (new Date() - db.lastEmail > config.msInterval)) {
        db.lastEmail = +new Date();
        sendReminder();
    }
    
}

setInterval(emailCheck, 1000);

console.log("\nWelcome to ReminderBot! :D\nCurrent target is: " + config.target + '\n');

