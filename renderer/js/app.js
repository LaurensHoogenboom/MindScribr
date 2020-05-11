//jquery
$ = window.jQuery = require('jquery')
require("jquery-validation")

//modules
const { ipcRenderer } = require('electron')
const fs = require('fs')
const customTitlebar = require('custom-electron-titlebar')
const interact = require('interactjs')


//initiate titlebar

let MainTitlebar = new customTitlebar.Titlebar({
    backgroundColor: customTitlebar.Color.fromHex('#417DD6'),
})

MainTitlebar.updateTitle('Mindscibr')

//set global action data
window.actionData = {
    parameters: {},
    pageLocation: ''
}

//toolbar 

$(document).on('click', '.toolbar .button', function () {
    let buttonAction = $(this).data('action')

    if (buttonAction === "open-window") {
        let windowToOpen = $(this).data("windowname")

        $('.window').each(function () {
            let windowName = $(this).data('name')

            if (windowName === windowToOpen) {
                $(this).addClass('visible')

                const position = { x: 0, y: 0 }

                interact(this).draggable({
                    allowFrom: '.title',

                    modifiers: [
                        interact.modifiers.restrictRect({
                            restriction: '.mainContent',
                            endOnly: true,
                            restrictRect: { left: 0, right: 0, top: 0, bottom: 0 }
                        })
                    ],

                    listeners: {
                        start(event) {
                            //console.log(event.type, event.target)
                        },
                        move(event) {
                            position.x += event.dx
                            position.y += event.dy

                            event.target.style.transform =
                                `translateX( calc(-50% + ${position.x}px) ) translateY( calc(-50% + ${position.y}px) )`;
                        },
                    }
                })
            }
        })
    }

    if (buttonAction === "open-modal") {
        let modalToOpen = $(this).data("modalname")

        $(".modal").each(function () {
            modalName = $(this).data("name")

            if (modalToOpen === modalName) {
                $(this).removeClass('hidden')
            }
        })
    }

    if (buttonAction === "select-all") {
        let contextType = $(this).data('contexttype')

        if (contextType === "table") {
            let context = $(this).data('context')
            let allChecked = true

            $('#' + context).find('tr td:first-child input[type="checkbox"]').each(function () {
                if (!$(this).is(':checked')) {
                    allChecked = false
                }
            })

            if (allChecked) {
                $('#' + context).find('tr td:first-child input[type="checkbox"]:checked').each(function () {
                    $(this).prop('checked', false)
                })

                showActionGroup(context)
            } else {
                $('#' + context).find('tr td:first-child input[type="checkbox"]').each(function () {
                    $(this).prop('checked', true)
                })

                hideActionGroup(context)
            }
        }
    }
})

//hide actiongroup by name
function hideActionGroup(groupName) {
    $(".toolbar .actionGroup").each(function () {
        if ($(this).data("for") === groupName) {
            $(this).removeClass("hidden")
        }
    })
}

//show actiongroup by name
function showActionGroup(groupName) {
    $(".toolbar .actionGroup").each(function () {
        if ($(this).data("for") === groupName) {
            $(this).addClass("hidden")
        }
    })
}

//window

$(document).on('click', '.window .footer .button, .window .title .button', function () {
    buttonAction = $(this).data('action')

    if (buttonAction === "close-window") {
        windowToClose = $(this).data("windowname")

        closeWindow(windowToClose)
    }
})

function closeWindow(windowName) {
    $('.window').each(function () {
        if ($(this).data('name') === windowName) {
            $(this).removeClass('visible')
        }
    })
}

//modal

$(document).on('click', '.modal .footer .button', function () {
    buttonAction = $(this).data('action')

    if (buttonAction = "close-modal") {
        modalToClose = $(this).data("modalname")

        closeModal(modalToClose)
    }
})

function closeModal(modalName) {
    $('.modal').each(function () {
        if ($(this).data('name') === modalName) {
            $(this).addClass("hidden")
        }
    })
}

//switch

