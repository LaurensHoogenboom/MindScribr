//modules
const { ipcRenderer } = require('electron')
const appRoot = require('app-root-path')
const path = require('path')
const fs = require('fs')

//therapist utilities
module.exports = {
    //therapist list controller
    list: () => {
        let where = {}

        //require client list
        ipcRenderer.send('therapists-list-request', where)
    },

    //main client detail controller
    main: (uuid) => {
        let where = {
            id: uuid
        }

        //request therapist details
        ipcRenderer.send('therapist-detail-request', where)
    }
}

//retrieve client list
ipcRenderer.on('therapits-list-retrieve', (e, content) => {
    let therapistsTable = document.getElementById('therapists-list')

    //empty table
    $(therapistsTable).html('')

    content.forEach(therapist => {
        //determine therapist name
        let name

        if (therapist.Personal.NickName) {
            name = `${therapist.Personal.FirstName} "${therapist.Personal.NickName}" ${therapist.Personal.LastName}`
        } else {
            name = `${therapist.Personal.FirstName} ${therapist.Personal.LastName}`
        }

        //determine employment date
        const employmentDateJSON = new Date(therapist.Employment.DateOfEmployment)
        const employmentDay = employmentDateJSON.getDate() < 10 ? '0' + employmentDateJSON.getDate() : employmentDateJSON.getDate()
        const employmentMonth = (employmentDateJSON.getMonth() + 1) < 10 ? '0' + (employmentDateJSON.getMonth() + 1) : (employmentDateJSON.getMonth() + 1)
        const employmentYear = employmentDateJSON.getFullYear()
        const employmentDate = `${employmentDay}/${employmentMonth}/${employmentYear}`

        //build therapist table
        $(therapistsTable).append(
            $("<tr>").attr('data-id', therapist.id)
                .append(
                    $('<td>').text(name)
                )
                .append(
                    $('<td>').text(therapist.Employment.JobType ? therapist.Employment.JobType : "-")
                )
                .append(
                    $('<td>').text(therapist.Account.Type ? therapist.Account.Type : "-")
                )
                .append(
                    $('<td>').text(therapist.Personal.DateOfBirth ? therapist.Personal.DateOfBirth : "-")
                )
                .append(
                    $("<td>").text("-")
                )
                .append(
                    $('<td>').text(employmentDate)
                )
                .append(
                    $('<td>').text(therapist.Employment.WorkingDays ? therapist.Employment.WorkingDays : "-")
                )
        )
    })
})

//require client detail
ipcRenderer.on('therapist-detail-retrieve', (e, detail) => {
    // therapist info
    // determine name
    let name

    if (detail.therapist.Personal.NickName) {
        name = `${detail.therapist.Personal.FirstName} "${detail.therapist.Personal.NickName}" ${detail.therapist.Personal.LastName}`
    } else {
        name = `${detail.therapist.Personal.FirstName} ${detail.therapist.Personal.LastName}`
    }

    //personal
    $('#therapist-info-name').text(name)
    $('#therapist-info-function').text(detail.therapist.Employment.JobType)
    $('#therapist-info-birthday').text(detail.therapist.Personal.DateOfBirth)

    //contact and account
    $('#therapist-account-type').text(detail.therapist.Account.Type)
    $('#therapist-info-mail').attr('href', `mailto:${detail.therapist.Contact.Email}`)
    $('#therapist-info-phone').attr('href', `tel:${detail.therapist.Contact.Phone}`)

    //profilepicture
    //location
    const profilePictureLocation = path.join(appRoot.toString(), 'users', detail.therapist.Account.Username, 'profile.png')
    const relativeProfilePictureLocation = `../../users/${detail.therapist.Account.Username}/profile.png`
    const defaultPictureLocation = '../../users/profile.png'

    //check if profilepicture exists
    fs.access(profilePictureLocation, (error) => {
        if (error) {
            $('#therapist-profile-picture').css('background-image', `url('${defaultPictureLocation}')`);
        }
        else {
            $('#therapist-profile-picture').css('background-image', `url('${relativeProfilePictureLocation}')`);
        }
    })

    //clients
    let upcomingClientsCount = 0
    let currentClientsCount = 0
    let problemClientCount = 0
    let doneClientCount = 0

    detail.clients.forEach(client => {
        //count client type
        if (client.Therapy.Status === "Aankomend") {
            upcomingClientsCount++
        }
        if (client.Therapy.Status === "In behandeling") {
            currentClientsCount++
        }
        if (client.Therapy.Status === "Aandacht vereist") {
            problemClientCount++
        }
        if (client.Therapy.Status === "Uitbehandeld") {
            doneClientCount++
        }
 
        //search for clienttable
        let clientsTable = document.getElementById('clientsTable')

        //determine name
        let name;

        if (client.Personal.NickName) {
            name = `${client.Personal.FirstName} "${client.Personal.NickName}" ${client.Personal.LastName}`
        } else {
            name = `${client.Personal.FirstName} ${client.Personal.LastName}`
        }

        //add row to table
        $(clientsTable)
            .append(
                $("<tr>")
                    .append(
                        $("<td>").text(client.Therapy.FileId ? client.Therapy.FileId : "-")
                    )
                    .append(
                        $("<td>").text(`${client.Personal.FirstName.charAt(0).toUpperCase()}. ${client.Personal.LastName.charAt(0).toUpperCase()}.`)
                    )
                    .append(
                        $("<td>").text(name)
                    )
                    .append(
                        $("<td>").text(client.Personal.DateOfBirth ? client.Personal.DateOfBirth : "-")
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

    $('#upcoming-client-count').text(upcomingClientsCount)
    $('#current-client-count').text(currentClientsCount)
    $('#problem-client-count').text(problemClientCount)
    $('#done-client-count').text(doneClientCount)
})







