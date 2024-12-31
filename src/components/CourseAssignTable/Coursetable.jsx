import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import "./tables.css";
import Select from "react-select";

const CourseTable = () => {
  const { categoryId } = useParams();
  const [employees, setEmployees] = useState([]);
  const [trainers, setTrainers] = useState([]);  // State for storing trainer options
  const [courses, setCourses] = useState([]);
  const [selectedEmployees, setSelectedEmployees] = useState([]);
  const [selectedCourses, setSelectedCourses] = useState([]);
  const [selectedDurations, setSelectedDurations] = useState({});
  const [selectedMonths, setSelectedMonths] = useState({});
  const [planDates, setPlanDates] = useState({});
  const [formError, setFormError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newCourseName, setNewCourseName] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newDuration, setNewDuration] = useState('');
  const [selectedTrainer, setSelectedTrainer] = useState(null);  // New state for selected trainer
  const [newPlanDate, setNewPlanDate] = useState(''); // New field for plan date

  const durations = ["1 to 2 hrs", "2 to 4 hrs", "4 to 6 hrs", "more than 6 hours"];
  const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  const monthMapping = {
    January: 1,
    February: 2,
    March: 3,
    April: 4,
    May: 5,
    June: 6,
    July: 7,
    August: 8,
    September: 9,
    October: 10,
    November: 11,
    December: 12,
  };

  useEffect(() => {
    const fetchUsers = async () => {
      const token = localStorage.getItem('token');
      try {
        const response = await fetch('http://localhost:3000/api/users', {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        if (!response.ok) throw new Error(`Failed to fetch users: ${response.statusText}`);
        const data = await response.json();
        
        // Filter employees and trainers separately
        const employeeOptions = data.filter(emp => emp.role.toLowerCase() === 'employee').map(emp => ({
          value: emp.userId,
          label: `${emp.firstName} ${emp.lastName}`,
        }));
        
        const trainerOptions = data.filter(emp => emp.role.toLowerCase() === 'trainer').map(emp => ({
          value: emp.userId,
          label: `${emp.firstName} ${emp.lastName}`,
        }));

        setEmployees(employeeOptions);
        setTrainers(trainerOptions); // Save trainers separately
      } catch (error) {
        console.error("Error fetching users:", error);
        setFormError("Failed to fetch user data.");
      }
    };

    const fetchCourses = async () => {
      const token = localStorage.getItem('token');
      try {
        const response = await fetch(`http://localhost:3000/api/courses/${categoryId}`, {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        if (!response.ok) throw new Error(`Failed to fetch courses: ${response.statusText}`);
        const data = await response.json();
        setCourses(data);
      } catch (error) {
        console.error("Error fetching courses:", error);
        setFormError("Failed to fetch courses data.");
      }
    };

    fetchUsers();
    fetchCourses();
  }, [categoryId]);

  const handleEmployeeChange = (selectedOptions) => {
    setSelectedEmployees(selectedOptions);
  };

  const handleCourseChange = (e) => {
    const { value, checked } = e.target;
    setSelectedCourses(prev => checked ? [...prev, value] : prev.filter(course => course !== value));
  };


  const toggleDropdown = (type) => {
    setDropdownOpen(prev => ({ ...prev, [type]: !prev[type] }));
  };

  const handleDurationSelect = (courseId, duration) => {
    setSelectedDurations(prev => ({ ...prev, [courseId]: duration }));
    toggleDropdown(`${courseId}-duration`);
  };

  const handleMonthSelect = (courseId, month) => {
    setSelectedMonths(prev => ({ ...prev, [courseId]: month }));
    toggleDropdown(`${courseId}-month`);
  };

  const handlePlanDateChange = (courseId, date) => {
    setPlanDates(prev => ({ ...prev, [courseId]: date }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    if (selectedCourses.length === 0) return setFormError("Please select at least one course.");
    if (selectedEmployees.length === 0) return setFormError("Please select at least one employee.");
  
    // Check if durations, months, and plan dates are selected for each course
    const incompleteDurations = selectedCourses.filter(course => !selectedDurations[course]);
    if (incompleteDurations.length > 0) return setFormError("Please select duration for all selected courses.");
  
    const incompleteMonths = selectedCourses.filter(course => !selectedMonths[course]);
    if (incompleteMonths.length > 0) return setFormError("Please select month for all selected courses.");
  
    const incompletePlanDates = selectedCourses.filter(course => !planDates[course]);
    if (incompletePlanDates.length > 0) return setFormError("Please select plan date for all selected courses.");
  
    setFormError("");  // Clear any existing errors
  
    const token = localStorage.getItem('token');
  
    try {
      // Iterate through each employee and each selected course
      for (const employee of selectedEmployees) {
        for (const courseId of selectedCourses) {
          const request = {
            userId: employee.value,
            courseId: courseId,
            duration: selectedDurations[courseId],   // Duration for the current course
            month: selectedMonths[courseId],         // Month for the current course
            plan_date: planDates[courseId],          // Plan date for the current course
            status: "pending"                        // Default status
          };
  
          // Make an individual API call for each employee/course combination
          const response = await fetch('http://localhost:3000/api/userCourses', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(request),
          });
  
          if (!response.ok) {
            throw new Error(`Failed to submit data for employee ${employee.label} and course ${courseId}: ${response.statusText}`);
          }
        }
      }
  
      handleReset();  // Reset the form after successful submission
      console.log("Data submitted successfully.");
    } catch (error) {
      console.error("Error submitting data:", error);
      setFormError("Failed to submit data.");
    }
  };
  

  const handleReset = () => {
    setSelectedEmployees([]);
    setSelectedCourses([]);
    setSelectedDurations({});
    setSelectedMonths({});
    setPlanDates({});
    setSelectedTrainer(null);  // Reset selected trainer
    setFormError("");
    setSearchQuery("");
    setDropdownOpen({});
  };

  const handleAddCourse = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
  
    if (!selectedTrainer) {
      return setFormError("Please select a trainer.");
    }
  
    // Prepare the new course data
    const newCourse = {
      courseName: newCourseName,
      description: newDescription,
      trainerName: selectedTrainer.label, // Send trainer's name instead of ID
    };
  
    try {
      const response = await fetch(`http://localhost:3000/api/courses/${categoryId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newCourse),
      });
  
      if (!response.ok) throw new Error(`Failed to add course: ${response.statusText}`);
      const addedCourse = await response.json();
      setCourses(prev => [...prev, addedCourse]);
      handleCloseModal();
      handleReset();
    } catch (error) {
      console.error("Error adding course:", error);
      setFormError("Failed to add course.");
    }
  };

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    handleReset();  // Reset fields after closing
  };

  const filteredCourses = courses.filter(course =>
    course.courseName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="course-container">
      <div className="left-container">
        <form onSubmit={handleSubmit}>
          <div className='header'>
            <div className="search-bar">
              <input
                type="text"
                placeholder="Search courses..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
              />
            </div>
            <div className='button-group'>
              <button className='add-course-button' type="button" onClick={handleOpenModal}>Add Course</button>
              <button className='drop-course-button'>Drop Course</button>
            </div>
          </div>
          <div className='course-table-out'>
            <table className="course-table">
              <thead>
                <tr>
                  <th>SR NO</th>
                  <th>Topic</th>
                  <th>Duration</th>
                  <th>Month</th>
                  <th>Plan Date</th>
                  <th>Select</th>
                </tr>
              </thead>
              <tbody>
                {filteredCourses.map((course, index) => (
                  <tr key={course.courseId}>
                    <td>{index + 1}</td>
                    <td>{course.courseName}</td>
                    <td>
                      <div className="custom-dropdown">
                        <div className="dropdown-selected" onClick={() => toggleDropdown(`${course.courseId}-duration`)}>
                          {selectedDurations[course.courseId] || "Select Duration"}
                        </div>
                        <ul className={`dropdown-list ${dropdownOpen[`${course.courseId}-duration`] ? 'visible' : ''}`}>
                          {durations.map(duration => (
                            <li
                              key={duration}
                              className="dropdown-item"
                              onClick={() => handleDurationSelect(course.courseId, duration)}
                            >
                              {duration}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </td>
                    <td>
                      <div className="custom-dropdown">
                        <div className="dropdown-selected" onClick={() => toggleDropdown(`${course.courseId}-month`)}                        >
                          {selectedMonths[course.courseId] || "Select Month"}
                        </div>
                        <ul className={`dropdown-list ${dropdownOpen[`${course.courseId}-month`] ? 'visible' : ''}`}>
                          {months.map(month => (
                            <li
                              key={month}
                              className="dropdown-item"
                              onClick={() => handleMonthSelect(course.courseId, month)}
                            >
                              {month}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </td>
                    <td>
                      <input
                        type="date"
                        value={planDates[course.courseId] || ""}
                        onChange={(e) => handlePlanDateChange(course.courseId, e.target.value)}
                      />
                    </td>
                    <td>
                      <input
                        className='checkbox'
                        type="checkbox"
                        value={course.courseId}
                        checked={selectedCourses.includes(course.courseId)}
                        onChange={handleCourseChange}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {formError && <p className="form-error">{formError}</p>}
        </form>

        {isModalOpen && (
          <div className="modal-overlay">
            <div className="modal-content">
              <h2>Add New Course</h2>
              <form onSubmit={handleAddCourse}>
                <div className='modal-input-fields'>
                  <input
                    type="text"
                    placeholder="Course Name"
                    value={newCourseName}
                    onChange={(e) => setNewCourseName(e.target.value)}
                    required
                  />
                  <input
                    type="text"
                    placeholder="Description"
                    value={newDescription}
                    onChange={(e) => setNewDescription(e.target.value)}
                    required
                  />
                  <label htmlFor="trainer-select">Select Trainer</label>
                  <Select
                    options={trainers}
                    value={selectedTrainer}
                    onChange={setSelectedTrainer}
                    placeholder="Select Trainer"
                    className="trainer-select"
                  />
                </div> 
                <div className='modal-buttons'>
                  <button type="submit">Submit</button>
                  <button type="button" onClick={handleCloseModal}>Cancel</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>

      <div className="right-container">
        <div className="employee-selection">
          <label>Add Employees</label>
          <Select
            isMulti
            closeMenuOnSelect={false}
            options={employees}
            onChange={handleEmployeeChange}
            value={selectedEmployees}
            className="employee-select"
            classNamePrefix="select"
          />
        </div>
        <div className="button-group">
          <button type="submit" className="submit-button" onClick={handleSubmit}>Submit</button>
          <button type="button" className="reset-button" onClick={handleReset}>Reset</button>
        </div>
      </div>
    </div>
  );
};

export default CourseTable;
