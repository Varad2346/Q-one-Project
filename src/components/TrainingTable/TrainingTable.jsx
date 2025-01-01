import React, { useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";
import "./TrainingTable.css";

const TrainingTable = () => {
  const [trainingData, setTrainingData] = useState([]);
  const [courseData, setCourseData] = useState(null);
  const [usersData, setUsersData] = useState([]);
  const [filteredUser, setFilteredUser] = useState(null);
  const [filteredUsersByDepartment, setFilteredUsersByDepartment] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hodName, setHodName] = useState("");
  const [department, setDepartment] = useState("");
  const [year, setYear] = useState("");
  const [enrollments, setEnrollments] = useState([]);
  const [plannedCourses, setPlannedCourses] = useState([]);
  const [reports, setReports] = useState([]);
  const [newdata, setNewdata] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decoded = jwtDecode(token);
        
        const hodFirstName = decoded.firstName || "Unknown";
        const hodLastName = decoded.lastName || "HOD";
        setHodName(`${hodFirstName} ${hodLastName}`);
        setDepartment(decoded.department || "Information Technology");
        setYear(decoded.year || "2025");

        // Refetch user data
        fetchUserData(token, decoded.id);
      } catch (error) {
        console.error("Error decoding the token:", error);
      }
    }
  }, []);

  const fetchUserData = async (token, decodedUserId) => {
    try {
      const response = await fetch('http://localhost:3000/api/users', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
      const data = await response.json();

      if (data.success) {
        setUsersData(data.data);
        const filteredUser = data.data.find(user => user.userId === decodedUserId);
        setFilteredUser(filteredUser);
        const usersInSameDepartment = data.data.filter(
          (user) => user.department === filteredUser.department && user.role === 'employee'
        );
        setFilteredUsersByDepartment(usersInSameDepartment);

        // Fetch enrollments data after users data is set
        fetchEnrollments(token, usersInSameDepartment);
      } else {
        console.error('Failed to fetch users:', data.message);
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

  const fetchEnrollments = async (token, usersInSameDepartment) => {
    try {
      const response = await fetch('http://localhost:3000/api/enrollments', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
      const enrollmentData = await response.json();

      if (enrollmentData.success) {
        const enrichedUsers = usersInSameDepartment.map(user => {
          const userEnrollments = enrollmentData.data.filter(
            enrollment => enrollment.userId === user.userId
          );
          return { ...user, enrollments: userEnrollments };
        });
        setEnrollments(enrichedUsers);

        // Now fetch planned courses data
        fetchPlannedCourses(token, enrichedUsers);
      } else {
        console.error('Failed to fetch enrollments:', enrollmentData.message);
      }
    } catch (error) {
      console.error("Error fetching enrollments:", error);
    }
  };

  const fetchPlannedCourses = async (token, enrichedUsers) => {
    try {
      const response = await fetch('http://localhost:3000/api/planned-courses', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
      const plannedCourseData = await response.json();

      if (plannedCourseData.success) {
        const plannedCoursesMap = new Map();

        plannedCourseData.data.forEach(course => {
          plannedCoursesMap.set(course.plannedCourseId, course);
        });

        const enrichedUsersWithPlannedCourses = enrichedUsers.map(user => {
          const enrichedEnrollments = user.enrollments.map(enrollment => {
            const plannedCourse = plannedCoursesMap.get(enrollment.plannedCourseId);
  
            if (plannedCourse) {
              return { ...enrollment, plannedCourse };
            }
  
            return enrollment; // Return as is if no planned course found
          });
  
          return { ...user, enrollments: enrichedEnrollments };
        });

        setPlannedCourses(plannedCourseData.data);
        setNewdata(enrichedUsersWithPlannedCourses);
        // Fetch reports data after planned courses are fetched
        fetchReports(token, enrichedUsersWithPlannedCourses);
      } else {
        console.error('Failed to fetch planned courses:', plannedCourseData.message);
      }
    } catch (error) {
      console.error("Error fetching planned courses:", error);
    }
  };

  const fetchReports = async (token, enrichedEnrollments) => {
    try {
      const response = await fetch('http://localhost:3000/api/reports', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
      const reportData = await response.json();

      if (reportData.success) {
        setReports(reportData.data);

        const enrichedEnrollmentsWithReports = enrichedEnrollments.map(user => {
          const userEnrollments = user.enrollments.map(enrollment => {
            const report = reportData.data.find(r => r.reportId === enrollment.reportId);
            if (report) {
              return { ...enrollment, actualDate: report.actualDate, dueDate: report.dueDate };
            }
            return enrollment;
          });
          return { ...user, enrollments: userEnrollments };
        });

        // Now, for each enrollment, fetch course details
        const enrichedEnrollmentsWithCourseDetails = await Promise.all(
          enrichedEnrollmentsWithReports.map(async (user) => {
            const enrichedEnrollmentsWithCourses = await Promise.all(
              user.enrollments.map(async (enrollment) => {
                const courseDetails = await fetchCourseDetails(token, enrollment.plannedCourse.courseId);
                return { ...enrollment, courseDetails };
              })
            );
            return { ...user, enrollments: enrichedEnrollmentsWithCourses };
          })
        );  
        console.log(enrichedEnrollmentsWithCourseDetails);
        setNewdata(enrichedEnrollmentsWithCourseDetails);
        setLoading(false);
      } else {
        console.error('Failed to fetch reports:', reportData.message);
      }
    } catch (error) {
      console.error("Error fetching reports:", error);
    }
  };

  const fetchCourseDetails = async (token, courseId) => {
    try {
      const response = await fetch(`http://localhost:3000/api/courses/courseId/${courseId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
      const courseData = await response.json();

      if (courseData.success) {
        return courseData.data;
      } else {
        console.error('Failed to fetch course data:', courseData.message);
        return null;
      }
    } catch (error) {
      console.error("Error fetching course data:", error);
      return null;
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      {/* Render your component's UI */}
      <h2 className="eval-heading">Training Evaluation-2025</h2>
      <table className="hod-table">
        <thead>
          <tr>
            <td className="hod-cell" colSpan={1}>HOD Name:</td>
            <td colSpan={2}>{filteredUser ? `${filteredUser.firstName} ${filteredUser.lastName}` : 'NA'}</td>
            <td className="department-cell vertical-divider">Department:</td>
            <td colSpan={2}>{filteredUser ? filteredUser.department : 'NA'}</td>
            <td className="year-cell">Year:</td>
            <td colSpan={2}>{new Date().getFullYear()}</td>
          </tr>
        </thead>
      </table>

      {/* Your training data table goes here */}
      <table className="training-table">
        <thead>
          <tr>
            <th>Actual Date</th>
            <th>Due Date</th>
            <th>Training Topic</th>
            <th>Employee</th>
            <th>Trainer</th>
            <th>Duration</th>
            <th colSpan="6">Evaluation of Effectiveness of Training</th>
            <th>Remark</th>
            <th>DOE</th>
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
            <th></th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {newdata.map((user) => {
            return user.enrollments.map((enrollment, index) => {
              const actualDate = enrollment.actualDate 
                ? new Date(enrollment.actualDate).toLocaleDateString('en-CA') 
                : 'N/A'; // Fallback if actualDate is missing or invalid

              const dueDate = enrollment.dueDate 
                ? new Date(enrollment.dueDate).toLocaleDateString('en-CA') 
                : 'N/A'; // Fallback if dueDate is missing or invalid
              return (
                <tr key={`${user.userId}-${index}`}>
                  <td>{actualDate}</td>
                  <td>{dueDate}</td>
                  <td>{enrollment.courseDetails?.name}</td>
                  <td>{`${user.firstName} ${user.lastName}`}</td>
                  <td>{enrollment.courseDetails?.trainer.firstName} {enrollment.courseDetails?.trainer.lastName}</td>
                  <td>{enrollment.plannedCourse.trainingDuration}</td>
                  <td><input type="text" className="grade-input" /></td>
                  <td><input type="text" className="grade-input" /></td>
                  <td><input type="text" className="grade-input" /></td>
                  <td><input type="text" className="grade-input" /></td>
                  <td><input type="text" className="grade-input" /></td>
                  <td><input type="text" className="grade-input" /></td>
                  <td><input type="text" className="grade-input" /></td>
                  <td>{new Date().toISOString().split('T')[0]}</td>
                </tr>
              );
            });
          })}
        </tbody>
      </table>
    </div>
  );
};

export default TrainingTable;
