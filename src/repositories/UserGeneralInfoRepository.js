import { db } from "../firebase/firebase";
import { collection, getDocs } from "firebase/firestore";

export class UserGeneralInfoRepository {
  static async getAllUsers() {
    try {
      const usersRef = collection(db, "userGeneralInfos"); // Reference to the 'users' collection
      const usersSnapshot = await getDocs(usersRef); // Get all documents in the collection

      if (!usersSnapshot.empty) {
        // Map each document to its data and include its ID
        return usersSnapshot.docs.map(doc => ({
          id: doc.id, // Include document ID
          ...doc.data(), // Spread the document data
        }));
      } else {
        console.error("No users found in the collection");
        return [];
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      throw error;
    }
  }
}