$(document).on('click', '.switch:not(.subSectionNav) a', function () {
    $(this).parent().find('a').each(function () {
        $(this).removeClass('current')
    })

    $(this).addClass('current');
})

//input grid input description

$(document).on('mouseover', '.inputGrid .input .title .actions .infoButton', function () {
    $(this).closest('.input').find('.description').addClass('visible');
}).on('mouseout', '.inputGrid .input .title .actions .infoButton', function () {
    $(this).closest('.input').find('.description').removeClass('visible');
})

//action table

$(document).on('click', '.actionTable tbody tr td', function (e) {
    if (e.target !== this) {
        return
    }
    else {
        var action = $(this).closest('table').data('action')
        var dataValue = $(this).closest('tr').data('value')
        var dataLabel = $(this).closest('tr').data('label')

        window.actionData.parameters[dataLabel] = dataValue

        loadPage(action);
    }
})

$(document).on('change', '.actionTable tbody .select input[type="checkbox"]', function (e) {
    let menuName = $(this).closest('tbody').attr("id")

    if ($(this).is(":checked")) {
        hideActionGroup(menuName)
    }
    else {
        editModeActive = false

        $(this).closest('tbody').find('.select input').each(function () {
            if ($(this).is(":checked")) {
                editModeActive = true
            }
        })

        if (!editModeActive) {
            showActionGroup(menuName)
        }
    }
})

//dropdown table

$(document).on('click', '.tableWrapper.dropdown > .title', function (e) {
    $(this).closest('.tableWrapper').toggleClass('visible')
    $(this).closest('.tableWrapper .title').children('.chevron').toggleClass('right')
});

$(document).on('click', '.tableWrapper.dropdown .title .button', function (e) {
    return false;
});

