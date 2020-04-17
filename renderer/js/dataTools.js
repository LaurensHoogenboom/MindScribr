//data formatting functions

//date
const getDate = {
    json: (date) => {
        const dateJSON = new Date(date).toJSON()
        
        return dateJSON
    },

    js: (date) => {
        const dateJS = new Date(date)

        return dateJS
    },

    dmy: (date) => {
        const dateJSON = new Date(date)
        const dateDay = dateJSON.getDate() < 10 ? '0' + dateJSON.getDate() : dateJSON.getDate()
        const dateMonth = (dateJSON.getMonth() + 1) < 10 ? '0' + (dateJSON.getMonth() + 1) : (dateJSON.getMonth() + 1)
        const dateYear = dateJSON.getFullYear()
        const formatedDate = `${dateDay}/${dateMonth}/${dateYear}`
    
        return formatedDate
    },

    ymd: (date) => {
        const dateJSON = new Date(date)
        const dateDay = dateJSON.getDate() < 10 ? '0' + dateJSON.getDate() : dateJSON.getDate()
        const dateMonth = (dateJSON.getMonth() + 1) < 10 ? '0' + (dateJSON.getMonth() + 1) : (dateJSON.getMonth() + 1)
        const dateYear = dateJSON.getFullYear()
        const formatedDate = `${dateYear}/${dateMonth}/${dateDay}`

        return formatedDate
    },

    datePicker: (date) => {
        const dateArray = date.split('/')
        const newDateString = `${dateArray[2]}-${dateArray[1]}-${dateArray[0]}`

        return newDateString
    }
}

//name

const getName = {
    full: (PersonalInfo) => {
        if (PersonalInfo.NickName) {
            return `${PersonalInfo.FirstName} "${PersonalInfo.NickName}" ${PersonalInfo.LastName}`
        } else {
            return `${PersonalInfo.FirstName} ${PersonalInfo.LastName}`
        }
    },

    short: (PersonalInfo) => {
        let FirstName = PersonalInfo.FirstName
        let LastName = PersonalInfo.LastName

        return `${FirstName} ${LastName}`
    },

    first: (PersonalInfo) => {
        return PersonalInfo.FirstName
    },

    last: (PersonalInfo) => {
        return PersonalInfo.LastName
    },

    nickname: (PersonalInfo) => {
        return PersonalInfo.NickName
    }
}
