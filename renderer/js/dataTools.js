//data formatting functions

//date
const getFormattedDate = (date) => {

    const dateJSON = new Date(date)
    const dateDay = dateJSON.getDate() < 10 ? '0' + dateJSON.getDate() : dateJSON.getDate()
    const dateMonth = (dateJSON.getMonth() + 1) < 10 ? '0' + (dateJSON.getMonth() + 1) : (dateJSON.getMonth() + 1)
    const dateYear = dateJSON.getFullYear()
    const formatedDate = `${dateDay}/${dateMonth}/${dateYear}`

    return formatedDate
}