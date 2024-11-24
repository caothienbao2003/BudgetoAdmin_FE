import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  IconButton,
  Typography,
  useTheme,
  Select,
  MenuItem,
  Tooltip,
} from "@mui/material";
import { tokens } from "../../theme";
import { mockTransactions } from "../../data/mockData";
import DownloadOutlinedIcon from "@mui/icons-material/DownloadOutlined";
import MonetizationOnIcon from "@mui/icons-material/MonetizationOn";
import PeopleAltIcon from "@mui/icons-material/PeopleAlt";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import RadioButtonUncheckedIcon from "@mui/icons-material/RadioButtonUnchecked";
import Header from "../../components/Header";
import LineChart from "../../components/LineChart";
import GeographyChart from "../../components/GeographyChart";
import BarChart from "../../components/BarChart";
import StatBox from "../../components/StatBox";
import ProgressCircle from "../../components/ProgressCircle";
import { DailySummaryRepository } from "../../repositories/DailySummaryRepository";
import { AdminRepository } from "../../repositories/AdminRepository";
import { useAuth } from "../../context/authContext";

const Dashboard = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const [activeUsersCount, setActiveUsersCount] = useState(0);
  const [newUsersCount, setNewUsersCount] = useState(0);
  const [lineChartData, setLineChartData] = useState([]);
  const [filter, setFilter] = useState("week");

  // State variables for current period
  const [currentWeekStart, setCurrentWeekStart] = useState(
    getStartOfWeek(new Date())
  );
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth()); // 0 - 11
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());

  const [adminInfo, setAdminInfo] = useState(null);
  const { currentUser } = useAuth();

  useEffect(() => {
    const fetchAdminInfo = async () => {
      if (currentUser) {
        try {
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

  useEffect(() => {
    const unsubscribeToday = DailySummaryRepository.getTodaySummary(
      (todaySummary) => {
        setActiveUsersCount(todaySummary.loginCount);
        setNewUsersCount(todaySummary.signUpCount);
      }
    );

    return () => unsubscribeToday();
  }, []);

  useEffect(() => {
    const unsubscribe = DailySummaryRepository.onAllDailySummariesSnapshot(
      (summaries) => {
        // Filter summaries based on the selected filter and current period
        const filteredSummaries = filterDailySummaries(summaries);

        setLineChartData([
          {
            id: "Active Users",
            color: "hsl(217, 70%, 50%)",
            data: filteredSummaries.map((summary) => ({
              x: summary.label,
              y: summary.loginCount,
            })),
          },
          {
            id: "Offline Users",
            color: "hsl(0, 70%, 50%)",
            data: filteredSummaries.map((summary) => ({
              x: summary.label,
              y: summary.offlineCount - summary.loginCount,
            })),
          },
        ]);
      }
    );

    return () => unsubscribe();
  }, [filter, currentWeekStart, currentMonth, currentYear]);

  // Function to filter and process daily summaries based on the filter and current period
  const filterDailySummaries = (summaries) => {
    let dateLabels = [];
    let dateToLabelMap = {};
    let filteredSummaries = [];

    if (filter === "week") {
      const weekDates = getDatesForWeek(currentWeekStart);
      dateLabels = weekDates.map((date) => ({
        dateString: date.toISOString().split("T")[0],
        label: `${date.toLocaleDateString("en-US", { weekday: "short" })} (${date.getDate()})`,
      }));
    } else if (filter === "month") {
      const monthDates = getDatesForMonth(currentYear, currentMonth);
      dateLabels = monthDates.map((date) => ({
        dateString: date.toISOString().split("T")[0],
        label: date.getDate().toString(),
      }));
    } else if (filter === "year") {
      dateLabels = Array.from({ length: 12 }, (_, i) => ({
        month: i,
        label: new Date(currentYear, i).toLocaleString("en-US", { month: "short" }),
      }));
    }

    // Create a map for quick lookup
    dateToLabelMap = dateLabels.reduce((acc, item) => {
      if (filter === "year") {
        acc[item.month] = item.label;
      } else {
        acc[item.dateString] = item.label;
      }
      return acc;
    }, {});

    if (filter === "year") {
      // Sum data per month
      const monthlyData = {};
      for (let i = 0; i < 12; i++) {
        monthlyData[i] = { loginCount: 0, offlineCount: 0 };
      }

      summaries.forEach((summary) => {
        const date = new Date(summary.date);
        if (date.getFullYear() === currentYear) {
          const month = date.getMonth();
          monthlyData[month].loginCount += summary.loginCount;
          monthlyData[month].offlineCount += summary.offlineCount;
        }
      });

      // Create filtered summaries with labels
      filteredSummaries = Object.keys(monthlyData).map((month) => ({
        label: dateToLabelMap[month],
        loginCount: monthlyData[month].loginCount,
        offlineCount: monthlyData[month].offlineCount,
      }));
    } else {
      // Create a map of summaries for quick lookup
      const summaryMap = summaries.reduce((acc, summary) => {
        acc[summary.date] = summary;
        return acc;
      }, {});

      filteredSummaries = dateLabels.map((item) => {
        const summary = summaryMap[item.dateString];
        return {
          label: item.label,
          loginCount: summary ? summary.loginCount : 0,
          offlineCount: summary ? summary.offlineCount : 0,
        };
      });
    }

    return filteredSummaries;
  };

  // Helper functions
  function getStartOfWeek(date) {
    const day = date.getDay(); // 0 (Sun) to 6 (Sat)
    const diff = date.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
    return new Date(date.setDate(diff));
  }

  function getDatesForWeek(startDate) {
    const dates = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      dates.push(date);
    }
    return dates;
  }

  function getDatesForMonth(year, month) {
    const dates = [];
    const date = new Date(year, month, 1);
    while (date.getMonth() === month) {
      dates.push(new Date(date));
      date.setDate(date.getDate() + 1);
    }
    return dates;
  }

  // Handlers for arrow buttons
  const handlePreviousPeriod = () => {
    if (filter === "week") {
      setCurrentWeekStart((prevDate) => {
        const newDate = new Date(prevDate);
        newDate.setDate(prevDate.getDate() - 7);
        return newDate;
      });
    } else if (filter === "month") {
      setCurrentMonth((prevMonth) => {
        const newMonth = prevMonth - 1;
        if (newMonth < 0) {
          setCurrentYear((prevYear) => prevYear - 1);
          return 11; // December
        }
        return newMonth;
      });
    } else if (filter === "year") {
      setCurrentYear((prevYear) => prevYear - 1);
    }
  };

  const handleNextPeriod = () => {
    if (filter === "week") {
      setCurrentWeekStart((prevDate) => {
        const newDate = new Date(prevDate);
        newDate.setDate(prevDate.getDate() + 7);
        if (newDate > new Date()) {
          return prevDate;
        }
        return newDate;
      });
    } else if (filter === "month") {
      setCurrentMonth((prevMonth) => {
        const today = new Date();
        const newMonth = prevMonth + 1;
        const newYear = currentYear + (newMonth > 11 ? 1 : 0);
        const adjustedMonth = newMonth % 12;
        const newDate = new Date(newYear, adjustedMonth);
        if (newDate > today) {
          return prevMonth;
        }
        if (newMonth > 11) {
          setCurrentYear((prevYear) => prevYear + 1);
        }
        return adjustedMonth;
      });
    } else if (filter === "year") {
      const today = new Date();
      if (currentYear + 1 > today.getFullYear()) {
        return;
      }
      setCurrentYear((prevYear) => prevYear + 1);
    }
  };

  // Go to current period
  const handleCurrentPeriod = () => {
    if (filter === "week") {
      setCurrentWeekStart(getStartOfWeek(new Date()));
    } else if (filter === "month") {
      const today = new Date();
      setCurrentMonth(today.getMonth());
      setCurrentYear(today.getFullYear());
    } else if (filter === "year") {
      setCurrentYear(new Date().getFullYear());
    }
  };

  // Disable next button if current period
  const isNextDisabled = () => {
    const today = new Date();
    if (filter === "week") {
      const nextWeekStart = new Date(currentWeekStart);
      nextWeekStart.setDate(currentWeekStart.getDate() + 7);
      return nextWeekStart > today;
    } else if (filter === "month") {
      const nextMonth = currentMonth + 1;
      const nextYear = currentYear + (nextMonth > 11 ? 1 : 0);
      const adjustedMonth = nextMonth % 12;
      const nextDate = new Date(nextYear, adjustedMonth);
      return nextDate > today;
    } else if (filter === "year") {
      return currentYear + 1 > today.getFullYear();
    }
    return false;
  };

  // Display current period
  const getCurrentPeriodLabel = () => {
    if (filter === "week") {
      const endDate = new Date(currentWeekStart);
      endDate.setDate(currentWeekStart.getDate() + 6);
      return `${currentWeekStart.toLocaleDateString()} - ${endDate.toLocaleDateString()}`;
    } else if (filter === "month") {
      return new Date(currentYear, currentMonth).toLocaleString("en-US", {
        month: "long",
        year: "numeric",
      });
    } else if (filter === "year") {
      return currentYear.toString();
    }
  };

  // Handle filter change
  const handleFilterChange = (newFilter) => {
    setFilter(newFilter);
    // Reset period states when filter changes
    if (newFilter === "week") {
      setCurrentWeekStart(getStartOfWeek(new Date()));
    } else if (newFilter === "month") {
      const today = new Date();
      setCurrentMonth(today.getMonth());
      setCurrentYear(today.getFullYear());
    } else if (newFilter === "year") {
      setCurrentYear(new Date().getFullYear());
    }
  };

  const [activeUsersIncrease, setActiveUsersIncrease] = useState("0%");
  // State for New Users
  const [newUsersIncrease, setNewUsersIncrease] = useState("0%");

  useEffect(() => {
    // Fetch data for Active Users
    DailySummaryRepository.getTodaySummary((summary) => setActiveUsersCount(summary.loginCount));
    DailySummaryRepository.getActiveUserIncrementPercentage((percentage) =>
      setActiveUsersIncrease(`${percentage > 0 ? "+" : ""}${percentage.toFixed(1)}%`)
    );
  
    // Fetch data for New Users
    DailySummaryRepository.getTodaySummary((summary) => setNewUsersCount(summary.signUpCount));
    DailySummaryRepository.getNewUserIncrementPercentage((percentage) =>
      setNewUsersIncrease(`${percentage > 0 ? "+" : ""}${percentage.toFixed(1)}%`)
    );
  }, []);

  return (
    <Box m="20px">
      {/* HEADER */}
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Header
          title={`Hello ${adminInfo ? adminInfo.fullName : ""}`}
          subtitle="Welcome to your dashboard"
        />

        <Box display="flex" alignItems="center">
          {/* Existing Download Reports Button */}
          <Button
            sx={{
              backgroundColor: colors.blueAccent[700],
              color: colors.grey[100],
              fontSize: "14px",
              fontWeight: "bold",
              padding: "10px 20px",
            }}
          >
            <DownloadOutlinedIcon sx={{ mr: "10px" }} />
            Download Reports
          </Button>
        </Box>
      </Box>

      {/* GRID & CHARTS */}
      <Box
        display="grid"
        gridTemplateColumns="repeat(16, 1fr)"
        gridAutoRows="140px"
        gap="20px"
      >
        {/* ROW 1 */}
        <Box
          gridColumn="span 4"
          backgroundColor={colors.primary[400]}
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          <StatBox
            title="1,332,001 VND"
            subtitle="Total revenue"
            progress="0"
            increase="+0%"
            icon={
              <MonetizationOnIcon
                sx={{ color: colors.greenAccent[600], fontSize: "26px" }}
              />
            }
          />
        </Box>
        <Box
          gridColumn="span 4"
          backgroundColor={colors.primary[400]}
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          <StatBox
            title="0 VND"
            subtitle="Today's revenue"
            progress="0"
            increase="+0%"
            icon={
              <MonetizationOnIcon
                sx={{ color: colors.greenAccent[600], fontSize: "26px" }}
              />
            }
          />
        </Box>
        <Box
          gridColumn="span 4"
          backgroundColor={colors.primary[400]}
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          <StatBox
            title={activeUsersCount}
            subtitle="Today's active users"
            progress={(() => {
              if (!activeUsersIncrease) return 0; // Default to 0 if no value
          
              const parsedIncrease = parseFloat(activeUsersIncrease); // Convert string to number
              if (isNaN(parsedIncrease)) return 0; // Fallback if parsing fails
          
              if (parsedIncrease < 0) {
                // Invert negative value on a 100% scale
                return Math.min(Math.max(1 - Math.abs(parsedIncrease) / 100, 0), 1);
              }
          
              // Use as-is for positive values
              return Math.min(Math.max(parsedIncrease / 100, 0), 1);
            })()}
            increase={activeUsersIncrease}
            icon={
              <PeopleAltIcon
                sx={{ color: colors.greenAccent[600], fontSize: "26px" }}
              />
            }
          />
        </Box>
        <Box
          gridColumn="span 4"
          backgroundColor={colors.primary[400]}
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          <StatBox
            title={newUsersCount}
            subtitle="Today's New Users"
            progress={(() => {
              if (!newUsersIncrease) return 0; // Default to 0 if no value
          
              const parsedIncrease = parseFloat(newUsersIncrease); // Convert string to number
              if (isNaN(parsedIncrease)) return 0; // Fallback if parsing fails
          
              if (parsedIncrease < 0) {
                // Invert negative value on a 100% scale
                return Math.min(Math.max(1 - Math.abs(parsedIncrease) / 100, 0), 1);
              }
          
              // Use as-is for positive values
              return Math.min(Math.max(parsedIncrease / 100, 0), 1);
            })()}
            increase={newUsersIncrease}
            icon={
              <PersonAddIcon
                sx={{ color: colors.greenAccent[600], fontSize: "26px" }}
              />
            }
          />
        </Box>

        {/* ROW 2 */}
        <Box
          gridColumn="span 8"
          gridRow="span 2"
          backgroundColor={colors.primary[400]}
        >
          <Box
            mt="25px"
            p="0 30px"
            display="flex"
            justifyContent="space-between"
            alignItems="center"
          >
            {/* Title */}
            <Box>
              <Typography variant="h5" fontWeight="600" color={colors.grey[100]}>
                Daily Active Users
              </Typography>
              <Typography variant="subtitle1" color={colors.grey[100]}>
                {getCurrentPeriodLabel()}
              </Typography>
            </Box>

            {/* Controls: Filter Dropdown and Arrow Buttons */}
            <Box display="flex" alignItems="center" gap="10px">
              {/* Filter Dropdown */}
              <Select
                value={filter}
                onChange={(e) => handleFilterChange(e.target.value)}
                sx={{
                  backgroundColor: colors.primary[400],
                  color: colors.grey[100],
                  minWidth: "120px",
                  height: "40px",
                  border: `1px solid ${colors.grey[300]}`,
                  borderRadius: "4px",
                }}
              >
                <MenuItem value="week">Week</MenuItem>
                <MenuItem value="month">Month</MenuItem>
                <MenuItem value="year">Year</MenuItem>
              </Select>

              {/* Arrow Buttons */}
              <IconButton onClick={handlePreviousPeriod}>
                <ArrowBackIosIcon sx={{ color: colors.grey[100] }} />
              </IconButton>

              {/* Current Period Button */}
              <Tooltip title="Go to Current Period">
                <IconButton onClick={handleCurrentPeriod}>
                  <RadioButtonUncheckedIcon sx={{ color: colors.grey[100] }} />
                </IconButton>
              </Tooltip>

              <IconButton
                onClick={handleNextPeriod}
                disabled={isNextDisabled()}
                sx={{
                  color: isNextDisabled() ? colors.grey[500] : colors.grey[100],
                }}
              >
                <ArrowForwardIosIcon />
              </IconButton>
            </Box>
          </Box>

          {/* Line Chart */}
          <Box height="250px" m="-20px 0 0 0">
            <LineChart data={lineChartData} isDashboard={true} />
          </Box>
        </Box>

        {/* Recent Transactions */}
        <Box
          gridColumn="span 8"
          gridRow="span 2"
          backgroundColor={colors.primary[400]}
          overflow="auto"
        >
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            borderBottom={`4px solid ${colors.primary[500]}`}
            color={colors.grey[100]}
            p="15px"
          >
            <Typography color={colors.grey[100]} variant="h5" fontWeight="600">
              Recent Transactions
            </Typography>
          </Box>
          {mockTransactions.map((transaction, i) => (
            <Box
              key={`${transaction.txId}-${i}`}
              display="flex"
              justifyContent="space-between"
              alignItems="center"
              borderBottom={`4px solid ${colors.primary[500]}`}
              p="15px"
            >
              <Box>
                <Typography
                  color={colors.greenAccent[500]}
                  variant="h5"
                  fontWeight="600"
                >
                  {transaction.txId}
                </Typography>
                <Typography color={colors.grey[100]}>
                  {transaction.user}
                </Typography>
              </Box>
              <Box color={colors.grey[100]}>{transaction.date}</Box>
              <Box
                backgroundColor={colors.greenAccent[800]}
                p="5px 10px"
                borderRadius="4px"
              >
                {transaction.cost} VND
              </Box>
            </Box>
          ))}
        </Box>

        {/* ROW 3
        <Box
          gridColumn="span 4"
          gridRow="span 2"
          backgroundColor={colors.primary[400]}
          p="30px"
        >
          <Typography variant="h5" fontWeight="600">
            Campaign
          </Typography>
          <Box
            display="flex"
            flexDirection="column"
            alignItems="center"
            mt="25px"
          >
            <ProgressCircle size="125" />
            <Typography
              variant="h5"
              color={colors.greenAccent[500]}
              sx={{ mt: "15px" }}
            >
              $48,352 revenue generated
            </Typography>
            <Typography>Includes extra misc expenditures and costs</Typography>
          </Box>
        </Box>
        <Box
          gridColumn="span 4"
          gridRow="span 2"
          backgroundColor={colors.primary[400]}
        >
          <Typography
            variant="h5"
            fontWeight="600"
            sx={{ padding: "30px 30px 0 30px" }}
          >
            Sales Quantity
          </Typography>
          <Box height="250px" mt="-20px">
            <BarChart isDashboard={true} />
          </Box>
        </Box>
        <Box
          gridColumn="span 4"
          gridRow="span 2"
          backgroundColor={colors.primary[400]}
          padding="30px"
        >
          <Typography
            variant="h5"
            fontWeight="600"
            sx={{ marginBottom: "15px" }}
          >
            Geography Based Traffic
          </Typography>
          <Box height="200px">
            <GeographyChart isDashboard={true} />
          </Box>
        </Box> */}
      </Box>
    </Box>
  );
};

export default Dashboard;
