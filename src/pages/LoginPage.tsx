// Login Page - Hextech styled authentication
import type { FormEvent } from 'react';
import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { HextechButton, HextechCard, HextechInput } from '../components/hextech';
import { signIn, parseAuthError } from '../services/auth/authService';
import logo from '../assets/logo.png';

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Get the intended destination from ProtectedRoute redirect
  const from = (location.state as { from?: string })?.from || '/home';

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    handleLogin(email, password);
  };

  const handleLogin = async (emailAuth: string, passwordAuth: string) => {
    setError('');
    setLoading(true);

    try {
      await signIn(emailAuth, passwordAuth);
      // Navigate to intended destination after successful login
      navigate(from, { replace: true });
    } catch (err) {
      const authError = parseAuthError(err);
      setError(authError.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setError('');
    setLoading(true);
    try {
      await signIn('demo@academia-challengers.com', 'DemoChallenger2026!');
      // Demo login always goes to dashboard
      navigate('/home', { replace: true });
    } catch (err) {
      const authError = parseAuthError(err);
      setError(authError.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-hextech-black flex items-center justify-center px-4 py-12">
      {/* Background effects */}
      <div className="absolute inset-0 bg-gradient-to-b from-hextech-blue/30 via-hextech-black to-hextech-black" />
      <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-cyan-500/5 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-hextech-gold/5 rounded-full blur-3xl" />

      <div className="relative z-10 w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-block group">
            <img 
              src={logo} 
              alt="Academia Challengers" 
              className="w-24 h-24 mx-auto mb-4 object-contain rounded-full group-hover:scale-110 transition-transform duration-300"
            />
            <h1 className="text-2xl font-bold text-hextech-gold group-hover:text-hextech-gold-light transition-colors">
              Academia para Challengers
            </h1>
          </Link>
        </div>

        <HextechCard variant="gradient">
          <h2 className="text-xl font-bold text-center text-hextech-gold mb-6">
            Iniciar Sesión
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <HextechInput
              label="Email"
              type="email"
              placeholder="tu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <HextechInput
              label="Contraseña"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            {error && (
              <div className="p-3 rounded bg-red-500/10 border border-red-500/30">
                <p className="text-red-400 text-sm text-center">{error}</p>
              </div>
            )}

            <HextechButton
              type="submit"
              variant="primary"
              size="lg"
              loading={loading}
              className="w-full mt-6"
            >
              Entrar a la Grieta
            </HextechButton>
            
            <div className="relative flex py-2 items-center">
              <div className="flex-grow border-t border-hextech-gold/20"></div>
              <span className="flex-shrink-0 mx-4 text-hextech-gold/50 text-xs">O</span>
              <div className="flex-grow border-t border-hextech-gold/20"></div>
            </div>

            <button
              type="button"
              onClick={handleDemoLogin}
              disabled={loading}
              className="w-full py-3 px-4 bg-cyan-900/30 hover:bg-cyan-900/50 border border-cyan-500/30 text-cyan-400 font-semibold rounded transition-all flex items-center justify-center gap-2 group"
            >
              <span className="text-xl group-hover:scale-110 transition-transform">🎮</span>
              Probar Demo (Invitado)
            </button>
          </form>

          <p className="text-center text-gray-400 mt-6">
            ¿No tienes cuenta?{' '}
            <Link to="/register" className="text-hextech-gold hover:text-amber-400 transition-colors">
              Regístrate
            </Link>
          </p>
        </HextechCard>

        <p className="text-center text-gray-500 text-sm mt-8">
          <Link to="/" className="hover:text-hextech-gold transition-colors">
            ← Volver al inicio
          </Link>
        </p>
      </div>
    </div>
  );
}