//dropdown table actions
$(document).on('click', '.tableWrapper.dropdown .title .actions .button', function (e) {
    let action = $(this).data('action')

    if (action === "edit") {
        dataFields = $(this).closest('.tableWrapper').find('table tbody .editable')

        if ($(dataFields).length) {
            dataFields.each(function (e) {
                let dataType = $(this).data('type')
                let fieldValue = $(this).text().trim()
                let fieldHTML = $(this).html()

                $(this).empty()

                if (dataType === "Date") {
                    $(this).append(
                        $("<input>").attr("type", "date").val(getDate.datePicker(fieldValue))

                    )
                } else if (dataType === "Email") {
                    $(this).append(
                        $("<input>").attr("type", "email").val(fieldValue)
                    )
                } else if (dataType === "Address") {
                    fieldValue = fieldValue.split(',')

                    $(this)
                        .append(
                            $("<input>").attr("type", "text").val(fieldValue[0] && fieldValue[0] !== "-" ? fieldValue[0].trim() : "").attr('placeholder', 'Straat en huisnummer')
                        )

                    $(this)
                        .append(
                            $("<input>").attr("type", "text").val(fieldValue[1] && fieldValue[1] !== "-" ? fieldValue[1].trim() : "").attr('placeholder', 'Postcode')
                        )

                    $(this)
                        .append(
                            $("<input>").attr("type", "text").val(fieldValue[2] && fieldValue[2] !== "-" ? fieldValue[2].trim() : "").attr('placeholder', 'Woonplaats')
                        )
                } else if (dataType === "Name") {
                    fieldValue = fieldValue.split(" ")

                    $(this)
                        .append(
                            $("<input>").attr("type", "text").val(fieldValue[0] && fieldValue[0] !== "-" ? fieldValue[0].trim() : "").attr("placeholder", "Voornaam")
                        )

                    if (fieldValue.length < 3) {
                        $(this)
                            .append(
                                $("<input>").attr("type", "text").val(fieldValue[1] && fieldValue[1] !== "-" ? fieldValue[1].trim() : "").attr("placeholder", "Achernaam")
                            )

                        $(this)
                            .append(
                                $("<input>").attr("type", "text").attr("placeholder", "Bijnaam")
                            )
                    } else {
                        $(this)
                            .append(
                                $("<input>").attr("type", "text").val(fieldValue[2] && fieldValue[2] !== "-" ? fieldValue[2].trim() : "").attr("placeholder", "Achernaam")
                            )

                        $(this)
                            .append(
                                $("<input>").attr("type", "text").val(fieldValue[1] && fieldValue[1] !== "-" ? fieldValue[1].trim().slice(1, -1) : "").attr("placeholder", "Bijnaam")
                            )
                    }
                } else if (dataType === "WorkingDays") {
                    fieldValue = fieldValue.split(",")

                    $(this)
                        .append(
                            $("<input>").attr("type", "checkbox").attr('id', "monday").prop("checked", fieldValue.includes("Ma") ? true : false).attr("name", "Ma")
                        )
                        .append(
                            $("<label>").attr("for", "monday").text("Maandag")
                        )
                        .append(
                            $("<input>").attr("type", "checkbox").attr('id', "tuesday").prop("checked", fieldValue.includes("Di") ? true : false).attr("name", "Di")
                        )
                        .append(
                            $("<label>").attr("for", "tuesday").text('Dinsdag')
                        )
                        .append(
                            $("<input>").attr("type", "checkbox").attr('id', "wednesday").prop("checked", fieldValue.includes("Wo") ? true : false).attr("name", "Wo")
                        )
                        .append(
                            $("<label>").attr("for", "wednesday").text('Woensdag')
                        )
                        .append(
                            $("<input>").attr("type", "checkbox").attr('id', "thursday").prop("checked", fieldValue.includes("Do") ? true : false).attr("name", "Do")
                        )
                        .append(
                            $("<label>").attr("for", "thursday").text('Donderdag')
                        )
                        .append(
                            $("<input>").attr("type", "checkbox").attr('id', "friday").prop("checked", fieldValue.includes("Vr") ? true : false).attr("name", "Vr")
                        )
                        .append(
                            $("<label>").attr("for", "friday").text('Vrijdag')
                        )
                } else if (dataType === "therapists") {
                    $(this).html(fieldHTML)

                    $(this).append(
                        $("<label>").addClass('button').text('Toevoegen')
                    )
                } else {
                    $(this).append(
                        $("<input>").attr("type", "text").val(fieldValue)
                    )
                }
            })

            $(this).text('Opslaan')
            $(this).data('action', 'save')
        }
    }

    if (action === "save") {
        dataFields = $(this).closest('.tableWrapper').find('table tbody .editable')

        dataFields.each(function (e) {
            let fieldValue = $(this).find("input").val()
            let fieldIsHTML = false
            let dataType = $(this).data('type')
            let dataToStore = $(this).find("input").val()

            if (dataType === "Date") {
                dataToStore = getDate.json(dataToStore)
                fieldValue = getDate.dmy(fieldValue)
            }

            if (dataType === "Address") {
                let street = $(this).find("input")[0].value
                let postalCode = $(this).find("input")[1].value
                let city = $(this).find("input")[2].value

                fieldValue = `${street}, ${postalCode}, ${city}`
                dataToStore = {
                    Street: street,
                    PostalCode: postalCode,
                    City: city
                }

                console.log($(this).find('input'))
            }

            if (dataType === "Name") {
                let firstName = $(this).find("input")[0].value
                let lastName = $(this).find("input")[1].value
                let nickName = $(this).find("input")[2].value

                fieldValue = `${firstName} "${nickName}" ${lastName}`
                dataToStore = {
                    FirstName: firstName,
                    LastName: lastName,
                    NickName: nickName
                }
            }

            if (dataType === "WorkingDays") {
                let workingDays = []

                $(this).find("input").each(function () {
                    if ($(this).is(":checked")) {
                        workingDays.push($(this).attr("name"))
                    }
                })

                dataToStore = workingDays
                fieldValue = workingDays
            }

            if (dataType === "therapists") {
                let therapists = []
                let therapistsList = ""

                $(this).find(".tag").each(function() {
                    relatedTherapist = {}

                    relatedTherapist.id = $(this).data('id')
                    relatedTherapist.Relation = $(this).data('relation')

                    therapists.push(relatedTherapist)

                    therapistsList += $(this).prop('outerHTML');
                })

                dataToStore = therapists
                fieldIsHTML = true
                fieldValue = therapistsList
            }

            let updateData = {
                tableName: $(this).closest("tbody").data('table'),
                itemId: $(this).closest("tbody").data('id'),
                valueLabel: $(this).data('label'),
                value: dataToStore
            }

            ipcRenderer.send('update-data', updateData)

            $(this).empty()

            if (fieldIsHTML) {
                $(this).html(fieldValue)
            } else {
                $(this).text(fieldValue)
            }
        })

        $(this).text('Bewerken')
        $(this).data('action', 'edit')
    }
})

