import React, { useState } from 'react';
import { 
  Headphones, 
  Lock, 
  Mail, 
  User as UserIcon, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  ShieldCheck, 
  AlertCircle, 
  CheckCircle2, 
  Sparkles,
  KeyRound,
  Info
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const LoginScreen: React.FC = () => {
  const { signIn, signUp, resetPassword } = useAuth();
  const [isRegistering, setIsRegistering] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<'admin' | 'supervisor' | 'auditor'>('supervisor');

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const formatFirebaseError = (error: any): string => {
    const code = error?.code || '';
    switch (code) {
      case 'auth/invalid-email':
        return 'El formato de correo electrónico no es válido.';
      case 'auth/user-disabled':
        return 'Este usuario ha sido deshabilitado.';
      case 'auth/user-not-found':
      case 'auth/wrong-password':
      case 'auth/invalid-credential':
        return 'Credenciales incorrectas. Verifique su correo y contraseña.';
      case 'auth/email-already-in-use':
        return 'Este correo electrónico ya está registrado. Intente iniciar sesión.';
      case 'auth/operation-not-allowed':
        return 'El proveedor de autenticación con correo y contraseña debe ser habilitado en la consola de Firebase (Authentication > Sign-in method).';
      case 'auth/weak-password':
        return 'La contraseña debe tener al menos 6 caracteres.';
      case 'auth/too-many-requests':
        return 'Demasiados intentos fallidos. Intente nuevamente en unos minutos.';
      default:
        return error?.message || 'Ocurrió un error al procesar la solicitud.';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!email.trim()) {
      setErrorMessage('Por favor ingrese su correo electrónico.');
      return;
    }

    if (isForgotPassword) {
      try {
        setLoading(true);
        await resetPassword(email);
        setSuccessMessage('Se ha enviado un enlace de recuperación a su correo electrónico.');
      } catch (err: any) {
        setErrorMessage(formatFirebaseError(err));
      } finally {
        setLoading(false);
      }
      return;
    }

    if (!password) {
      setErrorMessage('Por favor ingrese su contraseña.');
      return;
    }

    if (isRegistering && !name.trim()) {
      setErrorMessage('Por favor ingrese su nombre y apellido.');
      return;
    }

    try {
      setLoading(true);
      if (isRegistering) {
        await signUp(email, password, name, role);
      } else {
        await signIn(email, password);
      }
    } catch (err: any) {
      setErrorMessage(formatFirebaseError(err));
    } finally {
      setLoading(false);
    }
  };

  const handleDemoCredentials = async () => {
    const demoEmail = 'auditor.demo@expresso.netmobile.com';
    const demoPass = 'Expresso2026!';
    setEmail(demoEmail);
    setPassword(demoPass);
    setName('Supervisor Auditor Netmobile');
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      setLoading(true);
      // Try sign in first
      try {
        await signIn(demoEmail, demoPass);
      } catch (signInErr: any) {
        if (signInErr?.code === 'auth/invalid-credential' || signInErr?.code === 'auth/user-not-found') {
          // Create account if not exists
          await signUp(demoEmail, demoPass, 'Supervisor Auditor Netmobile', 'admin');
        } else {
          throw signInErr;
        }
      }
    } catch (err: any) {
      setErrorMessage(formatFirebaseError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#0b0c10] flex items-center justify-center p-4 selection:bg-indigo-500 selection:text-white relative overflow-hidden">
      {/* Background Decorative Gradients */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[350px] bg-indigo-600/10 blur-[130px] rounded-full pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-[300px] h-[300px] bg-emerald-600/5 blur-[100px] rounded-full pointer-events-none" />

      <div className="w-full max-w-md bg-[#13131a] border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl relative z-10">
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-13 h-13 rounded-2xl bg-gradient-to-tr from-indigo-600 to-indigo-500 p-0.5 shadow-lg shadow-indigo-500/20 mb-3.5 flex items-center justify-center">
            <div className="w-full h-full bg-[#13131a] rounded-[14px] flex items-center justify-center">
              <Headphones className="w-6 h-6 text-indigo-400" />
            </div>
          </div>
          <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            Call Center Expresso
            <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-medium">
              Netmobile
            </span>
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-xs">
            Sistema de Auditoría CDR, Tiempos Muertos y Control Operativo
          </p>
        </div>

        {/* Auth Mode Tabs */}
        {!isForgotPassword && (
          <div className="grid grid-cols-2 p-1 bg-[#1a1a24] rounded-xl mb-6 border border-slate-800/80">
            <button
              type="button"
              onClick={() => {
                setIsRegistering(false);
                setErrorMessage(null);
                setSuccessMessage(null);
              }}
              className={`py-2 text-xs font-semibold rounded-lg transition-all ${
                !isRegistering
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Iniciar Sesión
            </button>
            <button
              type="button"
              onClick={() => {
                setIsRegistering(true);
                setErrorMessage(null);
                setSuccessMessage(null);
              }}
              className={`py-2 text-xs font-semibold rounded-lg transition-all ${
                isRegistering
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Registrarse
            </button>
          </div>
        )}

        {/* Feedback Messages */}
        {errorMessage && (
          <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-start gap-2.5 text-xs text-rose-400 animate-in fade-in duration-200">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <div className="flex-1">{errorMessage}</div>
          </div>
        )}

        {successMessage && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-start gap-2.5 text-xs text-emerald-400 animate-in fade-in duration-200">
            <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
            <div className="flex-1">{successMessage}</div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {isForgotPassword && (
            <div className="mb-2">
              <h2 className="text-sm font-semibold text-white mb-1">Recuperar Contraseña</h2>
              <p className="text-xs text-slate-400">
                Ingrese el correo de su cuenta para recibir instrucciones de restablecimiento.
              </p>
            </div>
          )}

          {isRegistering && !isForgotPassword && (
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Nombre y Cargo
              </label>
              <div className="relative">
                <UserIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ej. Juan Pérez (Supervisor)"
                  className="w-full bg-[#1a1a24] border border-slate-800 rounded-xl pl-10 pr-3 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Correo Electrónico
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="usuario@expresso.netmobile.com"
                className="w-full bg-[#1a1a24] border border-slate-800 rounded-xl pl-10 pr-3 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>
          </div>

          {!isForgotPassword && (
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-medium text-slate-300">
                  Contraseña
                </label>
                {!isRegistering && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsForgotPassword(true);
                      setErrorMessage(null);
                      setSuccessMessage(null);
                    }}
                    className="text-[11px] text-indigo-400 hover:text-indigo-300 hover:underline"
                  >
                    ¿Olvidó su contraseña?
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-[#1a1a24] border border-slate-800 rounded-xl pl-10 pr-10 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          )}

          {isRegistering && !isForgotPassword && (
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Rol Operativo
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as any)}
                className="w-full bg-[#1a1a24] border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500 transition-colors"
              >
                <option value="supervisor">Supervisor de Operaciones</option>
                <option value="admin">Administrador del Call Center</option>
                <option value="auditor">Auditor de Calidad CDR</option>
              </select>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-800/50 text-white font-medium py-2.5 rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/20 transition-all cursor-pointer"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <span>
                  {isForgotPassword
                    ? 'Enviar Enlace de Recuperación'
                    : isRegistering
                    ? 'Registrar Cuenta de Auditor'
                    : 'Ingresar al Dashboard'}
                </span>
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>

          {isForgotPassword && (
            <button
              type="button"
              onClick={() => {
                setIsForgotPassword(false);
                setErrorMessage(null);
                setSuccessMessage(null);
              }}
              className="w-full text-center text-xs text-slate-400 hover:text-white pt-2 block"
            >
              Volver a Iniciar Sesión
            </button>
          )}
        </form>

        {/* Demo Fast Access */}
        <div className="mt-6 pt-5 border-t border-slate-800/80">
          <button
            type="button"
            onClick={handleDemoCredentials}
            disabled={loading}
            className="w-full bg-slate-900 hover:bg-slate-800/80 border border-slate-700 text-slate-300 hover:text-white py-2 px-3 rounded-xl text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer group"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-400 group-hover:rotate-12 transition-transform" />
            <span>Acceso Rápido Demo (Supervisor)</span>
          </button>

          <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-500 mt-4">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Protegido por Firebase Authentication & Firestore</span>
          </div>
        </div>
      </div>
    </div>
  );
};
