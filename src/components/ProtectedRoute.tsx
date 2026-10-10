import { Navigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import type { Cargo } from '@/types/db';

type Props = {
  children: React.ReactNode;
  requireCargo?: Cargo[];
};

export default function ProtectedRoute({ children, requireCargo }: Props) {
  const { profile, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-roxo" />
      </div>
    );
  }

  if (!profile) return <Navigate to="/login" replace />;

  if (requireCargo && !requireCargo.includes(profile.cargo)) {
    return <Navigate to="/painel" replace />;
  }

  return <>{children}</>;
}
