import React, { useState, useEffect } from "react";
import { Box, Typography, useTheme } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { tokens } from "../../theme";
import { db } from "../../firebase/firebase"; // Import Firestore setup
import { collection, doc, getDocs, getDoc } from "firebase/firestore";
import AdminPanelSettingsOutlinedIcon from "@mui/icons-material/AdminPanelSettingsOutlined";
import LockOpenOutlinedIcon from "@mui/icons-material/LockOpenOutlined";
import SecurityOutlinedIcon from "@mui/icons-material/SecurityOutlined";
import Header from "../../components/Header";

const Team = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [teamData, setTeamData] = useState([]);

  useEffect(() => {
    const fetchTeamData = async () => {
      try {
        const adminCollection = collection(db, "users");
        const adminSnapshot = await getDocs(adminCollection);

        const teamDataPromises = adminSnapshot.docs.map(async (userDoc) => {
          const generalInfoRef = doc(db, "users", userDoc.id, "info", "generalInfo");
          const generalInfoSnapshot = await getDoc(generalInfoRef);
          if (generalInfoSnapshot.exists()) {
            return {
              id: userDoc.id,
              ...generalInfoSnapshot.data(), // Fetch all fields including address
            };
          } else {
            return null; // Skip if no generalInfo document exists
          }
        });

        const teamData = (await Promise.all(teamDataPromises)).filter(Boolean);
        setTeamData(teamData);
      } catch (error) {
        console.error("Error fetching team data:", error);
      }
    };

    fetchTeamData();
  }, []);

  const columns = [
    { field: "id", headerName: "User ID", flex: 1 },
    {
      field: "fullName",
      headerName: "Full Name",
      flex: 1,
      cellClassName: "name-column--cell",
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
      field: "address", // Include address field
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
    // {
    //   field: "accessLevel",
    //   headerName: "Access Level",
    //   flex: 1,
    //   renderCell: ({ row: { accessLevel } }) => {
    //     return (
    //       <Box
    //         width="60%"
    //         m="0 auto"
    //         p="5px"
    //         display="flex"
    //         justifyContent="center"
    //         backgroundColor={
    //           accessLevel === "admin"
    //             ? colors.greenAccent[600]
    //             : accessLevel === "manager"
    //             ? colors.greenAccent[700]
    //             : colors.greenAccent[700]
    //         }
    //         borderRadius="4px"
    //       >
    //         {accessLevel === "admin" && <AdminPanelSettingsOutlinedIcon />}
    //         {accessLevel === "manager" && <SecurityOutlinedIcon />}
    //         {accessLevel === "user" && <LockOpenOutlinedIcon />}
    //         <Typography color={colors.grey[100]} sx={{ ml: "5px" }}>
    //           {accessLevel}
    //         </Typography>
    //       </Box>
    //     );
    //   },
    // },
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
          "& .name-column--cell": {
            color: colors.greenAccent[300],
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
