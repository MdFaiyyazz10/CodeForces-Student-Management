import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import {
  Box,
  Typography,
  ToggleButton,
  ToggleButtonGroup,
  Paper,
  CircularProgress,
} from "@mui/material";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Label,
} from "recharts";
import CalendarHeatmap from "react-calendar-heatmap";
import "react-calendar-heatmap/dist/styles.css";
import { subDays, parseISO, isAfter, format } from "date-fns";
import axios from "axios";
import { backendUrl } from "../App";
import { useTheme } from "@mui/material/styles"; 

const StudentProfile = () => {
  const { id } = useParams();
  const theme = useTheme(); 
  const [studentData, setStudentData] = useState(null);
  const [contestRange, setContestRange] = useState("90");
  const [problemRange, setProblemRange] = useState("90");

  const handleContestRange = (_, newVal) => newVal && setContestRange(newVal);
  const handleProblemRange = (_, newVal) => newVal && setProblemRange(newVal);

  useEffect(() => {
    const fetchStudent = async () => {
      try {
        const res = await axios.post(`${backendUrl}/student/sync/${id}`);
        setStudentData(res.data.student);
      } catch (err) {
        console.error("Failed to fetch student", err);
      }
    };
    fetchStudent();
  }, [id]);

  if (!studentData) {
    return (
      <Box
        sx={{
          height: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <CircularProgress size={60} thickness={4.5} color="primary" />
      </Box>
    );
  }

  const today = new Date();
  const contestStartDate = subDays(today, Number(contestRange));
  const problemStats =
    studentData.cfStats.problemStatsByDays?.[`d${problemRange}`] || {};
  const {
    totalSolved,
    avgRating,
    avgProblemsPerDay,
    ratingBuckets,
    mostDifficultProblem,
  } = problemStats;

  const contestChartData = studentData.cfStats.contestHistory
    .filter((c) => isAfter(parseISO(c.contestDate), contestStartDate))
    .map((c) => ({
      name: c.contestName,
      rating: c.newRating,
      change: c.ratingChange,
      date: format(parseISO(c.contestDate), "MMM d"),
    }));

  const filteredBucketData = Object.entries(ratingBuckets || {})
    .sort(([a], [b]) => Number(a) - Number(b))
    .map(([rating, count]) => ({ rating, count }));

  const heatmapStartDate = subDays(today, 90);

  return (
    <Box
      sx={{
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        bgcolor: "background.default",
        color: "text.primary",
      }}
    >
      {/* Top Info */}
      <Box
        sx={{
          height: "15vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          p: 2,
          bgcolor:
            theme.palette.mode === "dark" ? "background.paper" : "#e3f2fd",
        }}
      >
        <Paper
          elevation={4}
          sx={{
            px: 4,
            py: 2,
            borderRadius: 3,
            display: "flex",
            gap: 4,
            flexWrap: "wrap",
            bgcolor: "background.default",
            color: "text.primary",
          }}
        >
          <Typography variant="body1">
            <strong>Name:</strong> {studentData.name}
          </Typography>
          <Typography variant="body1">
            <strong>Email:</strong> {studentData.email}
          </Typography>
          <Typography variant="body1">
            <strong>Current Rating:</strong> {studentData.currentRating}
          </Typography>
          <Typography variant="body1">
            <strong>CF Handle:</strong> {studentData.codeforcesHandle}
          </Typography>
        </Paper>
      </Box>

      {/* Middle Charts */}
      <Box sx={{ height: "45vh", display: "flex", gap: 2, px: 2 }}>
        {/* Contest History */}
        <Paper
          elevation={3}
          sx={{ flex: 1, p: 2, display: "flex", flexDirection: "column" }}
        >
          <Typography variant="h6" mb={1}>
            Contest History
          </Typography>
          <ToggleButtonGroup
            value={contestRange}
            exclusive
            onChange={handleContestRange}
            sx={{ mb: 1, flexWrap: "wrap" }}
          >
            <ToggleButton value="30">30 Days</ToggleButton>
            <ToggleButton value="90">90 Days</ToggleButton>
            <ToggleButton value="365">365 Days</ToggleButton>
          </ToggleButtonGroup>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={contestChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 12 }}
                angle={-45}
                textAnchor="end"
              />
              <YAxis>
                <Label
                  angle={-90}
                  position="insideLeft"
                  style={{ textAnchor: "middle" }}
                >
                  Rating
                </Label>
              </YAxis>
              <Tooltip />
              <Line type="monotone" dataKey="rating" stroke="#1976d2" />
            </LineChart>
          </ResponsiveContainer>
        </Paper>

        {/* Problem Solving */}
        <Paper
          elevation={3}
          sx={{ flex: 1, p: 2, display: "flex", flexDirection: "column" }}
        >
          <Typography variant="h6" mb={1}>
            Problem Solving
          </Typography>
          <ToggleButtonGroup
            value={problemRange}
            exclusive
            onChange={handleProblemRange}
            sx={{ mb: 1, flexWrap: "wrap" }}
          >
            <ToggleButton value="7">7 Days</ToggleButton>
            <ToggleButton value="30">30 Days</ToggleButton>
            <ToggleButton value="90">90 Days</ToggleButton>
          </ToggleButtonGroup>
          <Box mb={1}>
            <Typography>
              Total Solved: <strong>{totalSolved || 0}</strong>
            </Typography>
            <Typography>
              Avg Rating: <strong>{avgRating || 0}</strong>
            </Typography>
            <Typography>
              Problems/Day: <strong>{avgProblemsPerDay || 0}</strong>
            </Typography>
            {mostDifficultProblem && (
              <Typography>
                Hardest Problem: <strong>{mostDifficultProblem.name}</strong> (
                {mostDifficultProblem.rating})
              </Typography>
            )}
          </Box>
          <ResponsiveContainer width="100%" height={150}>
            <BarChart data={filteredBucketData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="rating" />
              <YAxis>
                <Label
                  angle={-90}
                  position="insideLeft"
                  style={{ textAnchor: "middle" }}
                >
                  Problems Solved
                </Label>
              </YAxis>
              <Tooltip />
              <Bar dataKey="count" fill="#00bcd4" />
            </BarChart>
          </ResponsiveContainer>
        </Paper>
      </Box>

      {/* Heatmap Bottom */}
      <Box sx={{ height: "40vh", px: 2, py: 1, overflow: "hidden" }}>
        <Paper elevation={3} sx={{ height: "100%", p: 2, overflow: "auto" }}>
          <Typography variant="h6" gutterBottom>
            Submission Heatmap (Last 90 Days)
          </Typography>
          <Box
            sx={{
              width: "100%",
              maxWidth: "100%",
              overflowX: "auto",
              display: "flex",
              justifyContent: "center",
            }}
          >
            <Box sx={{ minWidth: 700 }}>
              <CalendarHeatmap
                startDate={heatmapStartDate}
                endDate={today}
                values={studentData.cfStats.heatmap || []}
                classForValue={(value) => {
                  if (!value || value.count === 0) return "color-empty";
                  if (value.count >= 5) return "color-scale-4";
                  if (value.count >= 3) return "color-scale-3";
                  if (value.count >= 2) return "color-scale-2";
                  return "color-scale-1";
                }}
                tooltipDataAttrs={(value) => ({
                  "data-tip": `${format(
                    new Date(value.date),
                    "MMM d, yyyy"
                  )}: ${value.count || 0} submission(s)`,
                })}
                showWeekdayLabels
              />
            </Box>
          </Box>
        </Paper>
      </Box>
    </Box>
  );
};

export default StudentProfile;
