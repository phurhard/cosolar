import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { supabase } from '@/api/supabaseClient';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Sun, Loader2, Mail, Lock } from 'lucide-react';
import { toast } from 'sonner';

export default function Login() {
  const navigate = useNavigate();
  const [mode, setMode] = useState('signin'); // 'signin' | 'signup'
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ email: '', password: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === 'signin') {
        const { error } = await supabase.auth.signInWithPassword(formData);
        if (error) throw error;
        toast.success('Signed in successfully!');
        navigate(createPageUrl('Home'));
      } else {
        const { error } = await supabase.auth.signUp(formData);
        if (error) throw error;
        toast.success('Account created! Check your email to confirm.');
      }
    } catch (err) {
      toast.error(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-6 py-12">
      <Card className="w-full max-w-md border-border">
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Sun className="w-8 h-8 text-primary" />
          </div>
          <CardTitle className="text-2xl">
            {mode === 'signin' ? 'Welcome back' : 'Create account'}
          </CardTitle>
          <CardDescription>
            {mode === 'signin'
              ? 'Sign in to your CoSolar account'
              : 'Join Africa\'s solar registry'}
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(p => ({ ...p, email: e.target.value }))}
                  placeholder="you@example.com"
                  className="pl-10 bg-background"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData(p => ({ ...p, password: e.target.value }))}
                  placeholder="••••••••"
                  className="pl-10 bg-background"
                  required
                  minLength={6}
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full bg-primary hover:bg-primary/90"
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : null}
              {mode === 'signin' ? 'Sign In' : 'Create Account'}
            </Button>
          </form>

          <div className="mt-4 text-center text-sm text-muted-foreground">
            {mode === 'signin' ? (
              <>
                Don't have an account?{' '}
                <button
                  onClick={() => setMode('signup')}
                  className="text-primary hover:underline font-medium"
                >
                  Sign up
                </button>
              </>
            ) : (
              <>
                Already have an account?{' '}
                <button
                  onClick={() => setMode('signin')}
                  className="text-primary hover:underline font-medium"
                >
                  Sign in
                </button>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
