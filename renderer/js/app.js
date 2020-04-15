//jquery
$ = window.jQuery = require('jquery');

//modules
const { ipcRenderer } = require('electron')
const fs = require('fs')
const customTitlebar = require('custom-electron-titlebar')

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

$(document).on('click', '.actionTable tbody tr', function () {
    var action = $(this).closest('table').data('action')
    var dataValue = $(this).data('value')
    var dataLabel = $(this).data('label')

    window.actionData.parameters[dataLabel] = dataValue

    loadPage(action);
})

//dropdown table

$(document).on('click', '.tableWrapper.dropdown > .title', function (e) {
    $(this).closest('.tableWrapper').toggleClass('visible')
    $(this).closest('.tableWrapper .title').children('.chevron').toggleClass('right')
});

$(document).on('click', '.tableWrapper.dropdown .title .button', function (e) {
    return false;
});

$(document).on('click', '.tableWrapper.dropdown .title .actions .button', function (e) {
    let action = $(this).data('action')

    if (action === "edit") {
        dataFields = $(this).closest('.tableWrapper').find('table tbody .editable')

        if ($(dataFields).length) {
            dataFields.each(function (e) {
                fieldValue = $(this).text().trim()

                $(this).empty()

                $(this).append(
                    $("<input>").attr("type", "text").val(fieldValue)
                )
            })

            $(this).text('Opslaan')
            $(this).data('action', 'save')
        }
    }

    if (action === "save") {
        dataFields = $(this).closest('.tableWrapper').find('table tbody .editable')

        dataFields.each(function (e) {
            fieldValue = $(this).find("input").val()

            let updateData = {
                tableName: $(this).closest("tbody").data('table'),
                itemId: $(this).closest("tbody").data('id'),
                valueLabel: $(this).data('label'),
                value: $(this).find("input").val()
            }

            ipcRenderer.send('update-data', updateData)

            $(this).empty()

            $(this).text(fieldValue)
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

loadPage('therapists/')



