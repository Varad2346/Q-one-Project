import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Home from './components/HomePage/Home';
import Login from './components/LoginAndRegister/Login';
import Register from './components/LoginAndRegister/Register';
import Navbar from './components/Navbar/Navbar';
import PageNotFound from './components/PageNotFound';
import AddEmployee from './components/AddEmployee/AddEmployeeForm';
import Coursetable from './components/CourseAssignTable/Coursetable1';
import TrainingAttendance from './components/TrainingAttendance/TrainingReport1';
import TrainingTable from './components/TrainingTable/TrainingTable';
import TrainingCalendar from './components/TrainingCalendar/TrainingCalendar';
import { useAuth } from './store/auth'; // Import useAuth for authentication
import './App.css';

function App() {
  const { isLoggedIn } = useAuth(); // Get authentication state

  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        {/* Redirect to Home if logged in, otherwise show Login */}
        <Route path="/" element={isLoggedIn ? <Navigate to="/home" /> : <Login />} />
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
  );
}

export default App;
