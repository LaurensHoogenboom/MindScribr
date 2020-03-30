//modules
const db = require('electron-db');
const path = require('path')
const { Therapist } = require('../db/models')
const appRoot = require('app-root-path')

//db location
const location = path.join(appRoot.toString(), 'db')

//initiate a new client database
exports.createDatabase = () => {
    db.createTable('therapists', location, (succ, msg) => {
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
    let therapist = new Therapist(
        'Alexa',
        'JohnSon',
        '',
        '22/05/2005',
        'Therapist',
        new Date(Date.now()).toJSON(),
        'active'
    )

    if (db.valid('therapists', location)) {
        db.insertTableContent('therapists', location, therapist, (succ, msg) => {
            console.log('Succes: ', + succ)
            console.log(msg)
        })
    }
}

//get all clients from the database
exports.get = (where, callback) => {
    //if there are any where conditions
    if (where) {
        db.getRows('therapists', location, where, (succ, data) => {
            if (succ) {
                callback(data)
            }
        })
    }
    //else select all clients
    else {
        db.getAll('therapists', location, (succ, data) => {
            if (succ) {
                callback(data)
            }
        })
    }
}


