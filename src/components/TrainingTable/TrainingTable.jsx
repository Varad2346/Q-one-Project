import React, { useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";
import "./TrainingTable.css";

const TrainingTable = () => {
  const [trainingData, setTrainingData] = useState([]); // To store training data
  const [courseData, setCourseData] = useState(null);  // To store course data
  const [usersData, setUsersData] = useState([]); // To store user data
  const [filteredUser, setFilteredUser] = useState(null); // To store filtered user data
  const [filteredUsersByDepartment, setFilteredUsersByDepartment] = useState([]); // To store users filtered by department
  const [loading, setLoading] = useState(true); // To handle loading state
  const [hodName, setHodName] = useState(""); // To store HOD's name
  const [department, setDepartment] = useState(""); // To store department name
  const [year, setYear] = useState(""); // To store year
  console.log(usersData);
  console.log(filteredUsersByDepartment)
  // console.log(filteredUser);

  useEffect(() => {
    // Fetch the JWT token from storage (localStorage, sessionStorage, etc.)
    const token = localStorage.getItem("token"); // Replace with where your token is stored
    // console.log(token);

    if (token) {
      try {
        // Decode the JWT token
        const decoded = jwtDecode(token);
        // console.log(decoded);

        // Set HOD's name and department from the decoded token
        const hodFirstName = decoded.firstName || "Unknown"; 
        const hodLastName = decoded.lastName || "HOD"; 
        setHodName(`${hodFirstName} ${hodLastName}`);

        // Assuming department is stored in the decoded token as "department"
        setDepartment(decoded.department || "Information Technology");
        setYear(decoded.year || "2025"); // Assuming year is also in the token

        // Fetch user data using fetch with Authorization header (like categoryResponse API)
        fetch('http://localhost:3000/api/users', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`, // Pass the token in Authorization header
          }
        })
        .then((response) => response.json())
        .then((data) => {
          if (data.success) {
            setUsersData(data.data); // Set the users data

            // Filter the user data based on the decoded userId
            const filteredUser = data.data.find(user => user.userId === decoded.id);
            setFilteredUser(filteredUser); // Set the filtered user

            // Filter users based on the department of the filteredUser
            const usersInSameDepartment = data.data.filter(
              (user) => user.department === filteredUser.department && user.role=='employee'
            );
            setFilteredUsersByDepartment(usersInSameDepartment); // Set users filtered by department
          } else {
            console.error('Failed to fetch users:', data.message);
          }
        })
        .catch((error) => {
          console.error("Error fetching user data:", error);
        });

      } catch (error) {
        console.error("Error decoding the token:", error);
      }
    }

    // Simulate fetching training data
    setTrainingData([]);  // Example of setting training data
    setCourseData({ Courses: [], Users: [] }); // Example course data
    setLoading(false); // Stop loading once data is fetched
  }, []);

  if (loading) {
    return <div>Loading...</div>; // Show a loading message while data is being fetched
  }

  return (
    <>
      <div className="eval-container">
        <h2 className="eval-heading">Training Evaluation-2025</h2>
        
        <table className="hod-table">
          <thead>
            <tr>
              <td className="hod-cell" colSpan={1}>
                HOD Name:
              </td>
              <td colSpan={2}>{filteredUser ? `${filteredUser.firstName} ${filteredUser.lastName}` : 'NA'}</td> {/* Dynamically display HOD's name */}
              <td className="department-cell vertical-divider">
                Department:
              </td>
              <td colSpan={2}>{filteredUser ? filteredUser.department : 'NA'}</td> {/* Dynamically display department */}
              <td className="year-cell">Year:</td>
              <td colSpan={2}>{new Date().getFullYear()}</td> {/* Display year */}
            </tr>
          </thead>
        </table>

        <table className="training-table">
          <thead>
            <tr>
              <th className="actual-date-column">Actual Date</th>
              <th className="actual-date-column">Due Date</th>
              <th className="trainer-column">Training Topic</th>
              <th className="trainer-column">Employee</th>
              <th className="trainer-column">Trainer</th>
              <th>Duration</th>
              <th colSpan="6">Evaluation of Effectiveness of Training</th>
              <th className="remark-column">Remark</th>
              <th className="doe-column">DOE</th>
            </tr>
            <tr>
              <th></th>
              <th></th>
              <th></th>
              <th></th>
              <th></th>
              <th></th>
              <th>A</th>
              <th>B</th>
              <th>C</th>
              <th>D</th>
              <th>E</th>
              <th>F</th>
              <th className="remark-column"></th>
              <th className="doe-column"></th>
            </tr>
          </thead>
          <tbody>
            {trainingData.map((attendance) => {
              const course = courseData?.Courses?.find(
                (course) => course.courseId === attendance.UserCourse[0].courseId
              );
              const employee = courseData?.Users?.find(
                (user) => user.userId === attendance.UserCourse[0].userId
              );
              const employeeName = employee
                ? `${employee.firstName} ${employee.lastName}`
                : "Unknown Employee";

              const topicName = course?.courseName || "Unknown Topic";

              return (
                <tr key={attendance.attendanceId}>
                  <td className="actual-date1">{new Date(attendance.date).toLocaleDateString()}</td>
                  <td>{new Date(attendance.dueDate).toLocaleDateString()}</td>
                  <td>{topicName}</td>
                  <td>{filteredUser ? `${filteredUser.firstName} ${filteredUser.lastName}` : "Unknown User"}</td> {/* Use the filtered user's name */}
                  <td>{attendance.trainerDetails}</td>
                  <td>{attendance.trainingEffectivenessPeriod}</td>
                  <td>
                    <input type="text" className="grade-input" />
                  </td>
                  <td>
                    <input type="text" className="grade-input" />
                  </td>
                  <td>
                    <input type="text" className="grade-input" />
                  </td>
                  <td>
                    <input type="text" className="grade-input" />
                  </td>
                  <td>
                    <input type="text" className="grade-input" />
                  </td>
                  <td>
                    <input type="text" className="grade-input" />
                  </td>
                  <td className="remark-column">
                    <input type="text" className="grade-input" />
                  </td>
                  <td className="doe-column">
                    {new Date(attendance.trainingEffectivenessDate).toLocaleDateString()}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        <div className="commit-button-container">
          <button className="commit-button">Commit</button>
        </div>
      </div>
    </>
  );
};

export default TrainingTable;
