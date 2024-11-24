import { db } from "../firebase/firebase";
import { collection, onSnapshot, doc, getDoc } from "firebase/firestore";
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
  static async getActiveUserIncrementPercentage(callback) {
    const today = new Date().toISOString().split("T")[0];
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split("T")[0];
  
    try {
      console.log(`Fetching active users for ${yesterdayStr} and ${today}`);
  
      const todayDoc = await getDoc(doc(db, "dailySummaries", today));
      const yesterdayDoc = await getDoc(doc(db, "dailySummaries", yesterdayStr));
  
      const todayCount = todayDoc.exists() ? todayDoc.data().loginCount || 0 : 0;
      const yesterdayCount = yesterdayDoc.exists() ? yesterdayDoc.data().loginCount || 0 : 0;
  
      console.log("Today Count:", todayCount, "Yesterday Count:", yesterdayCount);
  
      let percentageIncrement;
      if (yesterdayCount === 0) {
        percentageIncrement = todayCount > 0 ? 100 : 0;
      } else {
        percentageIncrement = ((todayCount - yesterdayCount) / yesterdayCount) * 100;
      }
  
      console.log("Active User Increment:", percentageIncrement);
      callback(Number(percentageIncrement)); // Ensure the callback receives a number
    } catch (error) {
      console.error("Error calculating active user increment percentage:", error);
      callback(0); // Default to 0% on error
    }
  }
  
  static async getNewUserIncrementPercentage(callback) {
    const today = new Date().toISOString().split("T")[0];
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split("T")[0];
  
    try {
      console.log(`Fetching new users for ${yesterdayStr} and ${today}`);
  
      const todayDoc = await getDoc(doc(db, "dailySummaries", today));
      const yesterdayDoc = await getDoc(doc(db, "dailySummaries", yesterdayStr));
  
      const todaySignUpCount = todayDoc.exists() ? todayDoc.data().signUpCount || 0 : 0;
      const yesterdaySignUpCount = yesterdayDoc.exists() ? yesterdayDoc.data().signUpCount || 0 : 0;
  
      console.log("Today Sign-Up Count:", todaySignUpCount, "Yesterday Sign-Up Count:", yesterdaySignUpCount);
  
      let percentageIncrement;
      if (yesterdaySignUpCount === 0) {
        percentageIncrement = todaySignUpCount > 0 ? 100 : 0;
      } else {
        percentageIncrement = ((todaySignUpCount - yesterdaySignUpCount) / yesterdaySignUpCount) * 100;
      }
  
      console.log("New User Increment:", percentageIncrement);
      callback(Number(percentageIncrement)); // Ensure the callback receives a number
    } catch (error) {
      console.error("Error calculating new user increment percentage:", error);
      callback(0); // Default to 0% on error
    }
  }
  
  
}
