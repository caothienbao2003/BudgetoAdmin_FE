export class Admin {
    constructor(id, email, fullName) {
      this.id = id;
      this.email = email;
      this.fullName = fullName;
    }
  
    static fromFirestore(doc) {
      const data = doc.data();
      if (!data) {
        throw new Error("Document data is missing");
      }
      return new Admin(doc.id, data.email, data.fullName);
    }
  }