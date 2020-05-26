//modules
const db = require('electron-db')
const { app, BrowserWindow } = require("electron")
const path = require('path')
const appRoot = require('app-root-path')
const { Status } = require('../db/models')

//db location
const location = path.join(appRoot.toString(), 'db')

//initiate a new client database
exports.createDatabase = () => {
    db.createTable('statuses', location, (succ, msg) => {
        // succ - boolean, tells if the call is successful
        if (succ) {
            console.log(msg)
        } else {
            console.log('An error has occured. ' + msg)
        }
    })
}

//seed test data into the database
exports.setDefault = () => {
    //client statuses
    let clientStatuses = [
        new Status(
            'Aankomend',
            'Client',
            'Normaal'
        ),
        new Status(
            'In behandeling',
            'Client',
            'Normaal'
        ),
        new Status(
            'Aandacht vereist',
            'Client',
            'Hoog'
        ),
        new Status(
            'Uitbehandeld',
            'Client',
            'Laag'
        )
    ]

    if (db.valid('statuses', location)) {
        clientStatuses.forEach((status) => {
            db.insertTableContent('statuses', location, status, (succ, msg) => {
                //console.log(status)
            })
        })
    }

    //therapist statuses
    let therapistStatuses = [
        new Status(
            'Aanwezig',
            'Therapist',
            'Normaal'
        ),
        new Status(
            'Afwezig',
            'Therapist',
            'Normaal'
        ),
    ]

    if (db.valid('statuses', location)) {
        therapistStatuses.forEach((status) => {
            db.insertTableContent('statuses', location, status, (succ, msg) => {
                //console.log(status)
            })
        })
    }
}

//get
exports.get = (where, callback) => {
    console.log(where)

    //if there are any where conditions
    if (where) {
        db.getRows('statuses', location, where, (succ, data) => {
            if (succ) {
                callback(data)
            }
        })
    }
    //else select all clients
    else {
        db.getAll('statuses', location, (succ, data) => {
            if (succ) {
                callback(data)
            }
        })
    }
}