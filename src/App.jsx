import { RouterProvider } from "react-router"
import { Toaster } from "sonner"
import { router } from "./app.routes.jsx"
import { AuthProvider } from "./features/auth/auth.context.jsx"
import { InterviewProvider } from "./features/interview/interview.context.jsx"

function App() {
  return (
    <AuthProvider>
      <InterviewProvider>
        <RouterProvider router={router} />
        <Toaster
          position="top-right"
          theme="dark"
          richColors
          closeButton
        />
      </InterviewProvider>
    </AuthProvider>
  )
}

export default App
