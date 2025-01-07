import { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import "./tables1.css";
import Select from "react-select";
import { useSnackbar } from "notistack"; // Import Notistack's hook
import { useAuth } from "../../store/auth";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faTrashAlt } from "@fortawesome/free-solid-svg-icons";
import {months,durations,monthMapping} from "../CourseAssignTable/coursetableconstants"

const CourseTable = () => {

  const { enqueueSnackbar } = useSnackbar(); // Initialize Notistack's enqueueSnackbar
  const { authToken } = useAuth();
  const { categoryId } = useParams();
  
  const [employees, setEmployees] = useState([]);
  const [trainers, setTrainers] = useState([]);
  const [courses, setCourses] = useState([]);
  const [selectedEmployees, setSelectedEmployees] = useState([]);
  const [selectedCourses, setSelectedCourses] = useState([]);
  const [selectedDurations, setSelectedDurations] = useState({});
  const [selectedMonths, setSelectedMonths] = useState({});
  const [planDates, setPlanDates] = useState({});
  const [searchQuery, setSearchQuery] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newCourseName, setNewCourseName] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [selectedTrainer, setSelectedTrainer] = useState(null);
  const [isMonthView, setIsMonthView] = useState(true);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [viewMode, setViewMode] = useState("current");
  const dropdownRef = useRef(null);

  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();

  const getMonthsForYear = (year) => {
    return [...months];
  };



  const capitalizeWords = (str) => {
    return str
      .toLowerCase()
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const getLastDateOfMonth = (month, year) => {
    const monthNumber = monthMapping[month];
    return new Date(year, monthNumber + 1, 0).toISOString().split("T")[0];
  };

  const getMinDate = () => {
    return "1900-01-01";
  };

  const getMaxDate = () => {
    return "2100-12-31";
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      // Close all dropdowns if the clicked element is not within any dropdown
      if (!event.target.closest(".custom-dropdown")) {
        setDropdownOpen({});
      }
    };

    document.addEventListener("click", handleClickOutside);

    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch("http://localhost:3000/api/users", {
          headers: { Authorization: `Bearer ${authToken}` },
        });

        if (!response.ok)
          throw new Error(`Failed to fetch users: ${response.statusText}`);
        const data = await response.json();
        const employeeOptions = Array.isArray(data.data)
          ? data.data
              .filter((emp) => emp.role.toLowerCase() === "employee")
              .map((emp) => ({
                value: emp.userId,
                label: `${emp.firstName} ${emp.lastName}`,
              }))
          : []; // Fallback to an empty array if `data` is not an array

        const trainerOptions = Array.isArray(data.data)
          ? data.data
              .filter((emp) => emp.role.toLowerCase() === "trainer")
              .map((emp) => ({
                value: emp.userId,
                label: `${emp.firstName} ${emp.lastName}`,
              }))
          : []; // Fallback to an empty array if `data` is not an array

        setEmployees(employeeOptions);
        setTrainers(trainerOptions);
      } catch (error) {
        console.log("Failed to fetch user data.", error);
      }
    };

    const fetchCourses = async () => {
      try {
        console.log(categoryId);
        const response = await fetch(
          `http://localhost:3000/api/courses/${categoryId}`,
          {
            headers: { Authorization: `Bearer ${authToken}` },
          }
        );
        if (!response.ok)
          throw new Error(`Failed to fetch courses: ${response.statusText}`);
        const data = await response.json();
        console.log("courses", data.data);
        setCourses(data.data);
      } catch (error) {
        console.error("Error fetching courses:", error);
      }
    };

    fetchUsers();
    fetchCourses();
  }, [categoryId, authToken]);

  const handleEmployeeChange = (selectedOptions) => {
    setSelectedEmployees(selectedOptions);
  };

  const handleCourseChange = (e) => {
    const { value, checked } = e.target;
    setSelectedCourses((prev) =>
      checked ? [...prev, value] : prev.filter((course) => course !== value)
    );
  };

  const toggleDropdown = (type) => {
    setDropdownOpen((prev) => ({ ...prev, [type]: !prev[type] }));
  };

  const handleDurationSelect = (courseId, duration) => {
    setSelectedDurations((prev) => ({ ...prev, [courseId]: duration }));
    toggleDropdown(`${courseId}-duration`);
  };

  const handleMonthSelect = (courseId, month) => {
    const year = viewMode === "current" ? currentYear : currentYear + 1;
    const lastDateOfMonth = getLastDateOfMonth(month, year);
    setSelectedMonths((prev) => ({ ...prev, [courseId]: month }));
    setPlanDates((prev) => ({ ...prev, [courseId]: lastDateOfMonth }));
    toggleDropdown(`${courseId}-month`);
  };

  const handlePlanDateChange = (courseId, date) => {
    setPlanDates((prev) => ({ ...prev, [courseId]: date }));
  };

  const toggleView = () => {
    setIsMonthView(!isMonthView);
  };

  const toggleYearView = () => {
    setViewMode((prev) => (prev === "current" ? "next" : "current"));
    setSelectedMonths({});
    setPlanDates({});
  };
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (selectedCourses.length === 0) {
      enqueueSnackbar("Please select at least one course", { variant: "info" });
      return;
    }
    if (selectedEmployees.length === 0) {
      enqueueSnackbar("Please select at least one employee", {
        variant: "info",
      });
      return;
    }

    const incompleteSelections = selectedCourses.filter(
      (course) =>
        !selectedDurations[course] ||
        (!selectedMonths[course] && !planDates[course])
    );

    if (incompleteSelections.length > 0) {
      enqueueSnackbar("Please complete all selections", { variant: "info" });
      return;
    }

    try {
      // Step 1: Create Planned Courses
      const plannedCourses = [];
      for (const courseId of selectedCourses) {
        const request = {
          courseId: courseId,
          trainingDuration: selectedDurations[courseId],
          plannedDate: planDates[courseId] || null,
          status: "pending", // Assuming status remains pending
        };

        const response = await fetch(
          "http://localhost:3000/api/planned-courses/",
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${authToken}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify(request),
          }
        );

        if (!response.ok) {
          throw new Error(
            `Failed to create planned course for course ${courseId}`
          );
        }

        const data = await response.json();
        if (data.success) {
          plannedCourses.push(data.data); // Save the planned course response data
        } else {
          throw new Error(data.message || "Failed to create planned course");
        }
      }

      // Step 2: Enroll Employees
      for (const plannedCourse of plannedCourses) {
        for (const employee of selectedEmployees) {
          const enrollmentRequest = {
            plannedCourseId: plannedCourse.plannedCourseId,
            userId: employee.value,
          };

          const enrollmentResponse = await fetch(
            "http://localhost:3000/api/enrollments",
            {
              method: "POST",
              headers: {
                Authorization: `Bearer ${authToken}`,
                "Content-Type": "application/json",
              },
              body: JSON.stringify(enrollmentRequest),
            }
          );

          if (!enrollmentResponse.ok) {
            throw new Error(
              `Failed to enroll employee ${employee.label} for course ${plannedCourse.courseId}`
            );
          }

          const enrollmentData = await enrollmentResponse.json();
          if (!enrollmentData.success) {
            throw new Error(
              `Failed to enroll employee ${employee.label} for course ${plannedCourse.courseId}`
            );
          }
        }
      }

      enqueueSnackbar("Courses assigned and employees enrolled successfully", {
        variant: "success",
      });
      handleReset();
    } catch (error) {
      console.error("Error submitting data:", error);
      enqueueSnackbar("Failed to submit data", { variant: "error" });
    }
  };

  const handleReset = () => {
    setSelectedEmployees([]);
    setSelectedCourses([]);
    setSelectedDurations({});
    setSelectedMonths({});
    setPlanDates({});
    setSelectedTrainer(null);
    setSearchQuery("");
    setDropdownOpen({});
  };

  const handleAddCourse = async (e) => {
    e.preventDefault();

    if (!selectedTrainer) {
      enqueueSnackbar("Please select a trainer", { variant: "info" });
      return;
    }

    const newCourse = {
      name: capitalizeWords(newCourseName), // Capitalize course name
      description: newDescription,
      trainerId: selectedTrainer.value,
      categoryId: categoryId,
    };

    try {
      const response = await fetch(
        `http://localhost:3000/api/courses/${categoryId}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${authToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(newCourse),
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to add course: ${response.statusText}`);
      }

      const result = await response.json();

      if (result.success) {
        const addedCourse = {
          courseId: result.data.courseId,
          name: result.data.name,
          description: result.data.description,
          trainerId: result.data.trainerId,
        };

        setCourses((prevCourses) => [...prevCourses, addedCourse]);

        enqueueSnackbar(result.message, { variant: "success" });
        handleCloseModal();
      } else {
        throw new Error(result.message || "Failed to add course");
      }
    } catch (error) {
      console.error("Error adding course:", error);
      enqueueSnackbar("Failed to add course", { variant: "error" });
    }
  };

  const handleDropCourse = async () => {
    if (selectedCourses.length === 0) {
      enqueueSnackbar("Please select at least one course to drop", {
        variant: "info",
      });
      return;
    }

    const confirmDrop = window.confirm(
      "Are you sure you want to delete the selected courses? This action cannot be undone."
    );
    if (!confirmDrop) return;

    try {
      for (const courseId of selectedCourses) {
        const response = await fetch(
          `http://localhost:3000/api/courses/${courseId}`,
          {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${authToken}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error(`Failed to delete course ${courseId}`);
        }
      }

      setCourses((prevCourses) =>
        prevCourses.filter(
          (course) => !selectedCourses.includes(course.courseId)
        )
      );

      setSelectedCourses([]);
      enqueueSnackbar("Courses dropped successfully", { variant: "success" });
    } catch (error) {
      console.error("Error dropping courses:", error);
      enqueueSnackbar("Failed to drop courses", { variant: "error" });
    }
  };

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setNewCourseName("");
    setNewDescription("");
    setSelectedTrainer(null);
  };
  console.log("course",courses)
  const filteredCourses = courses.filter((course) =>
    course.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="course-container">
      <div className="left-container">
        <form onSubmit={handleSubmit}>
          <div className="header">
            <div className="search-bar">
              <input
                type="text"
                placeholder="Search courses..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
              />
            </div>
            <div className="button-group">
              <button
                className="add-course-button"
                type="button"
                onClick={handleOpenModal}
              >
                <FontAwesomeIcon icon={faPlus} className="button-icon" />
                Add Course
              </button>
              <button
                className="drop-course-button"
                type="button"
                onClick={handleDropCourse}
              >
                <FontAwesomeIcon icon={faTrashAlt} className="button-icon" />
                Drop Course
              </button>
              <button
                type="button"
                className="toggle-view-button"
                onClick={toggleView}
              >
                {isMonthView ? "Switch to Plan Date" : "Switch to Month"}
              </button>
            </div>
          </div>

          <div className="course-table-out">
            <table className="course-table">
              <thead>
                <tr>
                  <th>SR NO</th>
                  <th>TOPIC</th>
                  <th>DURATION</th>
                  <th>{isMonthView ? "MONTH" : "PLAN DATE"}</th>
                  <th>SELECT</th>
                </tr>
              </thead>
              <tbody>
                {filteredCourses.map(
                  (course, index) => (
                    console.log("courses1", courses),
                    (
                      <tr key={course.courseId}>
                        <td>{index + 1}</td>
                        <td>
                          <div className="topic-cell">{course.name}</div>
                        </td>
                        <td>
                          <div className="custom-dropdown" ref={dropdownRef}>
                            <div
                              className="dropdown-selected"
                              onClick={() =>
                                toggleDropdown(`${course.courseId}-duration`)
                              }
                            >
                              {selectedDurations[course.courseId] || "N/A"}
                            </div>
                            <ul
                              className={`dropdown-list ${
                                dropdownOpen[`${course.courseId}-duration`]
                                  ? "visible"
                                  : ""
                              }`}
                              onClick={(e) => e.stopPropagation()} // Prevent click event from bubbling up
                            >
                              {durations.map((duration) => (
                                <li
                                  key={duration}
                                  className="dropdown-item"
                                  onClick={() =>
                                    handleDurationSelect(
                                      course.courseId,
                                      duration
                                    )
                                  }
                                >
                                  {duration}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </td>

                        <td>
                          {isMonthView ? (
                            <div className="custom-dropdown" ref={dropdownRef}>
                              <div
                                className="dropdown-selected"
                                onClick={() =>
                                  toggleDropdown(`${course.courseId}-month`)
                                }
                              >
                                {selectedMonths[course.courseId] || "N/A"}
                              </div>
                              <ul
                                className={`dropdown-list ${
                                  dropdownOpen[`${course.courseId}-month`]
                                    ? "visible"
                                    : ""
                                }`}
                                onClick={(e) => e.stopPropagation()} // Prevent click event from bubbling up
                              >
                                {getMonthsForYear(
                                  viewMode === "current"
                                    ? currentYear
                                    : currentYear + 1
                                ).map((month) => (
                                  <li
                                    key={month}
                                    className="dropdown-item"
                                    onClick={() =>
                                      handleMonthSelect(course.courseId, month)
                                    }
                                  >
                                    {month}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          ) : (
                            <input
                            className="date-input-field"
                              type="date"
                              value={planDates[course.courseId] || " "}
                              onChange={(e) =>
                                handlePlanDateChange(
                                  course.courseId,
                                  e.target.value
                                )
                              }
                              min={getMinDate()}
                              max={getMaxDate()}
                            />
                          )}
                        </td>

                        <td>
                          <input
                            className="checkbox"
                            type="checkbox"
                            value={course.courseId}
                            checked={selectedCourses.includes(course.courseId)}
                            onChange={handleCourseChange}
                          />
                        </td>
                      </tr>
                    )
                  )
                )}
              </tbody>
            </table>
          </div>
        </form>

        {isModalOpen && (
          <div className="modal-overlay">
            <div className="modal-content">
              <h2>Add New Course</h2>
              <form onSubmit={handleAddCourse}>
                <div className="modal-input-fields">
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
                 
                  <Select
                    options={trainers}
                    value={selectedTrainer}
                    onChange={setSelectedTrainer}
                    placeholder="Select Trainer"
                    className="trainer-select"
                  />
                </div>
                <div className="modal-buttons">
                  <button type="submit">Submit</button>
                  <button type="button" onClick={handleCloseModal}>
                    Cancel
                  </button>
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
          <button
            type="submit"
            className="submit-button"
            onClick={handleSubmit}
          >
            Submit
          </button>
          <button type="button" className="reset-button" onClick={handleReset}>
            Reset
          </button>
        </div>

        <div className="plan-next-year-container">
          <div className="plan-next-year-text">
            {viewMode === "next" && (
              <div>
                <h3 style={{ fontWeight: "bold" }}>
                  Planning for Next Year: {currentYear + 1}
                </h3>
                <p>
                  You are currently planning courses for the next year. Please
                  ensure dates and months align with the selected year.
                </p>
              </div>
            )}
          </div>
          <div className="plan-next-year-button">
            <button
              type="button"
              className="plan-date-button"
              onClick={toggleYearView}
            >
              {viewMode === "current" ? "Plan Next Year" : "Plan Current Year"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseTable;
