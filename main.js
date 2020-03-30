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