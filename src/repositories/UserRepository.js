import { db } from "../firebase/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";

export class UserRepository {
  /**
   * Fetch a user document by its ID.
   * @param {string} userId - The ID of the user document to fetch.
   * @returns {Promise<Object|null>} - The user document data or null if not found.
   */
  static async getUserById(userId) {
    try {
      const userDocRef = doc(db, "users", userId);
      const userDoc = await getDoc(userDocRef);
      if (userDoc.exists()) {
        return userDoc.data();
      } else {
        console.error(`No user found with ID: ${userId}`);
        return null;
      }
    } catch (error) {
      console.error(`Error fetching user with ID ${userId}:`, error);
      throw error;
    }
  }

  /**
   * Update the "status" field of a user document in Firestore.
   * @param {string} userId - The ID of the user document to update.
   * @param {string} newStatus - The new status value to set ("ACTIVE" or "INACTIVE").
   * @returns {Promise<void>} - Resolves if the update is successful, otherwise throws an error.
   */
  static async updateUserStatus(userId, newStatus) {
    try {
      const userDocRef = doc(db, "users", userId);
      await updateDoc(userDocRef, { status: newStatus });
      console.log(`Status updated to ${newStatus} for user ID: ${userId}`);
    } catch (error) {
      console.error(`Error updating status for user ID ${userId}:`, error);
      throw error;
    }
  }
}
