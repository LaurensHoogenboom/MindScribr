//modules
const { ipcRenderer } = require('electron')

//request client list 
getClients = () => {
    ipcRenderer.send('clients-request', 'all')
}

//retrieve client list
ipcRenderer.on('clients-retrieve', (e, content) => {
    let clientsTable = $('#clients-table')

    content.forEach(client => {
        //build client table
        $(clientsTable).append(
            $("<tr>").attr('data-id', client.id)
                .append(
                    $("<td>").text(client.Therapy.FileId)
                )
                .append(
                    $("<td>").text(`${client.PersonalDetails.FirstName.charAt(0).toUpperCase()}. ${client.PersonalDetails.LastName.charAt(0).toUpperCase()}.`)
                )
                .append(
                    $("<td>").text(`${client.PersonalDetails.FirstName} "${client.PersonalDetails.NickName}" ${client.PersonalDetails.LastName}`)
                )
                .append(
                    $("<td>").text(`${client.PersonalDetails.DateOfBirth}`)
                )
                .append(
                    $("<td>").text(`${client.ContactInformation.Address.City}`)
                )
                .append(
                    $("<td>").text(`${client.ContactInformation.Email}`)
                )
                .append(
                    $("<td>").text(`${client.ContactInformation.Phone}`)
                )
                .append(
                    $("<td>").text(`${client.Therapy.Status}`)
                )
                .append(
                    $("<td>").text(`${client.Therapy.Status}`)
                )
        )
    })
})

getClientDetail = (id) => {
    console.log(id)
}
