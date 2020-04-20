//Modules
const { app, BrowserWindow, ipcMain } = require('electron')
const clients = require('./modules/clients')
const notes = require('./modules/notes')
const therapists = require('./modules/therapists')
const uuid = require('uuid').v4
const path = require('path')
const appRoot = require('app-root-path')
const db = require('electron-db')

//db location
const location = path.join(appRoot.toString(), 'db')

//Initialize Windows
function createWindow() {
    let mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        frame: false,
        webPreferences: {
            nodeIntegration: true
        }
    })

    mainWindow.loadFile('./renderer/views/layout.html')
}

//When the app is initialized open the windows
app.whenReady().then(createWindow)

//Close the app when all windows are closed
app.on('window-all-closed', () => {
    //If not on Mac OS
    if (process.platform !== 'darwin') {
        app.quit()
    }
})

//Reopen the window using the dock on Mac OS
app.on('activate', () => {
    if (BrowserWindow.getAllWindows.length === 0) {
        createWindow()
    }
})

//---- data
//update

ipcMain.on('update-data', (e, updateData) => {
    //get where object
    let where = {
        id: updateData.itemId
    }

    //the table where the data is stored
    let tableName = updateData.tableName

    //the object which is updated
    let rowToUpdate

    //require the object to be updated
    db.getRows(tableName, location, where, (succ, data) => {
        if (succ) {
            rowToUpdate = data[0]
        }
    })

    //iterate through the keys of the object
    const updateKeys = (obj) => {
        Object.keys(obj).forEach(key => {

            //if the key is a value and matches the labelvalue update it, else iterate through the nested keys
            if (typeof obj[key] !== 'object') {
                if (key === updateData.valueLabel) {
                    obj[key] = updateData.value
                }
            }
            else if (typeof obj[key] === 'object') {
                updateKeys(obj[key])
            }
        })
    }

    //call to update object function
    updateKeys(rowToUpdate)

    //update the database with the new object
    db.updateRow(tableName, location, where, rowToUpdate, (succ, msg) => {
        // log message for debug purposes
        // console.log(succ)
        // console.log(msg)
    })
})

//---- clients
//get

ipcMain.on('clients-request', (e, where) => {
    clients.get(where, (clients) => {
        e.sender.send('clients-retrieve', clients)
    })
})

//detail
ipcMain.on('client-detail-request', (e, where) => {
    //client detail object
    let detail = {
        client: '',
        therapists: [],
        notes: ''
    }

    //request client detail
    clients.get(where, (client) => {
        detail.client = client[0]
    })

    //request related notes
    notesWhere = {
        AttachedTo: where.id
    }

    notes.get(notesWhere, (notes) => {
        detail.notes = notes
    })

    //request related therapist
    therpistIdList = detail.client.Therapy.Therapists

    therpistIdList.forEach(unknownTherapist => {
        where = {
            id: unknownTherapist.id
        }

        therapists.get(where, therapist => {
            therapist[0].Relation = unknownTherapist.relation

            detail.therapists.push(therapist[0])
        })
    })

    //return detail object
    e.sender.send('client-detail-retrieve', detail)
})

//data

ipcMain.on('client-data-request', (e, where) => {
    clients.get(where, (client) => {
        e.sender.send('client-data-retrieve', client[0])
    })
})

//---- therapists
//get

ipcMain.on('therapists-list-request', (e, where) => {
    therapists.get(where, (therapists) => {
        e.sender.send('therapits-list-retrieve', therapists)
    })
})

//detail

ipcMain.on('therapist-detail-request', (e, where) => {
    //therapist detail object
    let detail = {
        therapist: '',
        clients: [],
        activity: []
    }

    //request therapist detail
    therapists.get(where, (therapist) => {
        detail.therapist = therapist[0]
    })

    //request clients
    let clientsWhere = ''
    let potentialClients = ''

    clients.get(clientsWhere, (clients) => {
        potentialClients = clients
    })

    potentialClients.forEach(client => {
        var relatedClient = false

        client.Therapy.Therapists.forEach(therapist => {
            if (therapist.id === detail.therapist.id) {
                relatedClient = true
            }
        })

        if (relatedClient) {
            detail.clients.push(client)
        }
    })

    //return detail object
    e.sender.send('therapist-detail-retrieve', detail)
})

//data

ipcMain.on('therapist-data-request', (e, where) => {
    therapists.get(where, (therapist) => {
        e.sender.send('therapist-data-retrieve', therapist[0])
    })
}) 