import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import Landing from '@/pages/Landing';
import Login from '@/pages/Login';
import Autocadastro from '@/pages/Autocadastro';
import ProtectedRoute from '@/components/ProtectedRoute';
import AppLayout from '@/components/layout/AppLayout';
import Dashboard from '@/pages/painel/Dashboard';
import Meninas from '@/pages/painel/Meninas';
import Familias from '@/pages/painel/Familias';
import ListaEspera from '@/pages/painel/ListaEspera';
import Reunioes from '@/pages/painel/Reunioes';
import Presenca from '@/pages/painel/Presenca';
import Calendario from '@/pages/painel/Calendario';
import Marketing from '@/pages/painel/Marketing';
import Admin from '@/pages/painel/Admin';

const queryClient = new QueryClient({
  defaultOptions: { queries: { refetchOnWindowFocus: false, staleTime: 30_000 } },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/landing" element={<Navigate to="/" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/autocadastro" element={<Autocadastro />} />

          <Route
            path="/painel"
            element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Dashboard />} />
            <Route path="lista-espera" element={<ListaEspera />} />
            <Route path="meninas" element={<Meninas />} />
            <Route path="familias" element={<Familias />} />
            <Route path="presenca" element={<Presenca />} />
            <Route path="calendario" element={<Calendario />} />
            <Route path="reunioes" element={<Reunioes />} />
            <Route path="marketing" element={<Marketing />} />
            <Route
              path="admin"
              element={
                <ProtectedRoute requireCargo={['diretora']}>
                  <Admin />
                </ProtectedRoute>
              }
            />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
      <Toaster position="top-right" />
    </QueryClientProvider>
  );
}
