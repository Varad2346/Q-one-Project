import React, { useEffect, useState } from "react";
import "./TrainingCalendar.css";
import { useAuth } from "../../store/auth";
import html2pdf from "html2pdf.js"; // Import html2pdf

const TrainingCalendar = () => {
  const { authToken } = useAuth();

  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  const [categories, setCategories] = useState([]);
  const [courses, setCourses] = useState([]);
  const [attendanceData, setAttendanceData] = useState([]);
  const [userCourses, setUserCourses] = useState([]);

  useEffect(() => {
    if (!authToken) {
      console.error("No authorization token found.");
      return;
    }

    const fetchCategories = async () => {
      try {
        const categoryResponse = await fetch(
          "http://localhost:3000/api/courseCategory",
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${authToken}`,
            },
          }
        );

        if (!categoryResponse.ok) {
          throw new Error("Failed to fetch course categories");
        }

        const categoryData = await categoryResponse.json();
        setCategories(categoryData);
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };

    fetchCategories();
  }, [authToken]);

  useEffect(() => {
    if (categories.length === 0) return;

    const fetchCourses = async () => {
      const allCourses = [];

      for (let category of categories) {
        try {
          const courseResponse = await fetch(
            `http://localhost:3000/api/courses/${category.categoryId}`,
            {
              method: "GET",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${authToken}`,
              },
            }
          );

          if (!courseResponse.ok) {
            throw new Error(
              `Failed to fetch courses for category ${category.categoryId}`
            );
          }

          const courseData = await courseResponse.json();
          allCourses.push(...courseData);
        } catch (error) {
          console.error("Error fetching courses:", error);
        }
      }

      setCourses(allCourses);
    };

    fetchCourses();
  }, [categories, authToken]);

  useEffect(() => {
    if (courses.length === 0) return;

    const fetchUserCourses = async () => {
      const allUserCourses = [];

      for (let course of courses) {
        console.log(course);
        try {
          const userCourseResponse = await fetch(
            `http://localhost:3000/api/userCourses/course/${course.courseId}`,
            {
              method: "GET",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${authToken}`,
              },
            }
          );

          if (!userCourseResponse.ok) {
            throw new Error(
              `Failed to fetch user courses for course ${course.courseId}`
            );
          }

          const userCourseData = await userCourseResponse.json();
          console.log(userCourseData);
          const validUserCourses = userCourseData[0].Users.filter(
            (user) => user.role.toLowerCase() === "employee"
          );
          console.log(validUserCourses);
          validUserCourses.forEach((user) => {
            const userCourse = user.UserCourse;
            const planMonth = new Date(userCourse.plan_date).getMonth();

            allUserCourses.push({
              courseId: course.courseId,
              courseName: course.courseName,
              userId: user.userId,
              firstName: user.firstName,
              lastName: user.lastName,
              planMonth: months[planMonth],
              planDate: userCourse.plan_date,
              userCourseId: userCourse.userCourseId,
            });
          });
        } catch (error) {
          console.error("Error fetching user courses:", error);
        }
      }

      setUserCourses(allUserCourses);
    };

    fetchUserCourses();
  }, [courses, authToken]);

  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        const attendanceResponse = await fetch(
          "http://localhost:3000/api/attendances",
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${authToken}`,
            },
          }
        );

        if (!attendanceResponse.ok) {
          throw new Error("Failed to fetch attendance data");
        }

        const attendanceData = await attendanceResponse.json();
        setAttendanceData(attendanceData);
      } catch (error) {
        console.error("Error fetching attendance:", error);
      }
    };

    fetchAttendance();
  }, [authToken]);

  const formatDate = (date) => {
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    return `${day}-${month}-${year}`;
  };

  const attendanceMap = attendanceData.reduce((acc, attendance) => {
    acc[attendance.userCourseId] = attendance;
    return acc;
  }, {});

  const groupedUserCourses = userCourses.reduce((acc, course) => {
    const key = `${course.courseId}`;
    if (!acc[key]) {
      acc[key] = {
        courseId: course.courseId,
        courseName: course.courseName,
        users: [],
      };
    }

    acc[key].users.push(course);
    return acc;
  }, {});

  const groupedData = Object.values(groupedUserCourses);

  // Function to trigger the PDF download
  const downloadPDF = () => {
    const element = document.getElementById("training-table"); // Get the table element
    const options = {
      filename: "training-calendar.pdf",
      html2canvas: { scale: 6 },
      jsPDF: { unit: "mm", format: "a3", orientation: "landscape" },
    };
    html2pdf().from(element).set(options).save();
  };

  return (
    <>
    <div className="training-calendar" id="training-table">
      <h2 className="title">Training Calendar - 2025</h2>
     {/* Download button */}
      <div className="table-container" > {/* ID for the table */}
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
            {groupedData.map((data, index) => (
              <React.Fragment key={data.courseId}>
                <tr>
                  <td rowSpan="2">{index + 1}</td>
                  <td rowSpan="2">{data.courseName}</td>
                  {months.map((month, monthIndex) => {
                    const courseInThisMonth = data.users.some(
                      (user) => user.planMonth === month
                    );
                    return (
                      <td key={monthIndex}>
                        {courseInThisMonth
                          ? formatDate(
                              data.users.find(
                                (user) => user.planMonth === month
                              ).planDate
                            )
                          : ""}
                      </td>
                    );
                  })}
                  <td rowSpan="2"></td>
                </tr>
                <tr>
                  {months.map((month, monthIndex) => {
                    const attendanceForMonth = data.users
                      .map((user) => {
                        const attendance = attendanceMap[user.userCourseId];
                        const plannedDate = new Date(user.planDate);
                        const currentDate = new Date();
                        const twoWeeksAfter = new Date(plannedDate);
                        twoWeeksAfter.setDate(plannedDate.getDate() + 14);

                        plannedDate.setHours(0, 0, 0, 0);
                        currentDate.setHours(0, 0, 0, 0);
                        twoWeeksAfter.setHours(0, 0, 0, 0);

                        const attendanceDate = attendance
                          ? new Date(attendance.date)
                          : null;
                        return {
                          user,
                          status:
                            attendance && attendance.status === "Present"
                              ? "present"
                              : attendanceDate &&
                                attendanceDate >= plannedDate &&
                                attendanceDate <= twoWeeksAfter
                              ? "within-14"
                              : "missing",
                          daysDiff: Math.ceil(
                            (currentDate - plannedDate) / (1000 * 3600 * 24)
                          ),
                        };
                      })
                      .find((item) => item.user.planMonth === month);

                    let bgColor = "";
                    if (attendanceForMonth) {
                      if (attendanceForMonth.daysDiff <= 14) {
                        bgColor = "";
                      } else if (attendanceForMonth.daysDiff > 14) {
                        bgColor = "red";
                      }
                    }

                    return (
                      <td key={monthIndex} style={{ backgroundColor: bgColor }}>
                        {attendanceForMonth ? "" : ""}
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
