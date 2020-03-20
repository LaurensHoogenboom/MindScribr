//Modules
const {app, BrowserWindow, ipcMain} = require('electron')
const clients = require('./modules/clients')
const uuid = require('uuid').v4

//---- clients
//get

ipcMain.on('clients-get', (e, count, page) => {
    clients.get(count, page, clients => {
        e.sender.send('clients-retrieve', clients)
    })
})

//listen for new item
ipcMain.on('new-item', (e, itemUrl) => {
    //get new item and send back to renderer
  
    readItem(itemUrl, item => {
      e.sender.send('new-item-success', item)
    });
  })


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

    // mainWindow.webContents.on('did-finish-load', () => {
    //     clients.seedPreviewData();
    // })
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

//Reopen the window using the doc on Mac OS
app.on('activate', ()=> {
    if (BrowserWindow.getAllWindows.length === 0) {
        createWindow()
    }
})