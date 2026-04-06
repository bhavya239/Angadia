import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AppLayout } from './components/layout/AppLayout';
import { ProtectedRoute } from './components/layout/ProtectedRoute';
import { Login } from './pages/Login';
import { Signup } from './pages/Signup';
import { Dashboard } from './pages/Dashboard';
import { PartyList } from './pages/parties/PartyList';
import { TransactionEntry } from './pages/transactions/TransactionEntry';
import { Ledger } from './pages/reports/Ledger';
import { TrialBalance } from './pages/reports/TrialBalance';
import { VatavReport } from './pages/reports/VatavReport';
import { InterestReport } from './pages/reports/InterestReport';
import { UserManagement } from './pages/admin/UserManagement';
import { useSessionManager } from './hooks/useSessionManager';

function SessionWrapper({ children }: { children: React.ReactNode }) {
  useSessionManager();
  return <>{children}</>;
}

function App() {
  return (
    <SessionWrapper>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        
        <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/parties" element={<PartyList />} />
          <Route path="/transactions" element={<TransactionEntry />} />
          <Route path="/reports" element={<Ledger />} />
          <Route path="/reports/trial-balance" element={<TrialBalance />} />
          <Route path="/reports/vatav" element={<VatavReport />} />
          <Route path="/reports/interest" element={<InterestReport />} />
          <Route path="/users" element={<UserManagement />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <Toaster position="top-right" toastOptions={{ duration: 4000 }} />
    </SessionWrapper>
  );
}

export default App;
