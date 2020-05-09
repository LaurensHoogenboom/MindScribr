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
    full: (Name) => {
        if (Name.NickName) {
            return `${Name.FirstName} "${Name.NickName}" ${Name.LastName}`
        } else {
            return `${Name.FirstName} ${Name.LastName}`
        }
    },

    short: (Name) => {
        let FirstName = Name.FirstName
        let LastName = Name.LastName

        return `${FirstName} ${LastName}`
    },

    first: (Name) => {
        return Name.FirstName
    },

    last: (Name) => {
        return Name.LastName
    },

    nickname: (Name) => {
        return Name.NickName
    }
}

//address
const getAddress = {
    full: (Address) => {
        let address = "-"

        if (Address.City) {
            address = Address.City
            if (Address.PostalCode && Address.Street) {
                address = `${Address.Street}, ${Address.PostalCode}, ${Address.City}`
            }
        } 

        return address
    },

    postalCode: (Address) => {
        return Address.PostalCode
    },

    street: (Address) => {
        return Address.Street
    },

    city: (Address) => {
        return Address.City
    }
}

