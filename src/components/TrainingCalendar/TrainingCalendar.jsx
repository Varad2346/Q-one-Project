import React, { useEffect, useState } from "react";
import "./TrainingCalendar.css";
import { useAuth } from "../../store/auth";
// import { formatDate } from "../../utils/dateUtils"; // Utility function for date formatting

const TrainingCalendar = () => {
  const { authToken } = useAuth();
  const [courseData, setCourseData] = useState([]); // State to hold course data with planned dates, enrollments, and reports
  const [loading, setLoading] = useState(true); // Loading state for API calls
  const [groupedCourses, setGroupedCourses] = useState([]); // New state for grouped courses





  const months = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
  ]; // Month array

  // Fetch planned courses data
  useEffect(() => {
    if (!authToken) {
      console.error("No authorization token found.");
      return;
    }

    const fetchData = async () => {
      try {
        // Fetch planned courses
        const plannedCoursesResponse = await fetch("http://localhost:3000/api/planned-courses/", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`,
          },
        });

        if (!plannedCoursesResponse.ok) {
          throw new Error("Failed to fetch planned courses");
        }

        const plannedCoursesData = await plannedCoursesResponse.json();
        const plannedCourses = plannedCoursesData.data.map((course) => ({
          courseId: course.courseId,
          plannedCourseId: course.plannedCourseId,
          plannedDate: course.plannedDate,
          status: course.status,
        }));

        // Fetch course details for each planned course
        const courseDetailsPromises = plannedCourses.map(async (course) => {
          const courseResponse = await fetch(`http://localhost:3000/api/courses/courseId/${course.courseId}`, {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${authToken}`,
            },
          });

          if (!courseResponse.ok) {
            throw new Error(`Failed to fetch course details for courseId ${course.courseId}`);
          }

          const courseData = await courseResponse.json();
          const courseName = courseData.data.name;

          return {
            ...course,
            courseName,
          };
        });

        const coursesWithDetails = await Promise.all(courseDetailsPromises);

        // Fetch enrollments for each course
        const enrollmentsResponse = await fetch("http://localhost:3000/api/enrollments", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`,
          },
        });

        if (!enrollmentsResponse.ok) {
          throw new Error("Failed to fetch enrollments");
        }

        const enrollmentsData = await enrollmentsResponse.json();

        // Add enrollments and dateOfEvaluation to courses
        const updatedCourses = coursesWithDetails.map((course) => {
          const enrollments = enrollmentsData.data.filter(
            (enrollment) => enrollment.plannedCourseId === course.plannedCourseId
          );

          // Check if any enrollment has a dateOfEvaluation
          const dateOfEvaluation = enrollments.some((enrollment) => enrollment.dateOfEvaluation)
            ? enrollments[0].dateOfEvaluation // Get the first enrollment's dateOfEvaluation
            : null;

          return { ...course, enrollments, dateOfEvaluation };
        });

        // Fetch reports data
        const reportsResponse = await fetch("http://localhost:3000/api/reports/", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`,
          },
        });

        if (!reportsResponse.ok) {
          throw new Error("Failed to fetch reports");
        }

        const reportsData = await reportsResponse.json();

        // Add report details to enrollments (only the first enrollment per course)
        const finalCourses = updatedCourses.map((course) => {
          course.enrollments.forEach((enrollment, index) => {
            if (index === 0) {
              const report = reportsData.data.find((report) => report.reportId === enrollment.reportId);
              if (report) {
                course.reportDetails = {
                  reportId: report.reportId,
                  actualDate: report.actualDate,
                  dueDate: report.dueDate,
                };
              }
            }
          });
          return course;
        });

        setCourseData(finalCourses);
        setLoading(false); // Set loading to false after all data is fetched

      } catch (error) {
        console.error("Error fetching data:", error);
        setLoading(false); // Set loading to false on error
      }
    };

    fetchData();
  }, [authToken]);

  const formatDate = (date) => {
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    return `${day}-${month}-${year}`;
  };

  // Function to download the table as a PDF
  const downloadPDF = () => {
    const element = document.getElementById("training-table");
    const options = {
      filename: "training-calendar.pdf",
      html2canvas: { scale: 6 },
      jsPDF: { unit: "mm", format: "a3", orientation: "landscape" },
    };
    html2pdf().from(element).set(options).save();
  };

  // Helper function to calculate days difference between two dates
  const getDaysDifference = (date1, date2) => {
    const diffTime = new Date(date1) - new Date(date2);
    return Math.floor(diffTime / (1000 * 60 * 60 * 24)); // Return difference in days
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
              {console.log(courseData)}
              {courseData.map((course, index) => (
                <React.Fragment key={course.plannedCourseId}>
                  
                  <tr>
                    <td rowSpan="2">{index + 1}</td>
                    <td rowSpan="2">{course.courseName}</td>
                    {months.map((month, monthIndex) => {
                      const plannedDate = new Date(course.plannedDate);
                      const dateOfEvaluationExists = course.dateOfEvaluation && plannedDate.getMonth() === monthIndex;

                      // Get the report dueDate and check if the difference is greater than 14
                      const reportDueDate = course.reportDetails ? course.reportDetails.dueDate : null;
                      const dueDateExists = reportDueDate && new Date(reportDueDate).getMonth() === monthIndex;
                      const daysDifference = dueDateExists
                        ? getDaysDifference(new Date(), reportDueDate)
                        : 0;

                      const showOrangeBackground =
                        !course.dateOfEvaluation && dueDateExists && daysDifference > 14;

                      return (
                        <td
                          key={monthIndex}
                          style={{
                            backgroundColor: dateOfEvaluationExists
                              ? "yellow"
                              : showOrangeBackground
                              ? "orange"
                              : "",
                          }}
                        >
                          {dateOfEvaluationExists && !showOrangeBackground
                            ? formatDate(course.dateOfEvaluation)
                            : plannedDate.getMonth() === monthIndex && !showOrangeBackground
                            ? formatDate(course.plannedDate)
                            : ""}
                        </td>
                      );
                    })}
                    <td rowSpan="2"><input type="text" /></td>
                  </tr>
                  <tr>
                    {/* Second row: Check if reportDetails and plannedDate exist */}
                    {months.map((month, monthIndex) => {
                      const reportExists = course.reportDetails && course.reportDetails.actualDate;
                      const plannedDateExists = new Date(course.plannedDate).getMonth() === monthIndex;
                      const plannedDate = new Date(course.plannedDate);
                      const daysDifference = Math.floor((new Date() - plannedDate) / (1000 * 60 * 60 * 24));

                      const showRedBackground = !reportExists && plannedDateExists && daysDifference > 14;

                      return (
                        <td
                          key={monthIndex}
                          style={{
                            backgroundColor:
                              reportExists && plannedDateExists
                                ? "lightgreen"
                                : showRedBackground
                                ? "red"
                                : "",
                          }}
                        >
                          {/* Display the planned date if it exists */}
                          {reportExists && plannedDateExists
                            ? formatDate(course.reportDetails.actualDate)
                            : ""}
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