//link

$(document).on('click', 'a', function (e) {
    e.preventDefault();

    var link = $(this).attr('href');

    if ($(this).attr('target') === '_blank') {
        window.location.href = link;
    } else if (link.includes('mailto') || link.includes('phone')) {
        window.location.href = link;
    } else {
        let actionParameters = $(this).data('parameters')

        if (actionParameters) {
            window.actionData.parameters = actionParameters;
        }

        loadPage(link)
    }
})

//tabbar

function setSectionTabbar(link) {
    var currentSection = link.split('/')[0].toLowerCase();

    $('header nav .tabbar a').each(function () {
        var linkSection = $(this).attr('href').split('/')[0].toLowerCase();

        if (linkSection === currentSection) {
            $(this).addClass('current');
        }
        else {
            $(this).removeClass('current');
        }
    })
}

//subsection navigation

function setSubSectionTabbar(link) {
    var currentSection = link.split('/')[1].toLowerCase();

    $('.toolbar .switch.subSectionNav a').each(function () {
        var linkSection = $(this).attr('href').split('/')[1].toLowerCase();

        if (linkSection === currentSection) {
            $(this).addClass('current');
        }
        else {
            $(this).removeClass('current');
        }
    })
}

//load page

function loadPage(pageLocation) {
    //update action data
    window.actionData.pageLocation = pageLocation

    //paths to page files
    var htmlPath = `./renderer/views/${pageLocation}`

    //page files
    var indexFile = htmlPath + 'index.html'
    var toolbarFile = htmlPath + 'toolbar.html'

    //events
    let pageLoaded = new Event('page-loaded')
    let toolbarLoaded = new Event('toolbar-loaded')

    //check if page content exist
    fs.access(indexFile, (error) => {
        if (error) {
            console.log("This section or page doesn't exist.")
        } else {
            //set page content
            fs.readFile(indexFile, 'utf8', function (error, contents) {
                $.when($('#mainContent').html(contents)).then(

                    //page is ready for modification
                    document.dispatchEvent(pageLoaded)
                )
            });

            //update main navigation
            setSectionTabbar(pageLocation)
        }
    })

    //if toolbar file exist
    fs.access(toolbarFile, (error) => {
        if (error) {
            console.log('This section or page has not any toolbar.')
        } else {
            //set toolbar
            fs.readFile(toolbarFile, 'utf8', function (error, contents) {
                //fade out old content
                $('#mainToolbar > *').animate({
                    opacity: '0',
                }, {
                    queue: false,
                    duration: 100
                })

                $('#mainToolbar').animate({
                    padding: '5px 20px 5px 60px'
                }, {
                    queue: false,
                    duration: 100
                })

                //fade in new content
                setTimeout(function () {
                    $('#mainToolbar').css('padding', '5px 40px')

                    $.when($('#mainToolbar').html(contents)).then(function () {
                        //update sub navigation
                        setSubSectionTabbar(pageLocation)

                        //toolbar is ready for modification
                        document.dispatchEvent(toolbarLoaded)
                    })
                }, 150)
            });
        }
    })
}

loadPage('clients/')



