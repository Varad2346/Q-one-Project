import React, { useEffect, useState } from "react";
import "./TrainingCalendar.css";
import { useAuth } from "../../store/auth";
import html2pdf from "html2pdf.js"; // Import html2pdf

const TrainingCalendar = () => {
  const { authToken } = useAuth();
  const months = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
  ];

  const [plannedCourses, setPlannedCourses] = useState([]); // State for planned courses
  const [newdata, setNewData] = useState([]); // New state to store updated courses with enrollments
  const [reports, setReports] = useState([]); // State to store reports data
  const [loading, setLoading] = useState(true); // State for loading indication

  useEffect(() => {
    if (!authToken) {
      console.error("No authorization token found.");
      return;
    }

    const fetchPlannedCourses = async () => {
      try {
        const plannedCoursesResponse = await fetch(
          "http://localhost:3000/api/planned-courses/",
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${authToken}`,
            },
          }
        );

        if (!plannedCoursesResponse.ok) {
          throw new Error("Failed to fetch planned courses");
        }

        const plannedCoursesData = await plannedCoursesResponse.json();
        const allPlannedCourses = [];

        // Fetch course details for each planned course
        for (const plannedCourse of plannedCoursesData.data) {
          const courseResponse = await fetch(
            `http://localhost:3000/api/courses/courseId/${plannedCourse.courseId}`,
            {
              method: "GET",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${authToken}`,
              },
            }
          );

          if (!courseResponse.ok) {
            throw new Error("Failed to fetch course details");
          }

          const courseData = await courseResponse.json();

          // Add the course name to the planned course data
          allPlannedCourses.push({
            plannedCourseId: plannedCourse.plannedCourseId,
            courseId: plannedCourse.courseId,
            courseName: courseData.data.name, // course name from the course API
            plannedDate: plannedCourse.plannedDate,
            enrollments: [], // Initialize enrollments as empty
            plannedDates: plannedCourse.plannedDates || [], // Ensure it's always an array
          });
        }

        // Update state after courses are fetched
        setPlannedCourses(allPlannedCourses);

        // Now, fetch enrollments only after planned courses are set
        fetchEnrollments(allPlannedCourses);

        // Fetch reports data
        fetchReports();

      } catch (error) {
        console.error("Error fetching planned courses:", error);
        setLoading(false); // End loading state in case of error
      }
    };

    const fetchEnrollments = async (courses) => {
      try {
        const enrollmentsResponse = await fetch(
          "http://localhost:3000/api/enrollments",
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${authToken}`,
            },
          }
        );

        if (!enrollmentsResponse.ok) {
          throw new Error("Failed to fetch enrollments");
        }

        const enrollmentsData = await enrollmentsResponse.json();

        // Map enrollments to the respective planned courses
        const updatedPlannedCourses = [...courses]; // Make a copy of planned courses to avoid direct mutation

        enrollmentsData.data.forEach(enrollment => {
          const courseIndex = updatedPlannedCourses.findIndex(
            course => course.plannedCourseId === enrollment.plannedCourseId
          );

          if (courseIndex !== -1) {
            updatedPlannedCourses[courseIndex].enrollments.push(enrollment);
          }
        });

        // Update new data after enrollments are fetched
        setNewData(updatedPlannedCourses);
        setLoading(false); // End loading state after data is fetched
      } catch (error) {
        console.error("Error fetching enrollments:", error);
        setLoading(false); // End loading state in case of error
      }
    };

    const fetchReports = async () => {
      try {
        const reportsResponse = await fetch(
          "http://localhost:3000/api/reports/",
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${authToken}`,
            },
          }
        );

        if (!reportsResponse.ok) {
          throw new Error("Failed to fetch reports");
        }

        const reportsData = await reportsResponse.json();
        setReports(reportsData.data); // Set the reports data
      } catch (error) {
        console.error("Error fetching reports:", error);
        setLoading(false); // End loading state in case of error
      }
    };

    fetchPlannedCourses();
  }, [authToken]); // Only run effect when authToken changes

  const formatDate = (date) => {
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    return `${day}-${month}-${year}`;
  };

  const groupedData = newdata.reduce((acc, course) => {
    const key = `${course.courseId}`;
    if (!acc[key]) {
      acc[key] = {
        courseId: course.courseId,
        courseName: course.courseName,
        plannedDates: [],
        enrollments: []
      };
    }

    acc[key].plannedDates.push(course.plannedDate);
    acc[key].enrollments.push(...course.enrollments); // Add enrollments
    return acc;
  }, {});

  const groupedCourses = Object.values(groupedData);

  const checkReportStatus = (plannedDate, reportId) => {
    const plannedDateObj = new Date(plannedDate);
    const currentDate = new Date();

    const diffTime = currentDate - plannedDateObj;
    const diffDays = diffTime / (1000 * 60 * 60 * 24); // Convert milliseconds to days

    const report = reports.find(r => r.reportId === reportId); // Find the report using reportId

    if (diffDays < 14 && report) {
      const actualDate = report.actualDate ? new Date(report.actualDate) : null;
      return { color: "green", actualDate: actualDate ? formatDate(actualDate) : "No Actual Date" }; // Show actual date if available
    } else if (diffDays < 14) {
      return { color: "", actualDate: "" }; // no report
    } else {
      return { color: "red", actualDate: "" }; // red if more than 14 days and no report
    }
  };

  const downloadPDF = () => {
    const element = document.getElementById("training-table");
    const options = {
      filename: "training-calendar.pdf",
      html2canvas: { scale: 6 },
      jsPDF: { unit: "mm", format: "a3", orientation: "landscape" },
    };
    html2pdf().from(element).set(options).save();
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <div className="training-calendar" id="training-table">
        <h2 className="title">Training Calendar - 2025</h2>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th style={{ width: 1 }}>SR. No.</th>
                <th style={{ width: 1 }}>TRAINING PROGRAM DETAILS</th>
                {months.map((month, index) => (
                  <th key={index}>{month}</th>
                ))}
                <th>Remark</th>
              </tr>
            </thead>
            <tbody>
              {groupedCourses.map((course, index) => (
                <React.Fragment key={course.courseId}>
                  <tr>
                    <td rowSpan="2">{index + 1}</td>
                    <td rowSpan="2">{course.courseName}</td>
                    {months.map((month, monthIndex) => {
                      const courseInThisMonth = Array.isArray(course.plannedDates) && course.plannedDates.some(
                        (plannedDate) => new Date(plannedDate).getMonth() === monthIndex
                      );
                      return (
                        <td key={monthIndex}>
                          {courseInThisMonth
                            ? formatDate(course.plannedDates.find(
                                (plannedDate) => new Date(plannedDate).getMonth() === monthIndex
                              ))
                            : ""}
                        </td>
                      );
                    })}
                    <td rowSpan="2"></td>
                  </tr>
                  <tr>
                    {months.map((month, monthIndex) => {
                      const plannedCourseForMonth = course.plannedDates.find(
                        (plannedDate) => new Date(plannedDate).getMonth() === monthIndex
                      );
                      let bgColor = "";
                      let actualDate = "";
                      if (plannedCourseForMonth) {
                        const enrollment = course.enrollments.find(
                          (enrollment) => enrollment.reportId
                        );
                        const { color, actualDate: reportDate } = checkReportStatus(plannedCourseForMonth, enrollment?.reportId);
                        bgColor = color;
                        actualDate = reportDate;
                      }

                      return (
                        <td key={monthIndex} style={{ backgroundColor: bgColor }}>
                          {actualDate && <div>{actualDate}</div>}
                        </td>
                      );
                    })}
                  </tr>
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <button onClick={downloadPDF}>Download PDF</button>
    </>
  );
};

export default TrainingCalendar;
