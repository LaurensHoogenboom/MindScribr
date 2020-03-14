$ = window.jQuery = require('jquery');

const { ipcRenderer } = require('electron')
const user = require('./user')
const fs = require('fs')

//switch

$(document).on('click', '.switch:not(.subSectionNav) a', function () {
    $(this).parent().find('a').each(function () {
        $(this).removeClass('current')
    })

    $(this).addClass('current');
})

//data table handler

$(document).on('click', '.actionTable tr', function () {
    var action = $(this).closest('table').data('action');

    loadPage(action);
})

//dropdown table handler

$(document).on('click', '.tableWrapper.dropdown .title', function () {
    $(this).closest('.tableWrapper').toggleClass('visible')
    $(this).closest('.tableWrapper').find('.chevron').toggleClass('right')
})

//link handler

$(document).on('click', 'a', function (e) {
    e.preventDefault();

    var link = $(this).attr('href');

    if ($(this).attr('target') === '_blank') {
        window.location.href = link;
    }
    else {
        loadPage(link);
    }
})

//set tabbar

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

//set subsection navigation

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
    var folderPath = `./renderer/views/${pageLocation}`;
    var indexFile = folderPath + 'index.html';
    var toolbarFile = folderPath + 'toolbar.html';

    fs.access(indexFile, (error) => {
        if (error) {
            console.log("This section or page doesn't exist.");
        } else {
            fs.readFile(indexFile, 'utf8', function (error, contents) {
                $('#mainContent').html(contents);
            });

            setSectionTabbar(pageLocation);

            fs.access(toolbarFile, (error) => {
                if (error) {
                    console.log('This section or page has not any toolbar.')
                } else {
                    fs.readFile(toolbarFile, 'utf8', function (error, contents) {
                        $.when($('#mainToolbar').html(contents)).then(function() {
                            setSubSectionTabbar(pageLocation);
                        })
                    });
                }
            })
        }
    });
}

loadPage('clients/');