import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Input } from '../components/ui/Input';
import { PasswordInput } from '../components/ui/PasswordInput';
import { Button } from '../components/ui/Button';
import { useAuthStore } from '../store/authStore';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import api from '../lib/axios';
import toast from 'react-hot-toast';
import { Loader2, ShieldCheck, AlertCircle } from 'lucide-react';

const loginSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginForm = z.infer<typeof loginSchema>;

export function Login() {
  const { setAuth } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/';

  const { register, handleSubmit, formState: { errors } } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const onSubmit = async (data: LoginForm) => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const response = await api.post('/auth/login', data);
      const { accessToken, id, username, role, fullName } = response.data.data;
      
      setAuth(accessToken, { id, username, role, fullName });
      toast.success(`Welcome back, ${fullName}!`);
      navigate(from, { replace: true });
    } catch (error: any) {
      const msg = error.response?.status === 403 || error.response?.status === 429
          ? error.response?.data?.message || 'Account locked or rate limited. Try again later.'
          : error.response?.data?.message || 'Invalid username or password';
      setErrorMessage(msg);
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 sm:p-8 bg-gradient-to-br from-indigo-950 via-slate-900 to-black relative overflow-hidden">
      
      {/* Background glow effects */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-indigo-600/20 blur-[120px]" />
        <div className="absolute top-[60%] -right-[10%] w-[40%] h-[60%] rounded-full bg-blue-600/10 blur-[100px]" />
      </div>

      {/* Main Glass/Split Container */}
      <div className="max-w-5xl w-full flex flex-col md:flex-row bg-white/10 backdrop-blur-2xl rounded-[2rem] overflow-hidden border border-white/10 shadow-[0_20px_60px_rgba(0,0,0,0.5)] relative z-10">
        
        {/* LEFT PANEL: Branding & Aesthetics */}
        <div className="md:w-5/12 bg-gradient-to-b from-indigo-600/90 to-blue-900/90 p-10 lg:p-14 flex flex-col justify-between text-white relative border-r border-white/10">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-30 mix-blend-overlay"></div>
          
          <div className="relative z-10">
            <div className="w-16 h-16 bg-white/20 backdrop-blur-xl rounded-2xl flex items-center justify-center mb-8 border border-white/30 shadow-inner">
              <ShieldCheck className="w-8 h-8 text-white drop-shadow-md" />
            </div>
            <h1 className="text-4xl lg:text-5xl font-black tracking-tight mb-5 drop-shadow-lg leading-tight">
              Angadia Pedhi
            </h1>
            <p className="text-indigo-100/90 text-lg font-medium leading-relaxed max-w-sm">
              Enterprise ledger management and secure hawala operations platform. Access requires clearance.
            </p>
          </div>
          
          <div className="relative z-10 mt-16 md:mt-0">
            <div className="pl-5 border-l-4 border-indigo-400/80">
              <p className="text-base font-semibold text-indigo-50 leading-relaxed">
                "Streamlining private financial logistics with absolute precision and trust."
              </p>
            </div>
          </div>
        </div>

        {/* RIGHT PANEL: Login Form */}
        <div className="md:w-7/12 bg-white px-8 py-12 sm:p-12 lg:p-16 flex flex-col justify-center">
          
          <div className="mb-10 text-center sm:text-left">
            <h2 className="text-3xl lg:text-4xl font-extrabold text-slate-800 tracking-tight mb-2">Welcome Back</h2>
            <p className="text-slate-500 font-medium text-lg">Please authorize your identity.</p>
          </div>

          <form className="space-y-7" onSubmit={handleSubmit(onSubmit)}>
            
            {errorMessage && (
              <div className="flex items-center gap-3 p-4 bg-red-50 text-red-700 border border-red-200 rounded-2xl animate-fade-in shadow-sm">
                <AlertCircle className="w-5 h-5 shrink-0" />
                <p className="text-sm font-semibold">{errorMessage}</p>
              </div>
            )}

            <div className="space-y-5">
              <Input
                label="Username"
                type="text"
                autoComplete="username"
                autoFocus
                className="py-3.5 px-4 rounded-xl border-slate-200 bg-slate-50/50 hover:bg-white focus:bg-white text-base shadow-sm transition-colors"
                {...register('username')}
                error={errors.username?.message}
              />

              <PasswordInput
                label="Password"
                autoComplete="current-password"
                className="py-3.5 px-4 rounded-xl border-slate-200 bg-slate-50/50 hover:bg-white focus:bg-white text-base shadow-sm transition-colors"
                {...register('password')}
                error={errors.password?.message}
              />
            </div>

            <div className="pt-2">
              <Button 
                type="submit" 
                className="w-full py-4 text-base rounded-xl font-bold tracking-wide bg-indigo-600 hover:bg-indigo-700 shadow-[0_8px_20px_-6px_rgba(79,70,229,0.5)] active:scale-[0.98] transition-all" 
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-3">
                    <Loader2 className="w-5 h-5 animate-spin" /> Authenticating...
                  </span>
                ) : (
                  'Sign In'
                )}
              </Button>
            </div>
          </form>

          <div className="mt-10 text-center">
            <span className="text-slate-500 font-medium">Don't have clearance? </span>
            <Link to="/signup" className="text-indigo-600 hover:text-indigo-800 font-bold ml-1 transition-colors relative after:content-[''] after:absolute after:w-full after:h-0.5 after:bg-indigo-600 after:left-0 after:-bottom-1 after:scale-x-0 hover:after:scale-x-100 after:transition-transform after:origin-left">
              Request access
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
