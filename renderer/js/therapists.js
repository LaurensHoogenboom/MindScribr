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
})



//require client detail
ipcRenderer.on('client-detail-retrieve', (e, detail) => {



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






