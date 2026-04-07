import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Input } from '../components/ui/Input';
import { PasswordInput } from '../components/ui/PasswordInput';
import { Button } from '../components/ui/Button';
import { useAuthStore } from '../store/authStore';
import { useNavigate, Link } from 'react-router-dom';
import api from '../lib/axios';
import toast from 'react-hot-toast';

const signupSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters').max(50, 'Username too long'),
  fullName: z.string().min(1, 'Full name is required'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type SignupForm = z.infer<typeof signupSchema>;

export function Signup() {
  const { setAuth } = useAuthStore();
  const navigate = useNavigate();

  const { register, handleSubmit, formState: { errors } } = useForm<SignupForm>({
    resolver: zodResolver(signupSchema),
  });

  const [isLoading, setIsLoading] = useState(false);

  const onSubmit = async (data: SignupForm) => {
    setIsLoading(true);
    try {
      const response = await api.post('/auth/signup', data);
      const { accessToken, id, username, role, fullName } = response.data.data;
      
      setAuth(accessToken, { id, username, role, fullName });
      toast.success(`Welcome to Angadia Pedhi, ${fullName}!`);
      navigate('/', { replace: true });
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to register account');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-2xl border border-slate-200 shadow-xl">
        <div>
          <h2 className="text-center text-3xl font-extrabold text-indigo-700">
            Angadia Pedhi
          </h2>
          <p className="mt-2 text-center text-sm text-slate-600">
            Create an account to start managing your ledgers
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-4 rounded-md shadow-sm">
            <Input
              label="Full Name"
              type="text"
              autoComplete="name"
              {...register('fullName')}
              error={errors.fullName?.message}
            />
            <Input
              label="Username"
              type="text"
              autoComplete="username"
              {...register('username')}
              error={errors.username?.message}
            />
            <PasswordInput
              label="Password"
              autoComplete="new-password"
              {...register('password')}
              error={errors.password?.message}
            />
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? 'Creating Account...' : 'Sign Up securely'}
          </Button>
          
          <div className="text-sm text-center">
            <span className="text-slate-500">Already have an account? </span>
            <Link to="/login" className="font-semibold text-indigo-600 hover:text-indigo-500">
              Sign in
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
