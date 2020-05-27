//jquery
$ = window.jQuery = require('jquery')
require("jquery-validation")

//modules
const { ipcRenderer } = require('electron')
const fs = require('fs')
const customTitlebar = require('custom-electron-titlebar')
const interact = require('interactjs')
const { v4: uuidv4 } = require('uuid');

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

//button 

$(document).on('click', '.button', function () {
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

//popup

$(document).on('click', '.button', function (e) {
    e.stopPropagation();
    e.preventDefault();

    let buttonAction = $(this).data('action')
    let button = $(this)

    if (buttonAction === "open-popup") {
        let popupName = button.data('popupname')

        $('.popup').each(function () {
            if ($(this).data("name") === popupName) {
                $(this).toggleClass('hidden')
            }

            if ($(this).hasClass('hidden')) {
                button.removeClass('clicked')
            } else {
                button.addClass('clicked')
            }
        })
    }
})

//switch

$(document).on('click', '.switch:not(.subSectionNav) a', function () {
    $(this).parent().find('a').each(function () {
        $(this).removeClass('current')
    })

    $(this).addClass('current')
})

//tag

$(document).on('click', '.tag .cross', function () {
    let parentTag = $(this).parent()

    $(parentTag).animate({
        opacity: 0
    }, 200)

    setTimeout(() => {
        $(parentTag).animate({
            width: 0,
            height: 0
        }, 200, function () {
            $(parentTag).remove()
        })
    }, 200)
})

//tagSearch

let tagSearchRequests = []

$(document).on('keyup change', '.tagSearch input', function () {
    let table = $(this).closest('.tagSearch').data('table')
    let fields = $(this).closest('.tagSearch').data('fields').split(',')
    let searchString = $(this).val()
    let tagInput = $(this).closest('.tagSearch')
    let id = uuidv4();
    let label = $(this).closest('.tagSearch').data('label').split(',')

    if (searchString) {
        searchContext = {
            Table: table,
            Fields: fields,
            SearchString: searchString,
            TagInput: tagInput,
            TagLabel: label,
            Id: id
        }

        tagSearchRequests.push(searchContext)

        ipcRenderer.send('search-data-request', searchContext)
    } else {
        $(this).closest('.tagSearch').find('.suggestions').empty()
    }
})

ipcRenderer.on('search-data-response', (e, response) => {
    tagSearchRequests.forEach((request, index) => {
        if (request.Id === response.Id) {
            $(request.TagInput).find('.suggestions').empty()

            response.Result.forEach((possibleTag) => {
                let tagLabel = []

                request.TagLabel.forEach((labelPart) => {
                    tagLabel.push(getField(possibleTag, labelPart.split('.'), ' '))
                })

                tagLabel = tagLabel.join(" ")

                $(request.TagInput).find('.suggestions')
                    .append(
                        $("<span>").addClass("tag").text(tagLabel).attr('data-id', possibleTag.id)
                    )
            })

            tagSearchRequests.splice(index, 1)
        }
    })
})

$(document).on('click', '.tagSearch .suggestions .tag', function () {
    let target = `#${$(this).closest('.tagSearch').data('target')}`
    let properties = $(this).closest('.tagSearch').data('properties').split(',')
    let data = []

    properties.forEach((property) => {
        let propertyValue = $(this).closest('form').find(`input[name="${property}"], select[name="${property}"]`).val()

        item = {
            title: property,
            value: propertyValue
        }

        data.push(item)
    })

    data.forEach(item => {
        $(this).attr(`data-${item.title}`, item.value)

        let text = $(this).text()
        text += ` | ${item.value}`
        $(this).text(text)
    })

    $(this)
        .append(
            $("<label>").addClass('cross').addClass('white')
                .append(
                    $("<span>")
                )
                .append(
                    $("<span>")
                )
        )

    $(this).appendTo(target)
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

                if (dataType === "Number") {
                    $(this).append(
                        $("<input>").attr('type', 'number').val(fieldValue)
                    )
                } else if (dataType === "Date") {
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
                    let therapistPopupName = "popup-" + uuidv4()
                    let rowId = "therapists-" + uuidv4()

                    $(this).addClass('tagEditWrapper')

                    $(this).append(
                        $("<div>").attr('id', rowId).html(fieldHTML).addClass('tagList')
                    )

                    $(`#${rowId}`).find('.tag').each(function () {
                        $(this).append(
                            $('<label>').addClass('cross').addClass('white')
                                .append(
                                    $("<span>")
                                )
                                .append(
                                    $("<span>")
                                )
                        )
                    })

                    $(this)
                        .prepend(

                            $("<label>").addClass('button').addClass('square').addClass('grey').attr('data-action', 'open-popup').attr('data-popupname', therapistPopupName)
                                .append(
                                    $("<div>").addClass('plus')
                                        .append(
                                            $("<span>")
                                        )
                                        .append(
                                            $("<span>")
                                        )
                                )

                        )
                        .append(
                            $("<div>").addClass('popup').attr('data-name', therapistPopupName).addClass('hidden')
                                .append(
                                    $('<form>')
                                        .append(
                                            $("<section>")
                                                .append(
                                                    $("<select>").attr('name', 'relation')
                                                        .append(
                                                            $("<option>").text("Hoofdbehandelaar")
                                                        )
                                                        .append(
                                                            $("<option>").text("Therapeut")
                                                        )
                                                )
                                        )
                                        .append(
                                            $("<section>")
                                                .append(
                                                    $("<div>").addClass('tagSearch').attr('data-table', 'therapists')
                                                        .attr('data-fields', "Personal.Name.FirstName,Personal.Name.LastName,Personal.Name.NickName")
                                                        .attr('data-label', "Personal.Name.FirstName,Personal.Name.LastName")
                                                        .attr('data-properties', 'relation').attr('data-target', rowId)
                                                        .append(
                                                            $("<input>").attr("type", "text").attr("placeholder", "Therapeut zoeken")
                                                        )
                                                        .append(
                                                            $("<div>").addClass("suggestions")
                                                        )
                                                )
                                        )
                                )
                        )
                } else if (dataType === "Status") {
                    let inputId = 'statusInput-' + uuidv4()
                    let statusParent = $(this).data('statusparent')
                    let currentStatus = fieldValue

                    let statusRequest = {
                        id: uuidv4(),
                        parent: statusParent
                    }

                    ipcRenderer.send('status-list-request', statusRequest)

                    $(this)
                        .append(
                            $("<select>").attr('id', inputId)
                        )

                    if (currentStatus) {
                        $(`#${inputId}`)
                            .append(
                                $("<option>").text(fieldValue).attr('selected', 'selected')
                            )
                    }

                    ipcRenderer.on('status-list-response', (e, response) => {
                        if (response.id === statusRequest.id) {
                            response.statuses.forEach((status) => {
                                if (status.Title !== fieldValue) {
                                    $(`#${inputId}`)
                                        .append(
                                            $("<option>").text(status.Title)
                                        )
                                }
                            })
                        }
                    })
                } else if (dataType === "CarePlan") {
                    let inputId = 'StatusInput' + uuidv4()
                    let currentPlan = fieldValue
                    let currentPlanObject = $(this).data('careplan')

                    let carePlanRequest = {
                        id: uuidv4(),
                        where: {}
                    }

                    ipcRenderer.send('careplan-list-request', carePlanRequest)

                    $(this)
                        .append(
                            $("<select>").attr('id', inputId)
                        )

                    if (currentPlan) {
                        $(`#${inputId}`)
                            .append(
                                $("<option>").text(fieldValue).attr('data-careplan', JSON.stringify(currentPlanObject))
                            )
                    }

                    ipcRenderer.on('careplan-list-response', (e, response) => {
                        if (response.id === carePlanRequest.id) {
                            response.careplans.forEach((careplan) => {
                                if (careplan.id !== currentPlanObject.id) {
                                    $(`#${inputId}`)
                                        .append(
                                            $("<option>").text(`${careplan.Title} | ${careplan.Intensity}`).attr('data-careplan', JSON.stringify(careplan))
                                        )
                                }
                            })
                        }
                    })
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

                $(this).find('.tagSearch .suggestions').empty()
                $(this).removeClass('tagEditWrapper')

                $(this).find(".tag").each(function () {
                    relatedTherapist = {
                        id: $(this).data('id'),
                        Relation: $(this).data('relation')
                    }

                    $(this).find('.cross').remove()

                    therapists.push(relatedTherapist)

                    therapistsList += $(this).prop('outerHTML');
                })

                dataToStore = therapists
                fieldIsHTML = true
                fieldValue = therapistsList
            }

            if (dataType === "Status") {
                let status = $(this).find("select").val()

                fieldValue = status
                dataToStore = status
            }

            if (dataType === "CarePlan") {
                let careplan = $(this).find("select option:selected").data('careplan')

                $(this).attr('data-careplan', JSON.stringify(careplan))

                fieldValue = $(this).find("select option:selected").text()
                dataToStore = careplan
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

//a element handling

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

//main tabbar handing

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



