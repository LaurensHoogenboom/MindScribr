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
    //client info
    //info

    //determine and set name
    let name = getName.full(detail.client.Personal)
    $('.mainInfoBlocks #client-info-name').text(name)

    $('.mainInfoBlocks #client-info-sessions').text(`${detail.client.Therapy.UsedSessions} / ${detail.client.Therapy.TotalSessions}`)
    $('.mainInfoBlocks #therapy-info-code').text(`${detail.client.Therapy.TrajectType.Code}`)
    $('.mainInfoBlocks #therapy-info-title').text(`${detail.client.Therapy.TrajectType.Title}`)
    $('.mainInfoBlocks #therapy-info-status').text(`${detail.client.Therapy.Status}`)
    $('.mainInfoBlocks #therapy-info-diagnosis').text(`${detail.client.Therapy.MainDiagnosis}`)

    //contact info
    $('.mainInfoBlocks #contact-info-mail').attr('href', `mailto:${detail.client.ContactInformation.Email}`)
    $('.mainInfoBlocks #contact-info-phone').attr('href', `tel:${detail.client.ContactInformation.Phone}`)

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

    if (therapistCount > 0) {
        $('#therapist-list-title').text(`Toegewezen aan (${therapistCount})`)
    }

    //backbutton
    setBackButton(name)
})


//retrieve client data
ipcRenderer.on('client-data-retrieve', (e, client) => {
    console.log(client)

    // // therapist info
    // // determine name
    // let name = getName.full(therapist.Personal)

    // //format birthday
    // const birthdayDate = getDate.dmy(therapist.Personal.DateOfBirth)

    // //format dateofemployment
    // const employmentDate = getDate.dmy(therapist.Employment.DateOfEmployment)

    // //format adres
    // let address

    // if (therapist.Contact.Address.City) {
    //     address = therapist.Contact.City
    //     if (therapist.Contact.PostalCode && therapist.Contact.Street) {
    //         address = `${therapist.Contact.Address.Street}<br>${therapist.Contact.Address.PostalCode}<br>${therapist.Contact.Address.City}`
    //     }
    // } else {
    //     address = "-"
    // }

    // //tables
    // let personalTable = document.getElementById('therapist-personal-data')
    // let employmentTable = document.getElementById('therapist-employment-data')
    // let accountTable = document.getElementById('therapist-account-data')
    // let contactTable = document.getElementById('therapist-contact-data')

    // $(personalTable).attr('data-table', 'therapists').attr('data-id', therapist.id)
    //     .append(
    //         $("<tr>")
    //             .append(
    //                 $("<td>").text("Voornaam").addClass('maxContent')
    //             )
    //             .append(
    //                 $("<td>").text(therapist.Personal.FirstName).addClass('editable').attr('data-label', 'FirstName')
    //             )
    //     )
    //     .append(
    //         $("<tr>")
    //             .append(
    //                 $("<td>").text("Achternaam").addClass('maxContent')
    //             )
    //             .append(
    //                 $("<td>").text(therapist.Personal.LastName).addClass('editable').attr('data-label', 'LastName')
    //             )
    //     )
    //     .append(
    //         $("<tr>")
    //             .append(
    //                 $("<td>").text("Bijnaam").addClass('maxContent')
    //             )
    //             .append(
    //                 $("<td>").text(therapist.Personal.NickName).addClass('editable').attr('data-label', 'NickName')
    //             )
    //     )
    //     .append(
    //         $("<tr>")
    //             .append(
    //                 $("<td>").text("Geboortedatum").addClass('maxContent')
    //             )
    //             .append(
    //                 $("<td>").text(birthdayDate).addClass('editable').attr('data-label', 'DateOfBirth').attr('data-type', 'Date')
    //             )
    //     )

    // $(employmentTable).attr('data-table', 'therapists').attr('data-id', therapist.id)
    //     .append(
    //         $("<tr>")
    //             .append(
    //                 $("<td>").text("Functie").addClass('maxContent')
    //             )
    //             .append(
    //                 $("<td>").text(therapist.Employment.JobType ? therapist.Employment.JobType : "-").attr('data-label', 'JobType').addClass('editable')
    //             )
    //     )
    //     .append(
    //         $("<tr>")
    //             .append(
    //                 $("<td>").text("Werkdagen").addClass('maxContent')
    //             )
    //             .append(
    //                 $("<td>").text(therapist.Employment.WorkingDays ? therapist.Employment.WorkingDays : "-").attr('data-label', 'WorkingDays').addClass('editable')
    //             )
    //     )
    //     .append(
    //         $("<tr>")
    //             .append(
    //                 $("<td>").text("Status").addClass('maxContent')
    //             )
    //             .append(
    //                 $("<td>").text(therapist.Employment.Status ? therapist.Employment.Status : "-").attr('data-label', 'Status').addClass('editable')
    //             )
    //     )
    //     .append(
    //         $("<tr>")
    //             .append(
    //                 $("<td>").text("Datum indienstreding").addClass('maxContent')
    //             )
    //             .append(
    //                 $("<td>").text(employmentDate).attr('data-label', 'DateOfEmployment').addClass('editable').attr('data-type', 'Date')
    //             )
    //     )

    // $(accountTable).attr('data-table', 'therapists').attr('data-id', therapist.id)
    //     .append(
    //         $("<tr>")
    //             .append(
    //                 $("<td>").text("Gebruikersnaam").addClass('maxContent')
    //             )
    //             .append(
    //                 $("<td>").text(therapist.Account.Username ? therapist.Account.Username : "-").attr('data-label', 'Username').addClass('editable')
    //             )
    //     )
    //     .append(
    //         $("<tr>")
    //             .append(
    //                 $("<td>").text("Wachtwoord").addClass('maxContent')
    //             )
    //             .append(
    //                 $("<td>").text(therapist.Account.Password ? therapist.Account.Password : "-").attr('data-label', 'Password').addClass('editable')
    //             )
    //     )
    //     .append(
    //         $("<tr>")
    //             .append(
    //                 $("<td>").text("Type").addClass('maxContent')
    //             )
    //             .append(
    //                 $("<td>").text(therapist.Account.Type ? therapist.Account.Type : "-").attr('data-label', 'Type').addClass('editable')
    //             )
    //     )

    // $(contactTable).attr('data-table', 'therapists').attr('data-id', therapist.id)
    //     .append(
    //         $("<tr>")
    //             .append(
    //                 $("<td>").text("E-mailadres").addClass('maxContent')
    //             )
    //             .append(
    //                 $("<td>").text(therapist.Contact.Email ? therapist.Contact.Email : "-").attr('data-label', 'Email').addClass('editable')
    //             )
    //     )
    //     .append(
    //         $("<tr>")
    //             .append(
    //                 $("<td>").text("Telefoonnummer").addClass('maxContent')
    //             )
    //             .append(
    //                 $("<td>").text(therapist.Contact.Phone ? therapist.Contact.Phone : "-").attr('data-label', 'Phone').addClass('editable')
    //             )
    //     )
    //     .append(
    //         $("<tr>")
    //             .append(
    //                 $("<td>").text("Adres").addClass('maxContent')
    //             )
    //             .append(
    //                 $("<td>").html(address).attr('data-label', 'Address').addClass('editable')
    //             )
    //     )

    // //backbutton
    // setBackButton(name)
})








