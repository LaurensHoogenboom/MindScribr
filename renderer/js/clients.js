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
    }
}

//retrieve client list
ipcRenderer.on('clients-retrieve', (e, content) => {
    let clientsTable = document.getElementById('clients-table')

    $(clientsTable).html('');

    content.forEach(client => {
        let name;

        if (client.Personal.NickName) {
            name = `${client.Personal.FirstName} "${client.Personal.NickName}" ${client.Personal.LastName}`
        } else {
            name = `${client.Personal.FirstName} ${client.Personal.LastName}`
        }

        //build client table
        $(clientsTable).append(
            $("<tr>").attr('data-id', client.id)
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
})

//require client detail
ipcRenderer.on('client-detail-retrieve', (e, detail) => {
    let sectionBackLabel = $('#clientDetailBack label')

    //client info
    //info
    let name;

    if (detail.client.Personal.NickName) {
        name = `${detail.client.Personal.FirstName} "${detail.client.Personal.NickName}" ${detail.client.Personal.LastName}`
    } else {
        name = `${detail.client.Personal.FirstName} ${detail.client.Personal.LastName}`
    }

    //name
    $('.mainInfoBlocks #client-info-name').text(name)

    //therapy
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
        //convert date to string
        const date = new Date(note.DateTime)
        const day = date.getDate() < 10 ? '0' + date.getDate() : date.getDate()
        const month = (date.getMonth() + 1) < 10 ? '0' + (date.getMonth() + 1) : (date.getMonth() + 1)
        const year = date.getFullYear()
        const timeString = `${day}/${month}/${year}`

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
                            $('<td>').text(timeString).addClass('maxContent')
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
                            $('<td>').text(timeString).addClass('maxContent')
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

    document.addEventListener('toolbar-loaded', function () {
        $('#clientDetailBack label').text(name)
    })

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
})






