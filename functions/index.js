const functions = require('firebase-functions');
const admin = require('firebase-admin');
const express = require('express');
const engines = require('consolidate');

admin.initializeApp(functions.config().firebase);

const app = express();
app.engine('hbs', engines.handlebars);
app.set('views', './views');
app.set('view engine', 'hbs');

// Exports APIs / Views
exports.app = functions.https.onRequest(app);


// Select Data from Database
function getMessage() {
    const ref = admin.database().ref('messages');
    return ref.once('value').then(snap => snap.val());
}

// Views
app.get('/getMessagePage', (request, response) => {
    getMessage().then(snap => {
        response.render('getMessagePage', { snap });
    });
});


// Http + Response
app.get('/helloFirebase', (request, response) => {

    // Grab the 'text' parameter
    const data = request.query.text;

    response.status(201).send("<h3>Hello from Firebase!</h3>" + data);
});


// APIs
// Http + Response from Database
app.get('/getMessage', (request, response) => {
    admin.database().ref('messages').on('value', function (snapshot) {
        console.log(snapshot.val());
        response.send(JSON.stringify(snapshot.val()));
    });
});


// Http + Parameter add data to Database + Response data from Database
app.post('/addMessage', (request, response) => {
    // Take the text parameter passed to this HTTP endpoint and insert it into the
    // Realtime Database under the path /messages/:pushId/original

    // Grab the 'text' parameter
    // POST params Body Content-Type: application/x-www-form-urlencoded
    const data = request.body.text;

    // Push the new message into the Realtime Database using the Firebase Admin SDK.
    admin.database().ref('messages').push({ 'message': data }).then(snapshot => {

        response.send("Hello addMessage!<br>" + data + "<br>");
    }).catch(err => {
        response.send(`Hello addMessage!<br></h3>${err}</h3>`);
    });
});
