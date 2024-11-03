import React, { useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Topbar from "./scenes/global/Topbar";
import Sidebar from "./scenes/global/Sidebar";
import Dashboard from "./scenes/dashboard";
import Team from "./scenes/team";
import Invoices from "./scenes/invoices";
import Contacts from "./scenes/contacts";
import Bar from "./scenes/bar";
import Form from "./scenes/form";
import Line from "./scenes/line";
import Pie from "./scenes/pie";
import FAQ from "./scenes/faq";
import Geography from "./scenes/geography";
import Calendar from "./scenes/calendar/calendar";
import Login from "./scenes/login/index";
import Profile from "./scenes/profile"; // Import Profile component
import { CssBaseline, ThemeProvider } from "@mui/material";
import { ColorModeContext, useMode } from "./theme";
import { useAuth } from "./context/authContext";

function App() {
  const [theme, colorMode] = useMode();
  const [isSidebar, setIsSidebar] = useState(true);
  const { userLoggedIn, loading } = useAuth(); // Access loading and userLoggedIn from context

  console.log("App component rendered:");
  console.log("User logged in:", userLoggedIn);
  console.log("Loading state:", loading);

  // Show loading screen or spinner while loading
  if (loading) {
    return <div>Loading...</div>; // Render a spinner or loading message here
  }

  return (
    <ColorModeContext.Provider value={colorMode}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <div className="app">
          {userLoggedIn && <Sidebar isSidebar={isSidebar} />}
          <main className="content">
            {userLoggedIn && <Topbar setIsSidebar={setIsSidebar} />}
            <Routes>
              {/* Default route */}
              <Route
                path="/"
                element={
                  userLoggedIn ? <Navigate to="/dashboard" /> : <Login />
                }
              />
              {/* Protected routes */}
              {userLoggedIn ? (
                <>
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/team" element={<Team />} />
                  <Route path="/contacts" element={<Contacts />} />
                  <Route path="/invoices" element={<Invoices />} />
                  <Route path="/form" element={<Form />} />
                  <Route path="/bar" element={<Bar />} />
                  <Route path="/pie" element={<Pie />} />
                  <Route path="/line" element={<Line />} />
                  <Route path="/faq" element={<FAQ />} />
                  <Route path="/calendar" element={<Calendar />} />
                  <Route path="/geography" element={<Geography />} />
                  <Route path="/profile" element={<Profile />} /> {/* Profile route */}
                </>
              ) : (
                <Route path="*" element={<Navigate to="/" />} />
              )}
            </Routes>
          </main>
        </div>
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
}

export default App;
