import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import Landing from '@/pages/Landing';
import Login from '@/pages/Login';
import ProtectedRoute from '@/components/ProtectedRoute';
import AppLayout from '@/components/layout/AppLayout';
import Dashboard from '@/pages/painel/Dashboard';
import Meninas from '@/pages/painel/Meninas';
import Familias from '@/pages/painel/Familias';
import Reunioes from '@/pages/painel/Reunioes';
import Admin from '@/pages/painel/Admin';
import EmBreve from '@/pages/painel/EmBreve';

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

          <Route
            path="/painel"
            element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Dashboard />} />
            <Route path="meninas" element={<Meninas />} />
            <Route path="familias" element={<Familias />} />
            <Route path="presenca" element={<EmBreve titulo="Presença ✍️" descricao="Marcação de presença das meninas em cada encontro." />} />
            <Route path="calendario" element={<EmBreve titulo="Calendário 🗓️" descricao="Encontros, formação dos pais, aniversários." />} />
            <Route path="reunioes" element={<Reunioes />} />
            <Route path="marketing" element={<EmBreve titulo="Marketing 📢" descricao="Essência, calendário editorial, referências, roteiros e identidade visual." />} />
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
