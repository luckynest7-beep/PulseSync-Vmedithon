import React, { useState } from 'react';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile as updateFirebaseProfile,
  type User,
} from 'firebase/auth';
import { Activity, Mail, Lock, User as UserIcon, Phone, LogIn, UserPlus } from 'lucide-react';
import { auth } from '../../lib/firebaseClient';

interface LoginViewProps {
  onAuthenticated: (user: User, phoneNumber?: string) => void;
}

function friendlyAuthError(code: string): string {
  switch (code) {
    case 'auth/email-already-in-use':
      return 'An account already exists with that email — try logging in instead.';
    case 'auth/invalid-email':
      return 'That email address doesn\'t look right.';
    case 'auth/weak-password':
      return 'Password must be at least 6 characters.';
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
    case 'auth/user-not-found':
      return 'Incorrect email or password.';
    default:
      return 'Something went wrong — please try again.';
  }
}

export const LoginView: React.FC<LoginViewProps> = ({ onAuthenticated }) => {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [name, setName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth) return;
    setError(null);
    setLoading(true);
    try {
      if (mode === 'signup') {
        const cred = await createUserWithEmailAndPassword(auth, email.trim(), password);
        await updateFirebaseProfile(cred.user, { displayName: name.trim() || 'Patient' });
        onAuthenticated(cred.user, phoneNumber.trim());
      } else {
        const cred = await signInWithEmailAndPassword(auth, email.trim(), password);
        onAuthenticated(cred.user);
      }
    } catch (err: any) {
      setError(friendlyAuthError(err?.code || ''));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-container">
      <div className="mobile-shell" style={{ justifyContent: 'center', padding: '24px 20px' }}>
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '16px',
              background: 'linear-gradient(135deg, #06b6d4, #2563eb)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 14px',
            }}
          >
            <Activity size={28} color="white" strokeWidth={2.5} />
          </div>
          <h1 style={{ fontSize: '1.4rem', fontWeight: 800 }}>PulseSync</h1>
          <p style={{ fontSize: '0.82rem', color: '#94a3b8' }}>
            {mode === 'login' ? 'Log in to your health record' : 'Create your health record'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="glass-card">
          {mode === 'signup' && (
            <>
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <div style={{ position: 'relative' }}>
                  <UserIcon size={16} style={{ position: 'absolute', left: 12, top: 14, color: '#64748b' }} />
                  <input
                    type="text"
                    className="form-input"
                    style={{ paddingLeft: '36px' }}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Dheeraj Kumar"
                    required
                  />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Mobile Number</label>
                <div style={{ position: 'relative' }}>
                  <Phone size={16} style={{ position: 'absolute', left: 12, top: 14, color: '#64748b' }} />
                  <input
                    type="tel"
                    className="form-input"
                    style={{ paddingLeft: '36px' }}
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="+91 98765 43210"
                    required
                  />
                </div>
              </div>
            </>
          )}

          <div className="form-group">
            <label className="form-label">Email</label>
            <div style={{ position: 'relative' }}>
              <Mail size={16} style={{ position: 'absolute', left: 12, top: 14, color: '#64748b' }} />
              <input
                type="email"
                className="form-input"
                style={{ paddingLeft: '36px' }}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <div style={{ position: 'relative' }}>
              <Lock size={16} style={{ position: 'absolute', left: 12, top: 14, color: '#64748b' }} />
              <input
                type="password"
                className="form-input"
                style={{ paddingLeft: '36px' }}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 6 characters"
                minLength={6}
                required
              />
            </div>
          </div>

          {error && (
            <p style={{ color: '#fb7185', fontSize: '0.78rem', marginBottom: '12px' }}>{error}</p>
          )}

          <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
            {mode === 'login' ? <LogIn size={18} /> : <UserPlus size={18} />}
            {loading ? 'Please wait...' : mode === 'login' ? 'Log In' : 'Create Account'}
          </button>
        </form>

        <button
          type="button"
          onClick={() => {
            setError(null);
            setMode((m) => (m === 'login' ? 'signup' : 'login'));
          }}
          style={{
            background: 'none',
            border: 'none',
            color: '#22d3ee',
            fontSize: '0.82rem',
            marginTop: '18px',
            cursor: 'pointer',
            textAlign: 'center',
          }}
        >
          {mode === 'login' ? "Don't have an account? Sign up" : 'Already have an account? Log in'}
        </button>
      </div>
    </div>
  );
};
