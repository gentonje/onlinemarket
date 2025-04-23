import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Auth } from "@supabase/auth-ui-react";
import { Logo } from "@/components/navigation/Logo";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { useAuth } from "@/contexts/AuthContext";

const Login = () => {  
  const [authView, setAuthView] = useState<'sign_in' | 'sign_up'>('sign_in');
  const navigate = useNavigate();
  const { session, loading } = useAuth();

  useEffect(() => {
    console.log('Login page effect:', { loading, session });
    if (!loading && session && session.user) {
      navigate('/products', { replace: true });
    }
  }, [session, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-slate-900">
        <div className="text-white text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-start bg-slate-900 p-1">
      <div className="w-full max-w-md space-y-4 p-1">
        {/* Logo Section */}
        <div className="flex justify-center mt-20 mb-8">
          <Logo />
        </div>
        
        {/* Auth UI Container */}
        <div className="w-full bg-slate-800/50 backdrop-blur-sm rounded-lg p-4 space-y-4 border border-slate-700/50">
          <Auth
            supabaseClient={supabase}
            view={authView}
            appearance={{
              theme: ThemeSupa,
              variables: {
                default: {
                  colors: {
                    brand: 'rgb(14, 165, 233)',
                    brandAccent: 'rgb(56, 189, 248)',
                    brandButtonText: 'white',
                    inputBackground: 'rgb(30, 41, 59)',
                    inputText: 'white',
                    inputPlaceholder: 'rgb(148, 163, 184)',
                    messageText: 'white',
                    anchorTextColor: 'rgb(186, 230, 253)',
                    dividerBackground: 'rgb(51, 65, 85)',
                  },
                  space: {
                    labelBottomMargin: '4px',
                    anchorBottomMargin: '4px',
                    inputPadding: '8px 12px',
                    buttonPadding: '8px 12px',
                  },
                  radii: {
                    borderRadiusButton: '6px',
                    buttonBorderRadius: '6px',
                    inputBorderRadius: '6px',
                  },
                  borderWidths: {
                    buttonBorderWidth: '1px',
                    inputBorderWidth: '1px',
                  },
                  fonts: {
                    bodyFontFamily: `'Noto Sans Arabic', sans-serif`,
                    buttonFontFamily: `'Noto Sans Arabic', sans-serif`,
                    inputFontFamily: `'Noto Sans Arabic', sans-serif`,
                    labelFontFamily: `'Noto Sans Arabic', sans-serif`,
                  },
                },
              },
              className: {
                container: 'w-full space-y-4',
                button: 'w-full rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50',
                input: 'w-full rounded-md border border-slate-700 bg-slate-800/50 px-3 py-2 text-sm ring-offset-background placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
                label: 'text-sm font-medium text-slate-200',
                loader: 'text-slate-200',
                anchor: 'text-sm font-medium text-sky-300 hover:text-sky-200 transition-colors',
              },
            }}
            localization={{
              variables: {
                sign_in: {
                  email_label: 'Email',
                  password_label: 'Password',
                  button_label: 'Sign In',
                  loading_button_label: 'Signing in...',
                  social_provider_text: 'Sign in with {{provider}}',
                  link_text: 'Already have an account? Sign in',
                },
                sign_up: {
                  email_label: 'Email',
                  password_label: 'Password',
                  button_label: 'Sign Up',
                  loading_button_label: 'Creating account...',
                  social_provider_text: 'Sign up with {{provider}}',
                  link_text: 'Don\'t have an account? Sign up',
                },
                forgotten_password: {
                  email_label: 'Email',
                  password_label: 'Password',
                  button_label: 'Send Reset Instructions',
                  loading_button_label: 'Sending reset instructions...',
                  link_text: 'Forgot password?',
                },
              },
            }}
            providers={[]}
          />
        </div>
      </div>
    </div>
  );
};

export default Login;
