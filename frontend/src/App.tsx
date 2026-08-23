import { Navigate, Route, Routes } from 'react-router-dom';
import CustomerHome from './pages/CustomerHome';
import MerchantDashboard from './pages/MerchantDashboard';
import DriverDashboard from './pages/DriverDashboard';
import AdminDashboard from './pages/AdminDashboard';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<CustomerHome />} />
      <Route path="/merchant" element={<MerchantDashboard />} />
      <Route path="/driver" element={<DriverDashboard />} />
      <Route path="/admin" element={<AdminDashboard />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
