//modules
const db = require('electron-db');
const path = require('path')
const {Note} = require('../db/models')
const appRoot = require('app-root-path')

//db location
const location = path.join(appRoot.toString(), 'db')

//initiate a new client database
exports.createDatabase = () => {
    db.createTable('notes', location, (succ, msg) => {
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
    let noteDate = new Date(Date.now()).toJSON()

    let note = new Note (
        noteDate,
        '',
        'notification',
        1584639131903,
        '',
        'Afspraak geanuleerd',
        'De afspraak van 05/04/2020'
    )

    if (db.valid('notes', location)) {
        db.insertTableContent('notes', location, note, (succ, msg) => {
            console.log('Succes: ', + succ)
            console.log(msg)
        })
    }
}

//get all clients from the database
exports.get = (where, callback) => {

    console.log(where)

    //if there are any where conditions
    if (where) {
        db.getRows('notes', location, where, (succ, data) => {
            if (succ) {
                callback(data)
            }
        })
    }
    //else select all clients
    else {
        db.getAll('notes', location, (succ, data) => {
            if (succ) {
                callback(data)
            }
        })
    }
}


