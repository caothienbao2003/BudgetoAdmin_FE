import React, { useState, useEffect } from "react";
import { Box, Typography, Avatar, Button, useTheme } from "@mui/material";
import { tokens } from "../../theme";
import { useAuth } from "../../context/authContext"; // Assuming you have a context for authentication
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../firebase/firebase";

const Profile = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const { currentUser, logout } = useAuth(); // Assuming useAuth provides the current user and logout function
  const [generalInfo, setGeneralInfo] = useState(null);

  useEffect(() => {
    const fetchGeneralInfo = async () => {
      if (currentUser) {
        try {
          // Reference to generalInfo document in the "info" subcollection of the user's document
          const docRef = doc(db, "users", currentUser.uid, "info", "generalInfo");
          const docSnap = await getDoc(docRef);

          if (docSnap.exists()) {
            setGeneralInfo(docSnap.data()); // Set generalInfo state with document data
          } else {
            console.error("No generalInfo document found");
          }
        } catch (error) {
          console.error("Error fetching generalInfo:", error);
        }
      }
    };

    fetchGeneralInfo();
  }, [currentUser]);

  const handleLogout = async () => {
    await logout();
    // Optionally, redirect after logout if needed
  };

  if (!generalInfo) return <Typography>Loading...</Typography>;

  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      height="100vh"
      bgcolor={colors.primary[600]}
      padding="40px"
    >
      <Box
        maxWidth="400px"
        width="100%"
        bgcolor={colors.primary[400]}
        borderRadius="10px"
        boxShadow="0px 4px 10px rgba(0, 0, 0, 0.1)"
        padding="20px"
        textAlign="center"
      >
        <Avatar
          alt={generalInfo.fullName || "User Avatar"}
          src={generalInfo.imgURL || ""}
          sx={{
            width: 100,
            height: 100,
            margin: "0 auto",
            bgcolor: colors.blueAccent[600],
          }}
        />
        <Typography variant="h5" sx={{ marginTop: "15px", color: colors.grey[100] }}>
          {generalInfo.fullName || "N/A"}
        </Typography>
        <Typography variant="body1" sx={{ color: colors.grey[100] }}>
          {generalInfo.email || "N/A"}
        </Typography>
        <Typography variant="body2" sx={{ color: colors.grey[100], marginTop: "10px" }}>
          Gender: {generalInfo.gender || "N/A"}
        </Typography>
        <Typography variant="body2" sx={{ color: colors.grey[100] }}>
          Phone: {generalInfo.phone || "N/A"}
        </Typography>
        <Typography variant="body2" sx={{ color: colors.grey[100] }}>
          Address: {generalInfo.address || "N/A"}
        </Typography>
        <Typography variant="body2" sx={{ color: colors.grey[100] }}>
          Occupation: {generalInfo.occupation || "N/A"}
        </Typography>
        <Typography variant="body2" sx={{ color: colors.grey[100] }}>
          Date of Birth: {generalInfo.dateOfBirth || "N/A"}
        </Typography>
        <Typography variant="body2" sx={{ color: colors.grey[100] }}>
          Facebook: {generalInfo.facebookLink || "N/A"}
        </Typography>
        <Typography variant="body2" sx={{ color: colors.grey[100] }}>
          Google: {generalInfo.googleLink || "N/A"}
        </Typography>
        <Button
          variant="contained"
          color="secondary"
          onClick={handleLogout}
          sx={{
            backgroundColor: colors.greenAccent[500],
            color: colors.grey[100],
            fontWeight: "bold",
            mt: "20px",
            width: "100%",
          }}
        >
          Logout
        </Button>
      </Box>
    </Box>
  );
};

export default Profile;
