import React, { useState } from "react";
import {
  Box,
  Button,
  TextField,
  Typography,
  IconButton,
  useTheme,
} from "@mui/material";
import { tokens } from "../../theme";
import { LockOutlined as LockIcon } from "@mui/icons-material";
import Header from "../../components/Header";
import { useAuth } from "../../context/authContext";
import { useNavigate } from "react-router-dom"; // Import useNavigate for redirection

const Login = () => {
  const { login } = useAuth(); // Access login function from AuthContext
  const navigate = useNavigate(); // Initialize navigate for redirection
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSigningIn, setIsSigningIn] = useState(false);

  // Login handler function
  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setIsSigningIn(true);
    try {
      await login(email, password); // Attempt login using Firebase
      navigate("/dashboard"); // Redirect to dashboard on success
    } catch (err) {
      setError("Failed to sign in. Please check your email and password.");
      console.error(err);
    }
    setIsSigningIn(false);
  };

  return (
    <Box
      display="flex"
      alignItems="center"
      justifyContent="center"
      height="100vh"
      bgcolor={colors.primary[600]}
    >
      <Box
        p="40px"
        maxWidth="400px"
        width="100%"
        bgcolor={colors.primary[400]}
        borderRadius="10px"
        boxShadow="0px 4px 10px rgba(0, 0, 0, 0.1)"
      >
        <Box display="flex" flexDirection="column" alignItems="center" mb={3}>
          <IconButton
            sx={{
              backgroundColor: colors.blueAccent[600],
              color: colors.grey[100],
              mb: 2,
            }}
          >
            <LockIcon sx={{ fontSize: 40 }} />
          </IconButton>
          <Header title="Welcome Back" subtitle="Login to your account" />
        </Box>
        <TextField
          fullWidth
          label="Email"
          variant="outlined"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          sx={{ mb: 2 }}
          InputLabelProps={{ style: { color: colors.grey[100] } }}
          InputProps={{
            style: { color: colors.grey[100] },
          }}
        />
        <TextField
          fullWidth
          label="Password"
          variant="outlined"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          sx={{ mb: 2 }}
          InputLabelProps={{ style: { color: colors.grey[100] } }}
          InputProps={{
            style: { color: colors.grey[100] },
          }}
        />
        {error && (
          <Typography color="error" variant="body2" align="center" mb={2}>
            {error}
          </Typography>
        )}
        <Button
          fullWidth
          variant="contained"
          onClick={handleLogin}
          disabled={isSigningIn}
          sx={{
            backgroundColor: colors.greenAccent[500],
            color: colors.grey[100],
            fontWeight: "bold",
            py: "10px",
            mt: 2,
          }}
        >
          {isSigningIn ? "Logging in..." : "Login"}
        </Button>
        <Typography
          mt={2}
          textAlign="center"
          color={colors.grey[100]}
          fontSize="0.875rem"
        >
          Don’t have an account?{" "}
          <a href="/register" style={{ color: colors.blueAccent[500] }}>
            Sign Up
          </a>
        </Typography>
      </Box>
    </Box>
  );
};

export default Login;
