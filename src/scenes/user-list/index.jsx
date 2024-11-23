import React, { useState, useEffect } from "react";
import { Box, Button } from "@mui/material"; // Ensure Button is imported here
import { DataGrid } from "@mui/x-data-grid";
import { tokens } from "../../theme";
import Header from "../../components/Header";
import { UserGeneralInfoRepository } from "../../repositories/UserGeneralInfoRepository";
import { UserRepository } from "../../repositories/UserRepository";
import { useTheme } from "@mui/material/styles";


const Team = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [teamData, setTeamData] = useState([]);

  useEffect(() => {
    const fetchTeamData = async () => {
      try {
        // Fetch user general info
        const userGeneralInfo = await UserGeneralInfoRepository.getAllUsers();

        // Fetch status for each user from the "users" collection
        const enrichedUsers = await Promise.all(
          userGeneralInfo.map(async (user) => {
            const userId = user.id;
            let status = "INACTIVE"; // Default value for status

            try {
              const userDoc = await UserRepository.getUserById(userId);
              if (userDoc && userDoc.status) {
                status = userDoc.status; // Fetch the status field
              }
            } catch (error) {
              console.error(`Error fetching status for user ID ${userId}:`, error);
            }

            return {
              ...user,
              status, // Add the status field to the user object
            };
          })
        );

        setTeamData(enrichedUsers);
      } catch (error) {
        console.error("Error fetching team data:", error);
      }
    };

    fetchTeamData();
  }, []);

  const handleToggleStatus = async (userId, currentStatus) => {
    try {
      const newStatus = currentStatus === "ACTIVE" ? "INACTIVE" : "ACTIVE";
      await UserRepository.updateUserStatus(userId, newStatus); // Update the status in Firestore

      // Update the status locally for the UI
      setTeamData((prevData) =>
        prevData.map((user) =>
          user.id === userId ? { ...user, status: newStatus } : user
        )
      );
    } catch (error) {
      console.error(`Failed to update status for user ID ${userId}:`, error);
    }
  };

  const columns = [
    { field: "id", headerName: "User ID", flex: 1 },
    {
      field: "fullName",
      headerName: "Full Name",
      flex: 1,
    },
    {
      field: "email",
      headerName: "Email",
      flex: 1,
    },
    {
      field: "phone",
      headerName: "Phone Number",
      flex: 1,
    },
    {
      field: "address",
      headerName: "Address",
      flex: 1,
    },
    {
      field: "occupation",
      headerName: "Occupation",
      flex: 1,
    },
    {
      field: "gender",
      headerName: "Gender",
      flex: 1,
    },
    {
      field: "status",
      headerName: "Status",
      flex: 1,
      renderCell: ({ row }) => {
        const isActive = row.status === "ACTIVE";
        const buttonColor = isActive
          ? colors.greenAccent[600]
          : colors.redAccent[600];

        return (
          <Button
            variant="contained"
            onClick={() => handleToggleStatus(row.id, row.status)}
            style={{
              backgroundColor: buttonColor,
              color: "white",
            }}
          >
            {row.status}
          </Button>
        );
      },
    },
  ];

  return (
    <Box m="20px">
      <Header title="Users" subtitle="Managing the Users" />
      <Box
        m="40px 0 0 0"
        height="75vh"
        sx={{
          "& .MuiDataGrid-root": {
            border: "none",
          },
          "& .MuiDataGrid-cell": {
            borderBottom: "none",
          },
          "& .MuiDataGrid-columnHeaders": {
            backgroundColor: colors.blueAccent[700],
            borderBottom: "none",
          },
          "& .MuiDataGrid-virtualScroller": {
            backgroundColor: colors.primary[400],
          },
          "& .MuiDataGrid-footerContainer": {
            borderTop: "none",
            backgroundColor: colors.blueAccent[700],
          },
          "& .MuiCheckbox-root": {
            color: `${colors.greenAccent[200]} !important`,
          },
        }}
      >
        <DataGrid checkboxSelection rows={teamData} columns={columns} />
      </Box>
    </Box>
  );
};

export default Team;
