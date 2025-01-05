import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Home from './components/HomePage/Home';
import Login from './components/LoginAndRegister/Login';
import Register from './components/LoginAndRegister/Register';
import Navbar from './components/Navbar/Navbar';
import { SnackbarProvider } from "notistack"; // Import SnackbarProvider
import PageNotFound from './components/PageNotFound';
import AddEmployee from './components/AddEmployee/AddEmployeeForm';
import Coursetable from './components/CourseAssignTable/Coursetable1';
import TrainingAttendance from './components/TrainingAttendance/TrainingReport';
import TrainingTable from './components/TrainingTable/TrainingTable';
import TrainingCalendar from './components/TrainingCalendar/TrainingCalendar';
import { useAuth } from './store/auth'; // Import useAuth for authentication
import './App.css';

function App() {
  const { isLoggedIn } = useAuth(); // Get authentication state

    return (
      <SnackbarProvider maxSnack={3}> {/* Configuring the maximum number of visible snackbars */}

      <BrowserRouter>
        <Navbar />
        <Routes>
          {/* Show Login as default for "/" */}
          <Route path="/" element={!isLoggedIn ? <Login /> : <Navigate to="/home" />} />
          <Route path="/register" element={<Register />} />
          <Route path="/home" element={isLoggedIn ? <Home /> : <Navigate to="/" />} />
          <Route path="/add-employee" element={isLoggedIn ? <AddEmployee /> : <Navigate to="/" />} />
          <Route path="/coursetable/:categoryId" element={isLoggedIn ? <Coursetable /> : <Navigate to="/" />} />
          <Route path="/training-calendar" element={isLoggedIn ? <TrainingCalendar /> : <Navigate to="/" />} />
          <Route path="/training-attendance" element={isLoggedIn ? <TrainingAttendance /> : <Navigate to="/" />} />
          <Route path="/training-evaluation" element={isLoggedIn ? <TrainingTable /> : <Navigate to="/" />} />
          <Route path="*" element={<PageNotFound />} />
        </Routes>
      </BrowserRouter>
      </SnackbarProvider>

    );
  }
  
  export default App;
  
