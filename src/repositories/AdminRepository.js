import { db } from "../firebase/firebase";
import { doc, setDoc, getDoc } from "firebase/firestore";

export class AdminRepository {
  static async getAdminById(uid) {
    try {
      const adminRef = doc(db, "admins", uid);
      const adminDoc = await getDoc(adminRef);

      if (adminDoc.exists()) {
        return adminDoc.data();
      } else {
        console.error("Admin document not found for UID:", uid);
        return null;
      }
    } catch (error) {
      console.error("Error fetching admin:", error);
      throw error;
    }
  }

  // Function to add a new admin
  static async addAdmin(adminData) {
    try {
      const { adminId, fullName, email, phoneNumber, gender, createdDate } = adminData;

      // Reference to the 'admins' collection with document ID as adminId
      const adminRef = doc(db, "admins", adminId);

      // Admin data to be saved
      const newAdmin = {
        adminId,
        fullName,
        email,
        phoneNumber,
        gender,
        createdDate,
      };

      // Save the new admin document
      await setDoc(adminRef, newAdmin);
      console.log("Admin added successfully to Firestore:", adminId);
    } catch (error) {
      console.error("Error adding admin to Firestore:", error);
      throw error;
    }
  }
}
