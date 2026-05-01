import { createBrowserRouter } from "react-router"
import { AppLayout } from "./routes/app-layout"
import { RootRoute } from "./routes/root"
import { LoginPage } from "./routes/login"
import { RegisterPage } from "./routes/register"
import { AdminLayout } from "./routes/admin/layout"
import { AdminDashboard } from "@/routes/admin"
import { TeacherLayout } from "./routes/teacher/layout"
import { TeacherDashboard } from "@/routes/teacher"
import { StudentLayout } from "./routes/student/layout"
import { StudentDashboard } from "@/routes/student"

export const router = createBrowserRouter([
  {
    element: <AppLayout />,
    children: [
      {
        path: "/",
        element: <RootRoute />,
      },
      {
        path: "/login",
        element: <LoginPage />,
      },
      {
        path: "/register",
        element: <RegisterPage />,
      },
      {
        path: "/admin",
        element: <AdminLayout />,
        children: [{ index: true, element: <AdminDashboard /> }],
      },
      {
        path: "/teacher",
        element: <TeacherLayout />,
        children: [{ index: true, element: <TeacherDashboard /> }],
      },
      {
        path: "/student",
        element: <StudentLayout />,
        children: [{ index: true, element: <StudentDashboard /> }],
      },
    ],
  },
])
