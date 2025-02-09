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
        let name = getName.full(client.Personal.Name);

        //determine dateOfBirth
        let dateOfBirth = getDate.dmy(client.Personal.DateOfBirth)

        //build client table
        $(clientsTable).append(
            $("<tr>").attr('data-value', client.id).attr('data-label', 'client')
                .append(
                    $("<td>").addClass("select").addClass("maxContent")
                        .append(
                            $("<input>").attr("type", "checkbox").attr("id", client.id + "checkbox")
                        )
                        .append(
                            $("<label>").attr("for", client.id + "checkbox")
                        )
                )
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
    let name = getName.full(detail.client.Personal.Name)
    $('.mainInfoBlocks #client-info-name').text(name)

    $('.mainInfoBlocks #client-info-sessions').text(`${detail.client.Therapy.UsedSessions ? detail.client.Therapy.UsedSessions : '-'} / ${detail.client.Therapy.TotalSessions ? detail.client.Therapy.TotalSessions : '-'}`)

    //determine plan and set plan name
    let carePlan = getCarePlan.titleAndIntensity(detail.client.Therapy.CarePlan)
    $('.mainInfoBlocks #therapy-info-code').text(carePlan ? carePlan : '-')

    let carePlanCode = getCarePlan.code(detail.client.Therapy.CarePlan)
    $('.mainInfoBlocks #therapy-info-title').text(carePlanCode ? carePlanCode : '-')
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
                            $('<td>').text(`${getName.first(therapist.Personal.Name)} ${getName.last(therapist.Personal.Name)}`).addClass('maxContent')
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
    let name = getName.full(client.Personal.Name)

    //get client birthday dmy
    let birthday = getDate.dmy(client.Personal.DateOfBirth)

    //get client address
    let address = getAddress.full(client.Contact.Address)

    //tablelist
    let personalTable = document.getElementById("client-personal-data")
    let contactTable = document.getElementById("client-contact-data")
    let therapyTable = document.getElementById("client-therapy-data")
    let financeTable = document.getElementById('client-finance-data')

    //personal data table
    $(personalTable).attr('data-table', 'clients').attr('data-id', client.id)
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
                    $("<td>").text(client.Personal.GeneralPractitioner).addClass('editable').attr('data-label', 'Personal.GeneralPractitioner').attr('data-type', 'GeneralPractioner')
                )
        )

    //contact info table
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
                    $("<td>").text(address).addClass('editable').attr('data-label', 'Contact.Address').attr('data-type', "Address")
                )
        )

    //therapy info table
    let therapistList = $()

    client.Therapy.Therapists.forEach((therapist) => {
        therapistList = $(therapistList).add (
            $("<span>").text(`${getName.first(therapist.Personal.Name)} ${getName.last(therapist.Personal.Name)} | ${therapist.Relation}`).addClass('tag').attr("data-id", therapist.id).attr('data-relation', therapist.Relation)
        )
    })

    $(therapyTable).attr('data-table', 'clients').attr('data-id', client.id)
        .append(
            $("<tr>")
                .append(
                    $("<td>").text("Status").addClass('maxContent')
                )
                .append(
                    $("<td>").text(client.Therapy.Status).addClass('editable').attr('data-label', 'Therapy.Status').attr('data-type', 'Status').attr('data-statusparent', 'Client')
                )
        )
        .append(
            $("<tr>")
                .append(
                    $("<td>").text("Aantal Sessies").addClass('maxContent')
                )
                .append(
                    $("<td>").text(client.Therapy.TotalSessions).addClass('editable').attr('data-label', 'Therapy.TotalSessions').attr('data-type', 'Number')
                )
        )
        .append(
            $("<tr>")
                .append(
                    $("<td>").text("Aantal gebruikte sessies")
                )
                .append(
                    $("<td>").text(client.Therapy.UsedSessions).addClass('editable').attr('data-label', 'Therapy.UsedSessions').attr('data-type', 'Number')
                )
        )
        .append(
            $("<tr>")
                .append(
                    $("<td>").text("Traject")
                )
                .append(
                    $("<td>").text(`${getCarePlan.titleAndIntensity(client.Therapy.CarePlan)}`).addClass('editable').attr('data-label', 'Therapy.CarePlan').attr('data-type', 'CarePlan').attr('data-careplan', JSON.stringify(client.Therapy.CarePlan))
                )
        )
        .append(
            $("<tr>")
                .append(
                    $("<td>").text("Therapeuten")
                )
                .append(
                    $("<td>").html(therapistList).addClass('editable').attr('data-label', 'Therapy.Therapists').attr('data-type', 'therapists')
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

    //finance info table
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

//add client

$(document).on('submit', '#addClientForm', function (e) {
    //prevent default submission
    e.preventDefault()

    //validat form
    form = $(this)
    form.validate()

    //in case the form is valid
    if (form.valid()) {
        //serialize the form and create a new client object
        var formValues = $(this).serializeArray();

        let newClient = {};

        formValues.forEach(key => {
            newClient[key.name] = key.value
        })

        //set the default therapy status
        newClient["therapyStatus"] = "Aankomend"

        //add the new client
        ipcRenderer.send('client-add-request', newClient)

        //close the window
        closeWindow("add-client")

        let where = {}

        //refresh the client list
        ipcRenderer.send('clients-request', where)
    }
})

ipcRenderer.on('client-add-response', (succ) => {
    console.log('Succes: ' + succ)
})

//modals
$(document).on('click', '.modal .footer .button', function () {
    action = $(this).data('action')

    //delete client
    if (action = "delete-client") {
        contexttype = $(this).data("contexttype")
        context = $(this).data("context")

        //delete clients selected in table
        if (contexttype === "table") {
            let clients = []

            //gather all selected rows
            $('#' + context).find('tr').each(function () {
                toBeModified = false

                $(this).find('td:first-child input[type="checkbox"]:checked').each(function () {
                    toBeModified = true
                })

                if (toBeModified === true) {
                    clients.push($(this).data('value'))
                }
            })

            //request removal
            ipcRenderer.send('client-delete-request', clients)

            //close the modal
            closeModal('delete-client')

            let where = {}

            //refresh the client list
            ipcRenderer.send('clients-request', where)
        }
    }
})

ipcRenderer.on('client-delete-response', (succ) => {
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









