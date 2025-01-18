import  { useEffect, useState } from "react";
import { useAuth } from "../../store/auth";
import { jwtDecode } from "jwt-decode";
import { useSnackbar } from "notistack";
import { html2pdf } from "html2pdf.js";
import "./TrainingTable.css";

const TrainingTable1 = () => {

  const { authToken } = useAuth();
  const [updatedEvaluations, setUpdatedEvaluations] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [hodName, setHodName] = useState("");
  const [department, setDepartment] = useState("");
  const [year, setYear] = useState("");
  const [filteredUser, setFilteredUser] = useState(null);
  const { enqueueSnackbar } = useSnackbar(); 
  const [searchQuery, setSearchQuery] = useState("");
  const [isEditMode, setIsEditMode] = useState(false);
  console.log(updatedEvaluations);
  useEffect(() => {
    const token = authToken || localStorage.getItem("token");

    if (token) {
      try {
        const decoded = jwtDecode(token);
        const hodFirstName = decoded.firstName || "Unknown";
        const hodLastName = decoded.lastName || "HOD";
        setHodName(`${hodFirstName} ${hodLastName}`);
        setDepartment(decoded.department || "Information Technology");
        setYear(decoded.year || "2025");

        // Fetch HOD data
        fetchHodData(token, decoded.id);
      } catch (error) {
        console.error("Error decoding the token:", error);
      }
    }
  }, [authToken]);

  // Fetch HOD data
  const fetchHodData = async (token, decodedUserId) => {
    try {
      const response = await fetch("http://localhost:3000/api/users", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      const userData = await response.json();
      if (userData.success) {
        const filteredUser = userData.data.find(
          (user) => user.userId === decodedUserId
        );
        setFilteredUser(filteredUser);
        console.log(filteredUser);
      } else {
        console.error("Failed to fetch users:", userData.message);
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

  useEffect(() => {
    if (authToken) {
      fetchEnrollments(authToken);
    }
  }, [authToken]);

  // Fetch enrollments after checking authToken
  const fetchEnrollments = async (token) => {
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
        // After fetching enrollments, fetch user data
        fetchUserData(token, enrollmentData.data);
      } else {
        console.error("Failed to fetch enrollments:", enrollmentData.message);
      }
    } catch (error) {
      console.error("Error fetching enrollments:", error);
    }
  };

  // Enrich enrollments with user data and course details
  const enrichEnrollmentsWithUsersAndCourses = async (
    enrollmentData,
    userData,
    plannedCourses
  ) => {
    const enrichedEnrollments = await Promise.all(
      enrollmentData.map(async (enrollment) => {
        const user = userData.find((user) => user.userId === enrollment.userId);
        const plannedCourse = plannedCourses.find(
          (course) => course.plannedCourseId === enrollment.plannedCourseId
        );
        let courseDetails = null;
        if (plannedCourse) {
          courseDetails = await fetchCourseDetails(
            authToken,
            plannedCourse.courseId
          );
        }
        return {
          ...enrollment,
          user,
          plannedCourse,
          courseDetails,
        };
      })
    );
    return enrichedEnrollments;
  };

  // Fetch user data after fetching enrollments
  const fetchUserData = async (token, enrollmentData) => {
    try {
      const response = await fetch("http://localhost:3000/api/users", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      const userData = await response.json();
      if (userData.success) {
        fetchPlannedCourses(token, enrollmentData, userData.data);
      } else {
        console.error("Failed to fetch users:", userData.message);
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

  // Fetch planned courses after fetching user data
  const fetchPlannedCourses = async (token, enrollmentData, userData) => {
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
        const enrichedEnrollments = await enrichEnrollmentsWithUsersAndCourses(
          enrollmentData,
          userData,
          plannedCourseData.data
        );
        fetchReports(token, enrichedEnrollments);
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

  // Fetch reports after fetching planned courses
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
        const enrichedWithReports = enrichedEnrollments.map((enrollment) => {
          const report = reportData.data.find(
            (report) => report.reportId === enrollment.reportId
          );
          if (report) {
            return { ...enrollment, report };
          }
          return enrollment;
        });
        setEnrollments(enrichedWithReports);
      } else {
        console.error("Failed to fetch reports:", reportData.message);
      }
    } catch (error) {
      console.error("Error fetching reports:", error);
    }
  };

  // Fetch course details for the given courseId
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
          evaluationRemark:"",
        };

        // Add the field value (e.g., 'criteriaA', 'criteriaB', etc.)
        newEvaluation[field] = value;

        return [...prevEvaluations, newEvaluation]; // Return the updated evaluations with the new evaluation
      }
    });
  };
  const handleCommitChanges = async () => {
    const token = authToken || localStorage.getItem("token");
  
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
          evaluationRemark,
        } = evaluation;
  
        const formattedDate = new Date(dateOfEvaluation).toISOString().split("T")[0];
  
        // Prepare data to send, only including fields that have changed or are non-zero
        const dataToSubmit = {};
  
        if (criteriaA !== "0") dataToSubmit.criteriaA = criteriaA;
        if (criteriaB !== "0") dataToSubmit.criteriaB = criteriaB;
        if (criteriaC !== "0") dataToSubmit.criteriaC = criteriaC;
        if (criteriaD !== "0") dataToSubmit.criteriaD = criteriaD;
        if (criteriaE !== "0") dataToSubmit.criteriaE = criteriaE;
        if (criteriaF !== "0") dataToSubmit.criteriaF = criteriaF;
        if (evaluationRemark) dataToSubmit.evaluationRemark = evaluationRemark;
        if (dateOfEvaluation) dataToSubmit.dateOfEvaluation = formattedDate;
  
        // If no fields were changed, skip this evaluation
        if (Object.keys(dataToSubmit).length === 0) {
          continue;
        }
  
        // Send the request to the backend
        const response = await fetch(
          `http://localhost:3000/api/enrollments/${enrollmentId}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(dataToSubmit),
          }
        );
  
        const result = await response.json();
  
        if (result.success) {
          enqueueSnackbar(`Successfully committed evaluation for enrollment ID: ${enrollmentId}`, {
            variant: "success",
          });
        } else {
          console.error(`Failed to commit evaluation for enrollment ID: ${enrollmentId}: ${result.message}`);
        }
      }
  
      setUpdatedEvaluations([]);  // Clear the updated evaluations list
      fetchEnrollments(token);  // Fetch enrollments again after commit
  
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
    const handleSearchChange = (e) => {
      setSearchQuery(e.target.value);
    };
    const handleEditChanges = () => {
      if (isEditMode) {
        // When leaving edit mode, reset the updated evaluations to null values or empty
        setUpdatedEvaluations([]);

        
      }
    
      // Toggle the edit mode
      setIsEditMode((prevMode) => !prevMode);
    };
    useEffect(() => {
      if (isEditMode && enrollments.length > 0) {
        // Ensure `updatedEvaluations` is populated with backend values when entering edit mode
        const evaluations = enrollments.map((enrollment) => {
          return {
            enrollmentId: enrollment.enrollmentId,
            plannedCourseId: enrollment.plannedCourseId,
            criteriaA: enrollment.criteriaA || null,
            criteriaB: enrollment.criteriaB || null,
            criteriaC: enrollment.criteriaC || null,
            criteriaD: enrollment.criteriaD || null,
            criteriaE: enrollment.criteriaE || null,
            criteriaF: enrollment.criteriaF || null,
            evaluationRemark: enrollment.evaluationRemark || null,
            dateOfEvaluation: enrollment.dateOfEvaluation || null,
          };
        });
        setUpdatedEvaluations(evaluations); // Update the `updatedEvaluations` with backend values
      }
    }, [isEditMode, enrollments]); // Trigger the effect when `isEditMode` or `enrollments` change
    
    
  return (
    <div className="eval-container">
      <h2 className="eval-heading">Training Evaluation-2025</h2>
        <div className="eval-upper-container">
        <input
        type="text"
        placeholder="Search by Employee Name"
        value={searchQuery}
        onChange={handleSearchChange}
        className="eval-search-bar"
      />
        <div className="eval-button-container">
        <button className="commit-button" onClick={handleEditChanges}>{isEditMode ? "Cancel Edit" : "Edit Changes"}</button>
        <button className="commit-button" onClick={handleCommitChanges}>Search By Training Topic</button>
        <button className="commit-button" onClick={handleCommitChanges}>Download Report</button>
        <button className="commit-button" onClick={handleCommitChanges}>
          Commit Changes
        </button>
        </div>
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
          {/* // enrollment?.dateOfEvaluation != null && */}
          {console.log(enrollments)}
          {enrollments
          ?.filter(
            (enrollment) =>
              enrollment?.reportId != null &&
              enrollment?.user?.department === filteredUser?.department &&
              (enrollment.user?.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
               enrollment.user?.lastName.toLowerCase().includes(searchQuery.toLowerCase())) && ( (isEditMode && enrollment.dateOfEvaluation != null)|| (!isEditMode && enrollment.dateOfEvaluation == null))
          ).map((enrollment, index) => {
              const actualDate = enrollment.report?.actualDate
                ? new Date(enrollment.report?.actualDate).toLocaleDateString(
                    "en-CA"
                  )
                : "N/A";

              const dueDate = enrollment.report?.dueDate
                ? new Date(enrollment.report?.dueDate).toLocaleDateString(
                    "en-CA"
                  )
                : "N/A";

              const courseName = enrollment.courseDetails?.name || "N/A";
              const trainerName = enrollment.courseDetails?.trainer
                ? `${enrollment.courseDetails.trainer.firstName} ${enrollment.courseDetails.trainer.lastName}`
                : "N/A";

              const trainingDuration =
                enrollment.plannedCourse?.trainingDuration || "N/A";
              const todayDate = new Date().toLocaleDateString("en-CA");

              return (
                <tr key={`${enrollment.user?.userId}-${index}`}>
                  <td className="date-field">{actualDate}</td>
                  <td className="date-field">{dueDate}</td>
                  <td>{courseName}</td>
                  <td>{`${enrollment.user?.firstName} ${enrollment.user?.lastName}`}</td>
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
                    {isEditMode ? (
                      // In edit mode, show the value from updatedEvaluations (if available)
                      <input
                        className="large-input"
                        type="number"
                        min="0"
                        max="4"
                        value={
                          updatedEvaluations.find(
                            (evaluation) =>
                              evaluation.enrollmentId === enrollment.enrollmentId &&
                              evaluation.plannedCourseId === enrollment.plannedCourseId
                          )?.[grade] || "" // Empty string if no updated value exists
                        }
                        onChange={(e) =>
                          handleInputChange(
                            enrollment.enrollmentId,
                            enrollment.plannedCourse.plannedCourseId,
                            grade,
                            e.target.value
                          )
                        }
                      />
                    ) : (
                      // In normal mode, leave the input field empty (no pre-filled value)
                      <input
                        className="large-input"
                        type="number"
                        min="0"
                        max="4"
                        value={enrollment.grade} // Empty value in normal mode
                        onChange={(e) =>
                          handleInputChange(
                            enrollment.enrollmentId,
                            enrollment.plannedCourse.plannedCourseId,
                            grade,
                            e.target.value
                          )
                        }
                      />
                    )}
                  </td>
                  ))}

                  <td className="remark-field">
                    <input
                      type="text"
                      defaultValue={enrollment.evaluationRemark || ""}
                      onChange={(e) =>
                        handleInputChange(
                          enrollment.enrollmentId,
                          enrollment.plannedCourse.plannedCourseId,
                          "evaluationRemark",
                          e.target.value
                        )
                      }
                      className="eval-remark-text-field"
                    />
                  </td>
                  <td className="date-field">{todayDate}</td>
                </tr>
              );
            })}
        </tbody>
      </table>
    </div>
  );
};

export default TrainingTable1;
