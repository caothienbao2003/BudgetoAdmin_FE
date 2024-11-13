import { db } from "../firebase/firebase";
import { collection, onSnapshot, doc } from "firebase/firestore";
import { DailySummary } from "../models/DailySummary";

export class DailySummaryRepository {
  // Get real-time daily summary data for today
  static getTodaySummary(callback) {
    const today = new Date().toISOString().split("T")[0];
    const docRef = doc(db, "dailySummaries", today);

    return onSnapshot(
      docRef,
      (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          callback(
            new DailySummary(
              today,
              data.loginCount || 0,
              data.signUpCount || 0,
              data.offlineCount || 0
            )
          );
        } else {
          callback(new DailySummary(today, 0, 0, 0));
        }
      },
      (error) => {
        console.error("Error fetching today's summary:", error);
        callback(new DailySummary(today, 0, 0, 0)); // Fallback in case of error
      }
    );
  }

  // Set up a real-time listener for all daily summaries for historical data
  static onAllDailySummariesSnapshot(callback) {
    const dailySummariesCollection = collection(db, "dailySummaries");

    return onSnapshot(
      dailySummariesCollection,
      (snapshot) => {
        const summaries = snapshot.docs.map((doc) => {
          const data = doc.data();
          return new DailySummary(
            doc.id,
            data.loginCount || 0,
            data.signUpCount || 0,
            data.offlineCount || 0
          );
        });
        callback(summaries);
      },
      (error) => {
        console.error("Error fetching all daily summaries in real-time:", error);
        callback([]); // Provide an empty array on error
      }
    );
  }
}
