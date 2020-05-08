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

    //get value label tree
    let valueLabelTree = updateData.valueLabel.split('.')

    const setNestedKey = (obj, path, value) => {
        if (path.length === 1) {
            obj[path] = value
            return
        }
        return setNestedKey(obj[path[0]], path.slice(1), value)
    }

    setNestedKey(rowToUpdate, valueLabelTree, updateData.value)

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

    if (therpistIdList) {
        therpistIdList.forEach(unknownTherapist => {
            where = {
                id: unknownTherapist.id
            }
    
            therapists.get(where, therapist => {
                therapist[0].Relation = unknownTherapist.relation
    
                detail.therapists.push(therapist[0])
            })
        })
    }

    //return detail object
    e.sender.send('client-detail-retrieve', detail)
})

//data

ipcMain.on('client-data-request', (e, where) => {
    clients.get(where, (client) => {
        e.sender.send('client-data-retrieve', client[0])
    })
})

//crud
//add
ipcMain.on('client-add-request', (e, values) => {
    clients.add(values.firstName, values.lastName, values.nickName, values.bsnNumber, values.mainOccupation, values.mainPractioner,
        values.dateOfBirth, values.email, values.phone, values.street, values.postalcode, values.city, values.totalSessions, values.usedSessions,
        values.therapists, values.therapyStatus, values.mainDiagnosis, values.insurer, values.policyNumber, values.usoviNumber, values.invoiceType,
        values.fileId, values.notes, values.trajectTitle, values.trajectCode, (succ) => {
            e.sender.send('client-add-response', succ)
        })
})

//delete
ipcMain.on('client-delete-request', (e, list) => {
    console.log(list)

    list.forEach(function(id) {
        where = {
            id: id
        }

        clients.delete(where, (succ) => {
            e.sender.send('clients-delete-response', succ)
        })
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
        if (client.Therapy.Therapists) {
            console.log(client.Therapy.Therapists)

            var relatedClient = false

            client.Therapy.Therapists.forEach(therapist => {
                if (therapist.id === detail.therapist.id) {
                    relatedClient = true
                }
            })
    
            if (relatedClient) {
                detail.clients.push(client)
            }
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