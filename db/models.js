class Client {
    constructor(firstName, lastName, nickName, bsnNumber, mainOccupation,
        generalPractitioner, dateOfBirth, email, phone, street, postalCode, city, totalSessions, usedSessions, mainTherapist, therapyStatus, mainDiagnosis, insurer,
        policyNumber, uzoviNumber, invoiceType, fileId, notes, trajectTitle, trajectCode) {

        this.PersonalDetails = {
            FirstName: firstName,
            LastName: lastName,
            NickName: nickName,
            DateOfBirth: dateOfBirth,
            BSNNumber: bsnNumber,
            GeneralPractitioner: generalPractitioner,
            MainOccupation: mainOccupation
        }

        this.ContactInformation = {
            Email: email,
            Phone: phone,
            Address: {
                Street: street,
                PostalCode: postalCode,
                City: city
            }
        }

        this.Therapy = {
            FileId: fileId,
            TotalSessions: totalSessions,
            UsedSessions: usedSessions,
            TrajectType: {
                Title: trajectTitle,
                Code: trajectCode
            },
            MainTherapist: mainTherapist,
            Status: therapyStatus,
            MainDiagnosis: mainDiagnosis,
        }

        this.FinanceDetails = {
            Insurer: insurer,
            PolicyNumber: policyNumber,
            UZOVINumber: uzoviNumber,
            InvoiceType: invoiceType
        }

        this.Notes = {
            Notes: notes
        }
    }
}

class Note {
    constructor(dateTime, createdBy, type, attachedTo, receiver, title, description) {
        this.DateTime = dateTime,
        this.CreatedBy = createdBy,
        this.Type = type,
        this.AttachedTo = attachedTo,
        this.Receiver = receiver,
        this.Title = title,
        this.Description = description
    }
} 

exports.Client = Client
exports.Note = Note