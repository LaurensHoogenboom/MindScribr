//Modules
const {app, BrowserWindow, ipcMain} = require('electron')
const clients = require('./modules/clients')
const notes = require('./modules/notes')
const therapists = require('./modules/therapists')
const uuid = require('uuid').v4
const path = require('path');

//Initialize Windows
function createWindow() {
    let mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            nodeIntegration: true
        }
    })

    mainWindow.loadFile('./renderer/views/layout.html')
}

//When the app is initialized open the windows
app.whenReady().then(createWindow)

//Close the app when all windows are closed
app.on('window-all-closed', ()=> {
    //If not on Mac OS
    if (process.platform !== 'darwin') {
        app.quit()
    }
})

//Reopen the window using the dock on Mac OS
app.on('activate', ()=> {
    if (BrowserWindow.getAllWindows.length === 0) {
        createWindow()
    }
})

//---- clients
//get

ipcMain.on('clients-request', (e, where) => {
    clients.get(where, (clients) => {
        e.sender.send('clients-retrieve', clients)
    })
})

//get detail
ipcMain.on('client-detail-request', (e, where) => {
    //client detail object
    let details = {
        client: '',
        therapists: [],
        notes: ''
    }

    //request client details
    clients.get(where, (client) => {
        details.client = client
    })

    //request related notes
    notesWhere = {
        AttachedTo: where.id
    }

    notes.get(notesWhere, (notes) => {
        details.notes = notes
    })

    //request related therapist
    therpistIdList = details.client[0].Therapy.Therapists

    therpistIdList.forEach(unknownTherapist => {
        where = {
            id: unknownTherapist.id
        }

        therapists.get(where, therapist => {
            therapist[0].Relation = unknownTherapist.relation

            details.therapists.push(therapist[0])
        })
    })

    //return detail object
    e.sender.send('client-detail-retrieve', details)
})