import logo from '../assets/logo.png';

import type { FormEvent } from 'react';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { HextechButton, HextechCard, HextechInput } from '../components/hextech';
import { signUp, parseAuthError } from '../services/auth/authService';

export default function RegisterPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    setLoading(true);

    try {
      await signUp(email, password);
      navigate('/home');
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
      <div className="absolute top-1/3 right-1/4 w-64 h-64 bg-cyan-500/5 rounded-full blur-3xl" />
      <div className="absolute bottom-1/3 left-1/4 w-96 h-96 bg-hextech-gold/5 rounded-full blur-3xl" />

      <div className="relative z-10 w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-block group">
            <img 
              src={logo} 
              alt="Academia Challengers" 
              className="w-20 h-20 mx-auto mb-4 object-contain rounded-full group-hover:scale-110 transition-transform duration-300"
            />
            <h1 className="text-2xl font-bold text-hextech-gold group-hover:text-hextech-gold-light transition-colors">
              Academia para Challengers
            </h1>
          </Link>
        </div>

        <HextechCard variant="gradient">
          <h2 className="text-xl font-bold text-center text-hextech-gold mb-2">
            Únete a la Academia
          </h2>
          <p className="text-center text-gray-400 text-sm mb-6">
            Tu viaje hacia Challenger comienza aquí
          </p>

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
              placeholder="Mínimo 6 caracteres"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <HextechInput
              label="Confirmar Contraseña"
              type="password"
              placeholder="Repite tu contraseña"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
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
              Crear Cuenta
            </HextechButton>
          </form>

          <p className="text-center text-gray-400 mt-6">
            ¿Ya tienes cuenta?{' '}
            <Link to="/login" className="text-hextech-gold hover:text-amber-400 transition-colors">
              Inicia sesión
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
