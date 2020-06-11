//modules
const db = require('electron-db')
const { app, BrowserWindow } = require("electron")
const path = require('path')
const appRoot = require('app-root-path')
const { AccountType } = require('../db/models')

//db location
const location = path.join(appRoot.toString(), 'db')

//initiate a new accounttype database
exports.createDatabase = () => {
    db.createTable('accountTypes', location, (succ, msg) => {
        // succ - boolean, tells if the call is successful
        if (succ) {
            console.log(msg)
        } else {
            console.log('An error has occured. ' + msg)
        }
    })
}

//seed default accounttypes into the database
exports.setDefault = () => {
    //therapist accounttypes
    let therapistAccountTypes = [
        new AccountType(
            'Administrator',
            'Therapist'
        ),
        new AccountType(
            'Supervisor',
            'Therapist'
        ),
        new AccountType(
            'Standaard',
            'Therapist'
        )
    ]

    if (db.valid('accountTypes', location)) {
        therapistAccountTypes.forEach((status) => {
            db.insertTableContent('accountTypes', location, status, (succ, msg) => {
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
        db.getRows('accountTypes', location, where, (succ, data) => {
            if (succ) {
                callback(data)
            }
        })
    }
    //else select all clients
    else {
        db.getAll('accountTypes', location, (succ, data) => {
            if (succ) {
                callback(data)
            }
        })
    }
}