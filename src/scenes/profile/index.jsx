import React, { useState, useEffect } from "react";
import { Box, Typography, Avatar, Button, useTheme } from "@mui/material";
import { tokens } from "../../theme";
import { useAuth } from "../../context/authContext";
import { AdminRepository } from "../../repositories/AdminRepository";

const Profile = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const { currentUser, logout } = useAuth();
  const [adminInfo, setAdminInfo] = useState(null);

  useEffect(() => {
    const fetchAdminInfo = async () => {
      if (currentUser) {
        try {
          // Use AdminRepository to fetch admin info directly
          const adminData = await AdminRepository.getAdminById(currentUser.uid);
          if (adminData) {
            setAdminInfo(adminData);
          } else {
            console.error("Admin document not found");
          }
        } catch (error) {
          console.error("Error fetching admin info:", error);
        }
      }
    };

    fetchAdminInfo();
  }, [currentUser]);

  const handleLogout = async () => {
    await logout();
    // Optionally, redirect after logout if needed
  };

  if (!adminInfo) return <Typography>Loading...</Typography>;

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
          alt={adminInfo.fullName || "Admin Avatar"}
          sx={{
            width: 100,
            height: 100,
            margin: "0 auto",
            bgcolor: colors.blueAccent[600],
          }}
        >
          {adminInfo.fullName ? adminInfo.fullName.charAt(0) : "A"}
        </Avatar>
        <Typography variant="h5" sx={{ marginTop: "15px", color: colors.grey[100] }}>
          {adminInfo.fullName || "N/A"}
        </Typography>
        <Typography variant="body1" sx={{ color: colors.grey[100] }}>
          {adminInfo.email || "N/A"}
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
