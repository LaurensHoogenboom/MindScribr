//modules
const { ipcRenderer } = require('electron')
const appRoot = require('app-root-path')
const path = require('path')
const fs = require('fs')

//therapist utilities
module.exports = {
    //therapist list action
    list: () => {
        let where = {}

        //require client list
        ipcRenderer.send('therapists-list-request', where)
    },

    //therapist detail action
    main: (uuid) => {
        let where = {
            id: uuid
        }

        //request therapist details
        ipcRenderer.send('therapist-detail-request', where)
    },

    //therapist data action
    data: (uuid) => {
        let where = {
            id: uuid
        }

        //request therapist data
        ipcRenderer.send('therapist-data-request', where)
    }
}

const setBackButton = (title) => {
    document.addEventListener('toolbar-loaded', () => {
        $('#therpistsBackButton label').text(title)
    })
}

//retrieve therapist list
ipcRenderer.on('therapits-list-retrieve', (e, content) => {
    let therapistsTable = document.getElementById('therapists-list')

    //empty table
    $(therapistsTable).html('')

    content.forEach(therapist => {
        //determine therapist name
        let name = getName.full(therapist.Personal.Name)

        //determine employment date
        const employmentDate = getDate.dmy(therapist.Employment.DateOfEmployment)

        //determine date of birth
        const dateOfBirth = getDate.dmy(therapist.Personal.DateOfBirth)

        //build therapist table
        $(therapistsTable).append(
            $("<tr>").attr('data-label', 'therapist').attr('data-value', therapist.id)
                .append(
                    $("<td>").addClass("select").addClass("maxContent")
                        .append(
                            $("<input>").attr("type", "checkbox").attr("id", therapist.id + "checkbox")
                        )
                        .append(
                            $("<label>").attr("for", therapist.id + "checkbox")
                        )
                )
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
                    $('<td>').text(dateOfBirth)
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

//require therapist detail
ipcRenderer.on('therapist-detail-retrieve', (e, detail) => {
    // therapist info
    // determine name
    let name = getName.full(detail.therapist.Personal.Name)

    //determine birthday
    const birthdayDate = getDate.dmy(detail.therapist.Personal.DateOfBirth)

    //personal
    $('#therapist-info-name').text(name)
    $('#therapist-info-function').text(detail.therapist.Employment.JobType)
    $('#therapist-info-birthday').text(birthdayDate)

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
        let name = getName.full(client.Personal.Name)

        //add row to table
        $(clientsTable)
            .append(
                $("<tr>")
                    .append(
                        $("<td>").text(client.Therapy.FileId ? client.Therapy.FileId : "-")
                    )
                    .append(
                        $("<td>").text(`${client.Personal.Name.FirstName.charAt(0).toUpperCase()}. ${client.Personal.Name.LastName.charAt(0).toUpperCase()}.`)
                    )
                    .append(
                        $("<td>").text(name)
                    )
                    .append(
                        $("<td>").text(client.Personal.DateOfBirth ? client.Personal.DateOfBirth : "-")
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

    $('#upcoming-client-count').text(upcomingClientsCount)
    $('#current-client-count').text(currentClientsCount)
    $('#problem-client-count').text(problemClientCount)
    $('#done-client-count').text(doneClientCount)

    //backbutton
    setBackButton(name)
})

//retrieve therapist data
ipcRenderer.on('therapist-data-retrieve', (e, therapist) => {
    // therapist info
    // determine name
    let name = getName.full(therapist.Personal.Name)

    //format birthday
    const birthdayDate = getDate.dmy(therapist.Personal.DateOfBirth)

    //format dateofemployment
    const employmentDate = getDate.dmy(therapist.Employment.DateOfEmployment)

    //format adres
    let address = getAddress.full(therapist.Contact.Address)

    //tables
    let personalTable = document.getElementById('therapist-personal-data')
    let employmentTable = document.getElementById('therapist-employment-data')
    let accountTable = document.getElementById('therapist-account-data')
    let contactTable = document.getElementById('therapist-contact-data')

    $(personalTable).attr('data-table', 'therapists').attr('data-id', therapist.id)
        .append(
            $("<tr>")
                .append(
                    $("<td>").text("Naam").addClass("maxContent")
                )
                .append(
                    $("<td>").text(name).addClass("editable").attr('data-label', 'Personal.Name').addClass('editable').attr('data-type', 'Name')
                )
        )
        .append(
            $("<tr>")
                .append(
                    $("<td>").text("Geboortedatum").addClass('maxContent')
                )
                .append(
                    $("<td>").text(birthdayDate).addClass('editable').attr('data-label', 'Personal.DateOfBirth').attr('data-type', 'Date')
                )
        )

    $(employmentTable).attr('data-table', 'therapists').attr('data-id', therapist.id)
        .append(
            $("<tr>")
                .append(
                    $("<td>").text("Functie").addClass('maxContent')
                )
                .append(
                    $("<td>").text(therapist.Employment.JobType ? therapist.Employment.JobType : "-").attr('data-label', 'Employment.JobType').addClass('editable')
                )
        )
        .append(
            $("<tr>")
                .append(
                    $("<td>").text("Werkdagen").addClass('maxContent')
                )
                .append(
                    $("<td>").text(therapist.Employment.WorkingDays ? therapist.Employment.WorkingDays : "-").attr('data-label', 'Employment.WorkingDays').addClass('editable').attr('data-type', 'WorkingDays')
                )
        )
        .append(
            $("<tr>")
                .append(
                    $("<td>").text("Status").addClass('maxContent')
                )
                .append(
                    $("<td>").text(therapist.Employment.Status ? therapist.Employment.Status : "-").attr('data-label', 'Employment.Status').addClass('editable')
                )
        )
        .append(
            $("<tr>")
                .append(
                    $("<td>").text("Datum indienstreding").addClass('maxContent')
                )
                .append(
                    $("<td>").text(employmentDate).attr('data-label', 'Employment.DateOfEmployment').addClass('editable').attr('data-type', 'Date')
                )
        )

    $(accountTable).attr('data-table', 'therapists').attr('data-id', therapist.id)
        .append(
            $("<tr>")
                .append(
                    $("<td>").text("Gebruikersnaam").addClass('maxContent')
                )
                .append(
                    $("<td>").text(therapist.Account.Username ? therapist.Account.Username : "-").attr('data-label', 'Account.Username').addClass('editable')
                )
        )
        .append(
            $("<tr>")
                .append(
                    $("<td>").text("Wachtwoord").addClass('maxContent')
                )
                .append(
                    $("<td>").text(therapist.Account.Password ? therapist.Account.Password : "-").attr('data-label', 'Account.Password').addClass('editable')
                )
        )
        .append(
            $("<tr>")
                .append(
                    $("<td>").text("Type").addClass('maxContent')
                )
                .append(
                    $("<td>").text(therapist.Account.Type ? therapist.Account.Type : "-").attr('data-label', 'Account.Type').addClass('editable')
                )
        )

    $(contactTable).attr('data-table', 'therapists').attr('data-id', therapist.id)
        .append(
            $("<tr>")
                .append(
                    $("<td>").text("E-mailadres").addClass('maxContent')
                )
                .append(
                    $("<td>").text(therapist.Contact.Email ? therapist.Contact.Email : "-").attr('data-label', 'Contact.Email').addClass('editable').attr('data-type', 'Email')
                )
        )
        .append(
            $("<tr>")
                .append(
                    $("<td>").text("Telefoonnummer").addClass('maxContent')
                )
                .append(
                    $("<td>").text(therapist.Contact.Phone ? therapist.Contact.Phone : "-").attr('data-label', 'Contact.Phone').addClass('editable')
                )
        )
        .append(
            $("<tr>")
                .append(
                    $("<td>").text("Adres").addClass('maxContent')
                )
                .append(
                    $("<td>").html(address).attr('data-label', 'Contact.Address').addClass('editable').attr('data-type', 'Address')
                )
        )

    //backbutton
    setBackButton(name)
})

//add therapist

$(document).on('submit', '#addTherapistForm', function (e) {
    //prevent default submission
    e.preventDefault()

    //validat form
    form = $(this)
    form.validate()

    //in case the form is valid
    if (form.valid()) {
        //serialize the form and create a new client object
        var formValues = $(this).serializeArray();

        let newTherapist = {};

        formValues.forEach(key => {
            newTherapist[key.name] = key.value
        })

        //add the new client
        ipcRenderer.send('therapist-add-request', newTherapist)

        //close the window
        closeWindow("add-therapist")

        let where = {}

        //refresh the client list
        ipcRenderer.send('therapists-list-request', where)
    }
})

ipcRenderer.on('therapist-add-response', (succ) => {
    console.log('Succes: ' + succ)
})

//modals
$(document).on('click', '.modal .footer .button', function () {
    action = $(this).data('action')

    //delete therapist
    if (action = "delete-therapist") {
        contexttype = $(this).data("contexttype")
        context = $(this).data("context")

        //delete therapist selected in table
        if (contexttype === "table") {
            let therapists = []

            //gather all selected rows
            $('#' + context).find('tr').each(function () {
                toBeModified = false

                $(this).find('td:first-child input[type="checkbox"]:checked').each(function () {
                    toBeModified = true
                })

                if (toBeModified === true) {
                    therapists.push($(this).data('value'))
                }
            })

            //request removal
            ipcRenderer.send('therapist-delete-request', therapists)

            //close the modal
            closeModal('delete-therapist')

            let where = {}

            //refresh the client list
            ipcRenderer.send('therapists-list-request', where)
        }
    }
})

ipcRenderer.on('therapist-delete-response', (succ) => {
    console.log('Succes: ' + succ)
})

//close functions
function closeWindow(windowName) {
    //loop through all the available windows and close those whose name is matching
    $('.window').each(function () {
        if ($(this).data('name') === windowName) {
            $(this).removeClass('visible')
        }
    })
}

function closeModal(modalName) {
    $('.modal').each(function () {
        if ($(this).data('name') === modalName) {
            $(this).addClass("hidden")
        }
    })
}









