import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

export default function PageNotFound() {
  const location = useLocation();
  const navigate = useNavigate();
  const pageName = location.pathname.replace('/', '') || 'Unknown';

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-slate-300 mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-slate-700 mb-2">Page Not Found</h2>
        <p className="text-slate-500 mb-6">The page "{pageName}" doesn't exist.</p>
        <Button onClick={() => navigate('/')} className="bg-amber-500 hover:bg-amber-600">
          Go Home
        </Button>
      </div>
    </div>
  );
}
