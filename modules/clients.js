const db = require('electron-db');
const { app, BrowserWindow } = require("electron");
const path = require('path')
const {Client} = require('../db/models')

const location = path.join(__dirname, 'db')

exports.createDatabase = () => {
    // This will save the database in the same directory as the application.

    db.createTable('clients', location, (succ, msg) => {
        // succ - boolean, tells if the call is successful
        if (succ) {
            console.log(msg)
        } else {
            console.log('An error has occured. ' + msg)
        }
    })
}

exports.seedPreviewData = () => {
    let newClient = new Client (
        'John',
        'Doe',
        'Mad',
        '123.456.789',
        'Woodcarver',
        'J. Smith'
    )

    if (db.valid('clients', location)) {
        db.insertTableContent('clients', location, newClient, (succ, msg) => {
            console.log('Succes: ', + succ)
            console.log(msg)
        })
    }
}



