//modules
const db = require('electron-db');
const { app, BrowserWindow } = require("electron");
const path = require('path')
const {Client} = require('../db/models')
const appRoot = require('app-root-path');

//db location
const location = path.join(appRoot.toString(), 'db')

//initiate a new client database
exports.createDatabase = () => {
    db.createTable('clients', location, (succ, msg) => {
        // succ - boolean, tells if the call is successful
        if (succ) {
            console.log(msg)
        } else {
            console.log('An error has occured. ' + msg)
        }
    })
}

//seed test data into the database
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

//get all clients from the database
exports.get = (callback) => {
    db.getAll('clients', location, (succ, data) => {
        if (succ) {
            callback(data)
        }
    })
}


