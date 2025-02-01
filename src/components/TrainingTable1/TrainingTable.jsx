import React, { useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";
import "./TrainingTable.css";
import { useSnackbar } from 'notistack'; // Import Notistack's hook
import { html2pdf } from "html2pdf.js";
const TrainingTable = () => {
  const [trainingData, setTrainingData] = useState([]);
  const [courseData, setCourseData] = useState(null);
  const [usersData, setUsersData] = useState([]);
  const [filteredUser, setFilteredUser] = useState(null);
  const [filteredUsersByDepartment, setFilteredUsersByDepartment] = useState([]);
  const { enqueueSnackbar } = useSnackbar(); // Initialize Notistack's enqueueSnackbar
  const [loading, setLoading] = useState(true);
  const [hodName, setHodName] = useState("");
  const [department, setDepartment] = useState("");
  const [year, setYear] = useState("");
  const [enrollments, setEnrollments] = useState([]);
  const [plannedCourses, setPlannedCourses] = useState([]);
  const [reports, setReports] = useState([]);
  const [newdata, setNewdata] = useState([]);
  const [updatedEvaluations, setUpdatedEvaluations] = useState([]);

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

  const handleInputChange = (enrollmentId, plannedCourseId, field, value) => {
    setUpdatedEvaluations((prevEvaluations) => {
      const todayDate = new Date(); // This is a full Date object

      // Check if the evaluation for this enrollment already exists
      const existingEvaluationIndex = prevEvaluations.findIndex(
        (evaluation) =>
          evaluation.enrollmentId === enrollmentId &&
          evaluation.plannedCourseId === plannedCourseId
      );

      if (existingEvaluationIndex >= 0) {
        // Update the existing evaluation
        const updatedEvaluation = {
          ...prevEvaluations[existingEvaluationIndex],
        };
        updatedEvaluation[field] = value;
        updatedEvaluation.dateOfEvaluation = todayDate; // Update the date

        const updatedEvaluations = [...prevEvaluations];
        updatedEvaluations[existingEvaluationIndex] = updatedEvaluation;
        return updatedEvaluations;
      } else {
        // Add a new evaluation entry if it doesn't exist yet
        const newEvaluation = {
          enrollmentId,
          plannedCourseId,
          dateOfEvaluation: todayDate,
          criteriaA: "0",
          criteriaB: "0",
          criteriaC: "0",
          criteriaD: "0",
          criteriaE: "0",
          criteriaF: "0",
        };

        // Add the field value (e.g., 'criteriaA', 'criteriaB', etc.)
        newEvaluation[field] = value;

        return [...prevEvaluations, newEvaluation]; // Return the updated evaluations with the new evaluation
      }
    });
  };

  const fetchUserData = async (token, decodedUserId) => {
    try {
      const response = await fetch("http://localhost:3000/api/users", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();

      if (data.success) {
        setUsersData(data.data);
        const filteredUser = data.data.find(
          (user) => user.userId === decodedUserId
        );
        setFilteredUser(filteredUser);
        const usersInSameDepartment = data.data.filter(
          (user) =>
            user.department === filteredUser.department &&
            user.role === "employee"
        );
        setFilteredUsersByDepartment(usersInSameDepartment);

        // Fetch enrollments data after users data is set
        fetchEnrollments(token, usersInSameDepartment);
      } else {
        console.error("Failed to fetch users:", data.message);
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

  const fetchEnrollments = async (token, usersInSameDepartment) => {
    try {
      const response = await fetch("http://localhost:3000/api/enrollments", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      const enrollmentData = await response.json();

      if (enrollmentData.success) {
        const enrichedUsers = usersInSameDepartment.map((user) => {
          const userEnrollments = enrollmentData.data.filter(
            (enrollment) => enrollment.userId === user.userId
          );
          return { ...user, enrollments: userEnrollments };
        });
        setEnrollments(enrichedUsers);

        // Now fetch planned courses data
        fetchPlannedCourses(token, enrichedUsers);
      } else {
        console.error("Failed to fetch enrollments:", enrollmentData.message);
      }
    } catch (error) {
      console.error("Error fetching enrollments:", error);
    }
  };

  const fetchPlannedCourses = async (token, enrichedUsers) => {
    try {
      const response = await fetch(
        "http://localhost:3000/api/planned-courses",
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const plannedCourseData = await response.json();

      if (plannedCourseData.success) {
        const plannedCoursesMap = new Map();

        plannedCourseData.data.forEach((course) => {
          plannedCoursesMap.set(course.plannedCourseId, course);
        });

        const enrichedUsersWithPlannedCourses = enrichedUsers.map((user) => {
          const enrichedEnrollments = user.enrollments.map((enrollment) => {
            const plannedCourse = plannedCoursesMap.get(
              enrollment.plannedCourseId
            );

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
        console.error(
          "Failed to fetch planned courses:",
          plannedCourseData.message
        );
      }
    } catch (error) {
      console.error("Error fetching planned courses:", error);
    }
  };

  const fetchReports = async (token, enrichedEnrollments) => {
    try {
      const response = await fetch("http://localhost:3000/api/reports", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      const reportData = await response.json();

      if (reportData.success) {
        setReports(reportData.data);

        const enrichedEnrollmentsWithReports = enrichedEnrollments.map(
          (user) => {
            const userEnrollments = user.enrollments.map((enrollment) => {
              const report = reportData.data.find(
                (r) => r.reportId === enrollment.reportId
              );
              if (report) {
                return {
                  ...enrollment,
                  actualDate: report.actualDate,
                  dueDate: report.dueDate,
                };
              }
              return enrollment;
            });
            return { ...user, enrollments: userEnrollments };
          }
        );

        // Now, for each enrollment, fetch course details
        const enrichedEnrollmentsWithCourseDetails = await Promise.all(
          enrichedEnrollmentsWithReports.map(async (user) => {
            const enrichedEnrollmentsWithCourses = await Promise.all(
              user.enrollments.map(async (enrollment) => {
                const courseDetails = await fetchCourseDetails(
                  token,
                  enrollment.plannedCourse.courseId
                );
                return { ...enrollment, courseDetails };
              })
            );
            return { ...user, enrollments: enrichedEnrollmentsWithCourses };
          })
        );

        setNewdata(enrichedEnrollmentsWithCourseDetails);
        setLoading(false);
      } else {
        console.error("Failed to fetch reports:", reportData.message);
      }
    } catch (error) {
      console.error("Error fetching reports:", error);
    }
  };

  const fetchCourseDetails = async (token, courseId) => {
    try {
      const response = await fetch(
        `http://localhost:3000/api/courses/courseId/${courseId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const courseData = await response.json();

      if (courseData.success) {
        return courseData.data;
      } else {
        console.error("Failed to fetch course data:", courseData.message);
        return null;
      }
    } catch (error) {
      console.error("Error fetching course data:", error);
      return null;
    }
  };

  const handleCommitChanges = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      console.error("No token found. User must be logged in.");
      return;
    }

    try {
      // Loop through each updated evaluation and submit to the API
      for (const evaluation of updatedEvaluations) {
        const {
          enrollmentId,
          criteriaA,
          criteriaB,
          criteriaC,
          criteriaD,
          criteriaE,
          criteriaF,
          dateOfEvaluation,
        } = evaluation;

        // Convert dateOfEvaluation to yyyy-mm-dd format
        const formattedDate = new Date(dateOfEvaluation)
          .toISOString()
          .split("T")[0];

        // Prepare the data to send to the API (only send criteria and dateOfEvaluation)
        const dataToSubmit = {
          criteriaA,
          criteriaB,
          criteriaC,
          criteriaD,
          criteriaE,
          criteriaF,
          evaluationRemark: "completed",
          dateOfEvaluation: formattedDate, // Ensure date is in yyyy-mm-dd format
        };

        // Send the request to the backend
        const response = await fetch(
          `http://localhost:3000/api/enrollments/${enrollmentId}`,
          {
            method: "PUT", // Assuming you're updating an existing record
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(dataToSubmit),
          }
        );

        const result = await response.json();

        if (result.success) {
          enqueueSnackbar(
            `Successfully committed evaluation`, { variant: 'success' }
          );
        } else {
          console.error(
            `Failed to commit evaluation for enrollment ID: ${enrollmentId}: ${result.message}`
          );
        }
      }

      // Optionally, refresh the evaluations after commit
      setUpdatedEvaluations([]); // Clear or reset the evaluations if necessary

      // Fetch data again to refresh the table after commit
      fetchUserData(token, filteredUser ? filteredUser.userId : "");

    } catch (error) {
      console.error("Error committing evaluations:", error);
    }
  };
    const downloadPDF = () => {
      const element = document.getElementById("training-report"); // Get the table element
      const options = {
        filename: "training-calendar.pdf",
        html2canvas: { scale: 6 },
        jsPDF: { unit: "mm", format: "a3", orientation: "landscape" },
      };
      html2pdf().from(element).set(options).save();
    };
  return (
    <div className="eval-container">
      <h2 className="eval-heading">Training Evaluation-2025</h2>
      <div className="report-button-container">
          <button className="commit-button" onClick={downloadPDF}>
            Download Report
          </button>
          <button className="commit-button" onClick={handleCommitChanges}>
            Commit Changes
          </button>
        </div>
      <table className="hod-table">
        <thead>
          <tr>
            <td className="hod-cell" colSpan={1}>
              HOD Name:
            </td>
            <td colSpan={2}>
              {filteredUser
                ? `${filteredUser.firstName} ${filteredUser.lastName}`
                : "NA"}
            </td>
            <td className="department-cell vertical-divider">Department:</td>
            <td colSpan={2}>{filteredUser ? filteredUser.department : "NA"}</td>
            <td className="year-cell">Year:</td>
            <td colSpan={2}>{new Date().getFullYear()}</td>
          </tr>
        </thead>
      </table>

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
          {console.log(newdata)}
          {newdata.map((user) =>
            user.enrollments
              .filter((enrollment) => {
                // Check if reportId is NULL (exclude such enrollments)
                if (enrollment.reportId === null) {
                  return false;
                }
                
                // Check if both reportId exists and dateOfEvaluation exists (exclude such enrollments)
                if (enrollment.reportId && enrollment.dateOfEvaluation !== null) {
                  return false;
                }
          
                // Include only if reportId exists and dateOfEvaluation is NULL
                return enrollment.reportId && enrollment.dateOfEvaluation === null;
              })
              .map((enrollment, index) => {
                const actualDate = enrollment.actualDate
                  ? new Date(enrollment.actualDate).toLocaleDateString("en-CA")
                  : "N/A";

                const dueDate = enrollment.dueDate
                  ? new Date(enrollment.dueDate).toLocaleDateString("en-CA")
                  : "N/A";

                const courseName = enrollment.courseDetails?.name || "N/A";
                const trainerName = enrollment.courseDetails?.trainer
                  ? `${enrollment.courseDetails.trainer.firstName} ${enrollment.courseDetails.trainer.lastName}`
                  : "N/A";

                const trainingDuration =
                  enrollment.plannedCourse?.trainingDuration || "N/A";

                const todayDate = new Date().toLocaleDateString("en-CA");

                return (
                  <tr key={`${user.userId}-${index}`}>
                    <td className="date-field">{actualDate}</td>
                    <td className="date-field">{dueDate}</td>
                    <td>{courseName}</td>
                    <td>{`${user.firstName} ${user.lastName}`}</td>
                    <td>{trainerName}</td>
                    <td className="duration-field">{trainingDuration}</td>

                    {[
                      "criteriaA",
                      "criteriaB",
                      "criteriaC",
                      "criteriaD",
                      "criteriaE",
                      "criteriaF",
                    ].map((grade) => (
                      <td key={grade} className="grade-input">
                        <input
                          type="text"
                          min="0"
                          max="4"
                          defaultValue={enrollment[grade.toLowerCase()] || ""}
                          onChange={(e) =>
                            handleInputChange(
                              enrollment.enrollmentId,
                              enrollment.plannedCourseId,
                              grade,
                              e.target.value
                            )
                          }
                          className="large-input"
                        />
                      </td>
                    ))}

                    <td className="remark-field">
                      <input
                        type="text"
                        defaultValue={enrollment.remark || ""}
                        onChange={(e) =>
                          handleInputChange(
                            enrollment.enrollmentId,
                            enrollment.plannedCourseId,
                            "remark",
                            e.target.value
                          )
                        }
                      />
                    </td>
                    <td className="date-field">{todayDate}</td>
                  </tr>
                );
              })
          )}
        
        </tbody>
      </table>
    </div>
  );
};

export default TrainingTable;
