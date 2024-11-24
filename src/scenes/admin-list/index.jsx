import React, { useState, useEffect } from "react";
import { Box, Button } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { tokens } from "../../theme";
import Header from "../../components/Header";
import { AdminRepository } from "../../repositories/AdminRepository";
import { useTheme } from "@mui/material/styles";

const AdminList = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [adminData, setAdminData] = useState([]);

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        // Fetch admin data
        const admins = await AdminRepository.getAllAdmins();
        setAdminData(admins);
      } catch (error) {
        console.error("Error fetching admin data:", error);
      }
    };

    fetchAdminData();
  }, []);

  const handleToggleStatus = async (adminId, currentStatus) => {
    try {
      const newStatus = currentStatus === "ACTIVE" ? "INACTIVE" : "ACTIVE";
      await AdminRepository.updateAdminStatus(adminId, newStatus); // Update status in Firestore

      // Update status locally for the UI
      setAdminData((prevData) =>
        prevData.map((admin) =>
          admin.id === adminId ? { ...admin, status: newStatus } : admin
        )
      );
    } catch (error) {
      console.error(`Failed to update status for admin ID ${adminId}:`, error);
    }
  };

  const columns = [
    { field: "id", headerName: "Admin ID", flex: 1 },
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
      field: "phoneNumber",
      headerName: "Phone Number",
      flex: 1,
    },
    {
      field: "gender",
      headerName: "Gender",
      flex: 1,
    },
    {
      field: "createdDate",
      headerName: "Created Date",
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
      <Header title="Admins" subtitle="Managing the Admins" />
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
        <DataGrid checkboxSelection rows={adminData} columns={columns} />
      </Box>
    </Box>
  );
};

export default AdminList;
