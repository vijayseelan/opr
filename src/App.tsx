
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import CreateReport from "./pages/CreateReport";
import AllReports from "./pages/AllReports";
import Login from "./pages/Login";
import SignUp from "./pages/SignUp";
import NotFound from "./pages/NotFound";
import TemplateSettings from "./pages/TemplateSettings";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="create-report" element={<CreateReport />} />
          <Route path="edit-report/:id" element={<CreateReport />} />
          <Route path="all-reports" element={<AllReports />} />
          <Route path="template-settings" element={<TemplateSettings />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
