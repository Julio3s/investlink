import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/layout/Navbar';
import MobileBottomNav from './components/layout/MobileBottomNav';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Projects from './pages/Projects';
import ProjectDetail from './pages/ProjectDetail';
import CreateProject from './pages/CreateProject';
import MyProjects from './pages/MyProjects';
import Messages from './pages/Messages';
import Profile from './pages/Profile';
import Admin from './pages/Admin';
import Notifications from './pages/Notifications';

const PrivateRoute = ({ children, roles }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />;
  return children;
};

function AppRoutes() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/projects" element={<Projects />} />
        <Route path="/projects/new" element={
          <PrivateRoute roles={['porteur']}>
            <CreateProject />
          </PrivateRoute>
        } />
        <Route path="/projects/:id/edit" element={
          <PrivateRoute roles={['porteur']}>
            <CreateProject />
          </PrivateRoute>
        } />
        <Route path="/projects/:id" element={<ProjectDetail />} />

        <Route path="/create-project" element={
          <PrivateRoute roles={['porteur']}>
            <CreateProject />
          </PrivateRoute>
        } />
        <Route path="/my-projects" element={
          <PrivateRoute roles={['porteur']}>
            <MyProjects />
          </PrivateRoute>
        } />
        <Route path="/messages" element={
          <PrivateRoute>
            <Messages />
          </PrivateRoute>
        } />
        <Route path="/messages/:conversationId" element={
          <PrivateRoute>
            <Messages />
          </PrivateRoute>
        } />
        <Route path="/profile" element={
          <PrivateRoute>
            <Profile />
          </PrivateRoute>
        } />
        <Route path="/notifications" element={
          <PrivateRoute>
            <Notifications />
          </PrivateRoute>
        } />
        <Route path="/admin" element={
          <PrivateRoute roles={['admin']}>
            <Admin />
          </PrivateRoute>
        } />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <MobileBottomNav />
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: '#1e2535',
              color: '#e8ecf4',
              border: '1px solid #2a3348',
              borderRadius: '10px',
            },
            success: { iconTheme: { primary: '#10b981', secondary: '#1e2535' } },
            error: { iconTheme: { primary: '#ef4444', secondary: '#1e2535' } },
          }}
        />
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
