import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import EventForm from './pages/EventForm';
import EventDetail from './pages/EventDetail';
import Layout from './components/Layout';
import CatalogAdmin from './pages/CatalogAdmin';
import UserAdmin from './pages/UserAdmin';
import VenueAdmin from './pages/VenueAdmin';

const ProtectedRoute = ({ children }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" />;
  return children;
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={
            <ProtectedRoute>
              <Layout>
                <Dashboard />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="/nuevo-evento" element={
            <ProtectedRoute>
              <Layout>
                <EventForm />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="/evento/:id" element={
            <ProtectedRoute>
              <Layout>
                <EventDetail />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="/editar-evento/:id" element={
            <ProtectedRoute>
              <Layout>
                <EventForm />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="/admin/catalogo" element={
            <ProtectedRoute>
              <Layout>
                <CatalogAdmin />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="/admin/recintos" element={
            <ProtectedRoute>
              <Layout>
                <VenueAdmin />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="/admin/usuarios" element={
            <ProtectedRoute>
              <Layout>
                <UserAdmin />
              </Layout>
            </ProtectedRoute>
          } />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
