import { db } from "../firebase/firebase";
import { doc, getDoc } from "firebase/firestore";

export class AdminRepository {
  static async getAdminById(uid) {
    try {
      const adminRef = doc(db, "admins", uid);
      const adminDoc = await getDoc(adminRef);

      if (adminDoc.exists()) {
        return adminDoc.data(); // Directly return document data instead of converting to model
      } else {
        console.error("Admin document not found for UID:", uid);
        return null;
      }
    } catch (error) {
      console.error("Error fetching admin:", error);
      throw error;
    }
  }
}