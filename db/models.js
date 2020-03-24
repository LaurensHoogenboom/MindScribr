class Client {  constructor(firstName, lastName, nickName, bsnNumber, mainOccupation, 
    generalPractitioner, dateOfBirth, email, phone, street, postalCode, city, totalSessions, usedSessions, trajectType, mainTherapist, therapyStatus, mainDiagnosis, insurer, 
    policyNumber, uzoviNumber, invoiceType, fileId, notes) {

    this.PersonalDetails = {
        FirstName : firstName,
        LastName : lastName,
        NickName : nickName,
        DateOfBirth : dateOfBirth,
        BSNNumber : bsnNumber,
        GeneralPractitioner : generalPractitioner,
        MainOccupation : mainOccupation
    }

    this.ContactInformation = {
        Email : email,
        Phone : phone,
        Address : {
            Street : street,
            PostalCode : postalCode,
            City : city
        }
    }
        
    this.Therapy = {
        FileId : fileId,
        TotalSessions: totalSessions,
        UsedSessions : usedSessions,
        TrajectType : trajectType,
        MainTherapist : mainTherapist,
        Status : therapyStatus,
        MainDiagnosis : mainDiagnosis,
    }

    this.FinanceDetails = {
        Insurer : insurer,
        PolicyNumber : policyNumber,
        UZOVINumber : uzoviNumber,
        InvoiceType : invoiceType
    }

    this.Notes = {
        Notes: notes 
    }
}}

exports.Client = Client