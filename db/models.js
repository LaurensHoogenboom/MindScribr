class Client {
    constructor(firstName, lastName, nickName, bsnNumber, mainOccupation,
        generalPractitioner, dateOfBirth, email, phone, street, postalCode, city, totalSessions, usedSessions, therapists, therapyStatus, mainDiagnosis, insurer,
        policyNumber, uzoviNumber, invoiceType, fileId, notes, trajectTitle, trajectCode) {

        this.Personal = {
            Name: {
                FirstName: firstName,
                LastName: lastName,
                NickName: nickName,
            },
            DateOfBirth: dateOfBirth,
            BSNNumber: bsnNumber,
            GeneralPractitioner: generalPractitioner,
            MainOccupation: mainOccupation
        }

        this.Contact = {
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
            Therapists: therapists,
            Status: therapyStatus,
            MainDiagnosis: mainDiagnosis,
        }

        this.Finance = {
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

class Therapist {
    constructor(firstName, lastName, nickName, dateOfBirth, jobType, dateOfEmployment, status, workingDays, accountType, username, password, email, phone, street, postalCode, city) {
        this.Personal = {
            Name: {
                FirstName: firstName,
                LastName: lastName,
                NickName: nickName,
            },
            DateOfBirth: dateOfBirth
        }

        this.Employment = {
            JobType: jobType,
            DateOfEmployment: dateOfEmployment,
            WorkingDays: workingDays,
            Status: status
        }

        this.Account = {
            Type: accountType,
            Password: password,
            Username: username
        }

        this.Contact = {
            Email: email,
            Phone: phone,
            Address: {
                Street: street,
                PostalCode: postalCode,
                City: city
            }
        }
    }
}

class Note {
    constructor(dateTime, createdBy, type, attachedTo, receiver, priority, status, title, description) {
        this.DateTime = dateTime,
        this.CreatedBy = createdBy,
        this.Type = type,
        this.AttachedTo = attachedTo,
        this.Receiver = receiver,
        this.Priority = priority,
        this.Status = status,
        this.Title = title,
        this.Description = description
    }
}

class Status {
    constructor(title, parent, priority) {
        this.Title = title,
        this.Parent = parent,
        this.Priority = priority
    }
}

class AccountType {
    constructor(title, parent, description) {
        this.Title = title,
        this.Parent = parent,
        this.Description = description
    }
}

class CarePlan {
    constructor(title, performance, code, numberOfSessions) {
        this.Title = title,
        this.Intensity = performance,
        this.Code = code,
        this.NumberOfSessions = numberOfSessions
    }
}

exports.Client = Client
exports.Note = Note
exports.Therapist = Therapist
exports.Status = Status
exports.AccountType = AccountType
exports.CarePlan = CarePlan