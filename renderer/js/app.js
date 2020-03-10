$ = window.jQuery = require('jquery');

const {ipcRenderer} = require('electron')
const user = require('./user')

//selectbox

$('.select .button').click(function() {
    $(this).closest('.select').find('.options').each(function() {
        $(this).toggleClass('expand')
    })

    $(this).find('.chevron').toggleClass('clicked')
})