//modules
const db = require('electron-db')
const { app, BrowserWindow } = require("electron")
const path = require('path')
const appRoot = require('app-root-path')
const { CarePlan } = require('../db/models')

//db location
const location = path.join(appRoot.toString(), 'db')

//initiate a new careplan database
exports.createDatabase = () => {
    db.createTable('careplans', location, (succ, msg) => {
        // succ - boolean, tells if the call is successful
        if (succ) {
            console.log(msg)
        } else {
            console.log('An error has occured. ' + msg)
        }
    })
}

//set default careplans
exports.setDefault = () => {
    //careplans
    let trajects = [
        new CarePlan(
            'Basis',
            'Kort',
            '108.300',
            '30'
        ),
        new CarePlan(
            'Basis',
            'Middel',
            '108.301',
            '35'
        ),
        new CarePlan(
            'Basis',
            'Intensief',
            '108.302',
            '40'
        ),
        new CarePlan(
            'Basis',
            'Chronisch',
            '108.303',
            '45'
        )
    ]

    if (db.valid('careplans', location)) {
        trajects.forEach((traject) => {
            db.insertTableContent('careplans', location, traject, (succ, msg) => {
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
        db.getRows('careplans', location, where, (succ, data) => {
            if (succ) {
                callback(data)
            }
        })
    }
    //else select all clients
    else {
        db.getAll('careplans', location, (succ, data) => {
            if (succ) {
                callback(data)
            }
        })
    }
}