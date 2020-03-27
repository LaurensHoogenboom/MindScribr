//modules
const { ipcRenderer } = require('electron')

//client utilities
module.exports = {
    //client list controller
    list: () => {
        let where = {}

        //require client list
        ipcRenderer.send('clients-request', where)
    },

    //main client detail controller
    main: (uuid) => {
        let where = {
            id: uuid
        }

        //request client details
        ipcRenderer.send('client-detail-request', where)
    }
}

//retrieve client list
ipcRenderer.on('clients-retrieve', (e, content) => {
    let clientsTable = document.getElementById('clients-table')

    content.forEach(client => {
        let name;

        if (client.PersonalDetails.NickName) {
            name = `${client.PersonalDetails.FirstName} "${client.PersonalDetails.NickName}" ${client.PersonalDetails.LastName}`
        } else {
            name = `${client.PersonalDetails.FirstName} ${client.PersonalDetails.LastName}`
        }

        //build client table
        $(clientsTable).append(
            $("<tr>").attr('data-id', client.id)
                .append(
                    $("<td>").text(client.Therapy.FileId ? client.Therapy.FileId : "-")
                )
                .append(
                    $("<td>").text(`${client.PersonalDetails.FirstName.charAt(0).toUpperCase()}. ${client.PersonalDetails.LastName.charAt(0).toUpperCase()}.`)
                )
                .append(
                    $("<td>").text(name)
                )
                .append(
                    $("<td>").text(client.PersonalDetails.DateOfBirth ? client.PersonalDetails.DateOfBirth : "-")
                )
                .append(
                    $("<td>").text(client.ContactInformation.Address.City ? client.ContactInformation.Address.City : "-")
                )
                .append(
                    $("<td>").text(client.ContactInformation.Email ? client.ContactInformation.Email : "-")
                )
                .append(
                    $("<td>").text(client.ContactInformation.Phone ? client.ContactInformation.Phone : "-")
                )
                .append(
                    $("<td>").text(client.Therapy.Status ? client.Therapy.Status : "-")
                )
                .append(
                    $("<td>").text(client.Therapy.Notes ? client.Therapy.Notes : "-")
                )
        )
    })
})

//require client detail
ipcRenderer.on('client-detail-retrieve', (e, detail) => {
    let sectionBackLabel = $('#clientDetailBack label')

    //client info
    //info
    let name;

    if (detail.client[0].PersonalDetails.NickName) {
        name = `${detail.client[0].PersonalDetails.FirstName} "${detail.client[0].PersonalDetails.NickName}" ${detail.client[0].PersonalDetails.LastName}`
    } else {
        name = `${detail.client[0].PersonalDetails.FirstName} ${detail.client[0].PersonalDetails.LastName}`
    }

    //name
    $('.mainInfoBlocks #client-info-name').text(name)

    //therapy
    $('.mainInfoBlocks #client-info-sessions').text(`${detail.client[0].Therapy.UsedSessions} / ${detail.client[0].Therapy.TotalSessions}`)
    $('.mainInfoBlocks #therapy-info-code').text(`${detail.client[0].Therapy.TrajectType.Code}`)
    $('.mainInfoBlocks #therapy-info-title').text(`${detail.client[0].Therapy.TrajectType.Title}`)
    $('.mainInfoBlocks #therapy-info-status').text(`${detail.client[0].Therapy.Status}`)
    $('.mainInfoBlocks #therapy-info-diagnosis').text(`${detail.client[0].Therapy.MainDiagnosis}`)

    //contact info
    $('.mainInfoBlocks #contact-info-mail').attr('href', `mailto:${detail.client[0].ContactInformation.Email}`)
    $('.mainInfoBlocks #contact-info-phone').attr('href', `tel:${detail.client[0].ContactInformation.Phone}`)

    console.log('2')
})






