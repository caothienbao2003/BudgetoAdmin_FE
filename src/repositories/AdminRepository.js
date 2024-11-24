import { db } from "../firebase/firebase";
import { doc, setDoc, getDoc, getDocs, collection, updateDoc } from "firebase/firestore";

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
      const {
        adminId,
        fullName,
        email,
        phoneNumber,
        gender,
        createdDate,
        status = "ACTIVE", // Default status to "ACTIVE"
      } = adminData;
  
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
        status,
      };
  
      // Save the new admin document
      await setDoc(adminRef, newAdmin);
      console.log("Admin added successfully to Firestore:", adminId);
    } catch (error) {
      console.error("Error adding admin to Firestore:", error);
      throw error;
    }
  }

  static async getAllAdmins() {
    try {
      const adminsRef = collection(db, "admins"); // Reference to the 'admins' collection
      const querySnapshot = await getDocs(adminsRef); // Fetch all documents
  
      // Map over the documents and include the new 'status' field
      const admins = querySnapshot.docs.map((doc) => ({
        id: doc.id, // Document ID
        ...doc.data(), // Document fields including 'status'
      }));
  
      console.log("Fetched all admins:", admins);
      return admins; // Return the list of admins
    } catch (error) {
      console.error("Error fetching all admins:", error);
      throw error;
    }
  }

  static async updateAdminStatus(adminId, newStatus) {
    try {
      const adminRef = doc(db, "admins", adminId);
      await updateDoc(adminRef, { status: newStatus });
      console.log(`Updated admin status for ${adminId} to ${newStatus}`);
    } catch (error) {
      console.error(`Error updating status for admin ${adminId}:`, error);
      throw error;
    }
  }
}
