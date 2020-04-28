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

        //request client detail
        ipcRenderer.send('client-detail-request', where)
    },

    //client data controller
    data: (uuid) => {
        let where = {
            id: uuid
        }

        //request client data
        ipcRenderer.send("client-data-request", where)
    }
}

const setBackButton = (title) => {
    document.addEventListener('toolbar-loaded', function () {
        $('#clientBackButton label').text(title)
    })
}

//retrieve client list
ipcRenderer.on('clients-retrieve', (e, content) => {
    let clientsTable = document.getElementById('clients-table')

    $(clientsTable).html('');

    content.forEach(client => {
        //determine name
        let name = getName.full(client.Personal);

        //determine dateOfBirth
        let dateOfBirth = getDate.dmy(client.Personal.DateOfBirth)

        //build client table
        $(clientsTable).append(
            $("<tr>").attr('data-value', client.id).attr('data-label', 'client')
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
                    $("<td>").text(dateOfBirth)
                )
                .append(
                    $("<td>").text(client.Contact.Address.City ? client.Contact.Address.City : "-")
                )
                .append(
                    $("<td>").text(client.Contact.Email ? client.Contact.Email : "-")
                )
                .append(
                    $("<td>").text(client.Contact.Phone ? client.Contact.Phone : "-")
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
    //client info
    //info

    //determine and set name
    let name = getName.full(detail.client.Personal)
    $('.mainInfoBlocks #client-info-name').text(name)

    $('.mainInfoBlocks #client-info-sessions').text(`${detail.client.Therapy.UsedSessions ? detail.client.Therapy.UsedSessions : '-'} / ${detail.client.Therapy.TotalSessions ? detail.client.Therapy.TotalSessions : '-'}`)
    $('.mainInfoBlocks #therapy-info-code').text(`${detail.client.Therapy.TrajectType.Code ? detail.client.Therapy.TrajectType.Code : '-'}`)
    $('.mainInfoBlocks #therapy-info-title').text(`${detail.client.Therapy.TrajectType.Title ? detail.client.Therapy.TrajectType.Title : 'Bandelingscode'}`)
    $('.mainInfoBlocks #therapy-info-status').text(`${detail.client.Therapy.Status}`)
    $('.mainInfoBlocks #therapy-info-diagnosis').text(`${detail.client.Therapy.MainDiagnosis ? detail.client.Therapy.MainDiagnosis : '-'}`)

    //contact info
    $('.mainInfoBlocks #contact-info-mail').attr('href', `mailto:${detail.client.Contact.Email}`)
    $('.mainInfoBlocks #contact-info-phone').attr('href', `tel:${detail.client.Contact.Phone}`)

    let taskCount = 0
    let noticationCount = 0
    let highPriorityTask = false
    let highPriorityNotification = false

    //notes
    detail.notes.forEach(note => {
        //determine date
        let noteDate = getDate.dmy(note.DateTime)

        //apend to todolist if task
        if (note.Type === 'task') {
            taskCount++

            if (note.Priority === 'high' && note.Status === 'todo') {
                highPriorityTask = true
            }

            $('#task-list')
                .append(
                    $('<tr>')
                        .append(
                            $('<td>').text(noteDate).addClass('maxContent')
                        )
                        .append(
                            $('<td>').text(note.Title)
                        )
                        .append(
                            $('<td>').addClass('maxContent')
                                .append(
                                    $('<label>').addClass('cross')
                                        .append(
                                            $('<span>')
                                        )
                                        .append(
                                            $('<span>')
                                        )
                                )
                        )
                )
        }

        //append to notification if notification
        if (note.Type === 'notification') {
            noticationCount++

            if (note.Priority === 'high' && note.Status === 'present') {
                highPriorityNotification = true
            }

            $('#notification-list')
                .append(
                    $('<tr>')
                        .append(
                            $('<td>').text(noteDate).addClass('maxContent')
                        )
                        .append(
                            $('<td>').text(note.Title)
                        )
                        .append(
                            $('<td>').addClass('maxContent')
                                .append(
                                    $('<label>').addClass('cross')
                                        .append(
                                            $('<span>')
                                        )
                                        .append(
                                            $('<span>')
                                        )
                                )
                        )
                )
        }
    })

    if (noticationCount > 0) {
        $('#notification-list-title').text(`Meldingen: (${noticationCount})`)
    }

    if (taskCount > 0) {
        $('#task-list-title').text(`Taken: (${taskCount})`)
    }

    if (highPriorityNotification) {
        $('#notification-list-wrapper').addClass('orange')
    }

    if (highPriorityTask) {
        $('#task-list-wrapper').addClass('orange')
    }

    //therapists
    let therapistCount = 0

    if (detail.therapists) {
        detail.therapists.forEach(therapist => {
            therapistCount++
    
            $('#therapist-list')
                .append(
                    $('<tr>')
                        .append(
                            $('<td>').text(`${therapist.Personal.FirstName} ${therapist.Personal.LastName}`).addClass('maxContent')
                        )
                        .append(
                            $('<td>').text(therapist.Relation)
                        )
                        .append(
                            $('<td>').addClass('maxContent')
                                .append(
                                    $('<label>').addClass('cross')
                                        .append(
                                            $('<span>')
                                        )
                                        .append(
                                            $('<span>')
                                        )
                                )
                        )
                )
        })
    }

    $('#therapist-list-title').text(`Toegewezen aan (${therapistCount})`)

    //backbutton
    setBackButton(name)
})


//retrieve client data
ipcRenderer.on('client-data-retrieve', (e, client) => {
    //get client full name
    let name = getName.full(client.Personal)

    //get client birthday dmy
    let birthday = getDate.dmy(client.Personal.DateOfBirth)

    //get client address
    let address = getAddress.full(client.Contact.Address)

    //tablelist
    let personalTable = document.getElementById("client-personal-data")
    let contactTable = document.getElementById("client-contact-data")
    let therapyTable = document.getElementById("client-therapy-data")
    let financeTable = document.getElementById('client-finance-data')

    $(personalTable).attr('data-table', 'clients').attr('data-id', client.id)
        .append(
            $("<tr>")
                .append(
                    $("<td>").text("Voornaam").addClass('maxContent')
                )
                .append(
                    $("<td>").text(client.Personal.FirstName).addClass('editable').attr('data-label', 'Personal.FirstName')
                )
        )
        .append(
            $("<tr>")
                .append(
                    $("<td>").text("Achternaam").addClass('maxContent')
                )
                .append(
                    $("<td>").text(client.Personal.LastName).addClass('editable').attr('data-label', 'Personal.LastName')
                )
        )
        .append(
            $("<tr>")
                .append(
                    $("<td>").text("Bijnaam").addClass('maxContent')
                )
                .append(
                    $("<td>").text(client.Personal.NickName).addClass('editable').attr('data-label', 'Personal.NickName')
                )
        )
        .append(
            $("<tr>")
                .append(
                    $("<td>").text("Geboortedatum").addClass('maxContent')
                )
                .append(
                    $("<td>").text(birthday).addClass('editable').attr('data-label', 'Personal.DateOfBirth').attr('data-type', 'Date')
                )
        )
        .append(
            $("<tr>")
                .append(
                    $("<td>").text("BSN-Nummer").addClass('maxContent')
                )
                .append(
                    $("<td>").text(client.Personal.BSNNumber).addClass('editable').attr('data-label', 'Personal.BSNNumber')
                )
        )
        .append(
            $("<tr>")
                .append(
                    $("<td>").text("Huidig beroep en/of opleiding").addClass('maxContent')
                )
                .append(
                    $("<td>").text(client.Personal.MainOccupation).addClass('editable').attr('data-label', 'Personal.MainOccupation')
                )
        )
        .append(
            $("<tr>")
                .append(
                    $("<td>").text("Huisarts").addClass('maxContent')
                )
                .append(
                    $("<td>").text(client.Personal.GeneralPractitioner).addClass('editable').attr('data-label', 'Personal.GeneralPractitioner')
                )
        )

    $(contactTable).attr('data-table', 'clients').attr('data-id', client.id)
        .append(
            $("<tr>")
                .append(
                    $("<td>").text("E-mailadres").addClass('maxContent')
                )
                .append(
                    $("<td>").text(client.Contact.Email).addClass('editable').attr('data-label', 'Contact.Email')
                )
        )
        .append(
            $("<tr>")
                .append(
                    $("<td>").text("Telefoonnummer").addClass('maxContent')
                )
                .append(
                    $("<td>").text(client.Contact.Phone).addClass('editable').attr('data-label', 'Contact.Phone')
                )
        )
        .append(
            $("<tr>")
                .append(
                    $("<td>").text("Adres").addClass('maxContent')
                )
                .append(
                    $("<td>").text(address).addClass('editable').attr('data-label', 'Address').attr('data-type', "Contact.Address")
                )
        )


    $(therapyTable).attr('data-table', 'clients').attr('data-id', client.id)
        .append(
            $("<tr>")
                .append(
                    $("<td>").text("Status").addClass('maxContent')
                )
                .append(
                    $("<td>").text(client.Therapy.Status).addClass('editable').attr('data-label', 'Therapy.Status')
                )
        )
        .append(
            $("<tr>")
                .append(
                    $("<td>").text("Aantal Sessies").addClass('maxContent')
                )
                .append(
                    $("<td>").text(client.Therapy.TotalSessions).addClass('editable').attr('data-label', 'Therapy.TotalSessions')
                )
        )
        .append(
            $("<tr>")
                .append(
                    $("<td>").text("Aantal gebruikte sessies")
                )
                .append(
                    $("<td>").text(client.Therapy.UsedSessions).addClass('editable').attr('data-label', 'Therapy.UsedSessions')
                )
        )
        .append(
            $("<tr>")
                .append(
                    $("<td>").text("Trajectnaam")
                )
                .append(
                    $("<td>").text(client.Therapy.TrajectType.Title).addClass('editable').attr('data-label', 'Therapy.Title')
                )
        )
        .append(
            $("<tr>")
                .append(
                    $("<td>").text("Trajectcode")
                )
                .append(
                    $("<td>").text(client.Therapy.TrajectType.Code).addClass('editable').attr('data-label', 'Therapy.Code')
                )
        )
        .append(
            $("<tr>")
                .append(
                    $("<td>").text("Therapeuten")
                )
                .append(
                    $("<td>").text(client.Therapy.Therapists).addClass('editable').attr('data-label', 'Therapy.Therapists')
                )
        )
        .append(
            $("<tr>")
                .append(
                    $("<td>").text("Hoofddiagnose").addClass('maxContent')
                )
                .append(
                    $("<td>").text(client.Therapy.MainDiagnosis).addClass('editable').attr('data-label', 'Therapy.MainDiagnosis')
                )
        )

    $(financeTable).attr('data-Table', 'clients').attr('data-id', client.id)
        .append(
            $("<tr>")
            .append(
                $("<td>").text("Verzekeraar").addClass('maxContent')
            )
            .append(
                $("<td>").text(client.Finance.Insurer).addClass('editable').attr('dataLabel', 'Finance.Insurer')
            )
        )
        .append(
            $("<tr>")
            .append(
                $("<td>").text("Polisnummer").addClass('maxContent')
            )
            .append(
                $("<td>").text(client.Finance.PolicyNumber).addClass('editable').attr('dataLabel', 'Finance.Insurer')
            )
        )
        .append(
            $("<tr>")
            .append(
                $("<td>").text("UZOVI-nummer").addClass('maxContent')
            )
            .append(
                $("<td>").text(client.Finance.UZOVINumber).addClass('editable').attr('dataLabel', 'Finance.Insurer')
            )
        )
        .append(
            $("<tr>")
            .append(
                $("<td>").text("Factuurplan").addClass('maxContent')
            )
            .append(
                $("<td>").text(client.Finance.InvoiceType).addClass('editable').attr('dataLabel', 'Finance.Insurer')
            )
        )


    //backbutton
    setBackButton(name)
})

$(document).on('submit', '#addClientForm', function(e) {
    e.preventDefault()

    var formValues = $(this).serializeArray();

    let newClient = {};

    formValues.forEach(key => {
        newClient[key.name] = key.value
    })

    newClient["therapyStatus"] = "Aankomend"

    ipcRenderer.send('client-add-request', newClient)
})

ipcRenderer.on('client-add-response', (succ) => {
    console.log('Succes: ' + succ)
})







