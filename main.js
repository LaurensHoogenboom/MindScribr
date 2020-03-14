//Modules
const {app, BrowserWindow, ipcMain} = require('electron')

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

//Reopen the window using the doc on Mac OS
app.on('activate', ()=> {
    if (BrowserWindow.getAllWindows.length === 0) {
        createWindow()
    }
})