export class CompanyAssociation {
    companyName: string
    status: CompanyAssociationStatus

    constructor(companyName: string, status: CompanyAssociationStatus) {
        this.companyName = companyName;
        this.status = status
    }
}

export enum CompanyAssociationStatus {
    PENDING, ACCEPTED, REJECTED, DELETED
}