import { useState } from 'react';
import { Navigate, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { PageHeader } from '../components/Layout.jsx';
import { ErrorAlert, Field, useTitle } from '../components/ui.jsx';
import { validateLogin, validateRegister } from '../utils/validators';
import { User } from '../models';

function LoginForm({ onSuccess }) {
  const { login } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);

  async function submit(e) {
    e.preventDefault();
    const errs = validateLogin(form);
    setErrors(errs);
    if (Object.keys(errs).length) return;
    setBusy(true);
    try {
      await login(form.email.trim(), form.password);
      onSuccess();
    } catch (err) {
      setError(err);
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} noValidate>
      <ErrorAlert error={error} />
      <Field id="le" label="Е-пошта" error={errors.email}>
        <input id="le" type="email" autoComplete="email" className={`form-control ${errors.email ? 'is-invalid' : ''}`}
          value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
      </Field>
      <Field id="lp" label="Лозинка" error={errors.password}>
        <input id="lp" type="password" autoComplete="current-password" className={`form-control ${errors.password ? 'is-invalid' : ''}`}
          value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
      </Field>
      <button type="submit" className="btn btn-forest w-100" disabled={busy}><i className="bi bi-box-arrow-in-right me-1" />Најави се</button>
      <p className="small text-muted mt-3 mb-0">Тест сметки (по <a href="/db">/db</a>): admin@vrvtura.mk / Admin1234 · ana@vrvtura.mk / Korisnik123</p>
    </form>
  );
}

function RegisterForm({ onSuccess }) {
  const { register } = useAuth();
  const [form, setForm] = useState({ name: '', email: '', phone: '', experience: 'pocetnik', password: '', password2: '', terms: false });
  const [errors, setErrors] = useState({});
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);
  const set = (f) => (e) => setForm({ ...form, [f]: e.target.type === 'checkbox' ? e.target.checked : e.target.value });
  const cls = (f, b = 'form-control') => `${b} ${errors[f] ? 'is-invalid' : ''}`;

  async function submit(e) {
    e.preventDefault();
    const errs = validateRegister(form);
    setErrors(errs);
    if (Object.keys(errs).length) return;
    setBusy(true);
    try {
      await register({ name: form.name.trim(), email: form.email.trim(), phone: form.phone.trim(), experience: form.experience, password: form.password });
      onSuccess();
    } catch (err) {
      setError(err);
      if (err.errors) setErrors(err.errors);
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} noValidate>
      <ErrorAlert error={error} />
      <Field id="rn" label="Име и презиме" error={errors.name}>
        <input id="rn" autoComplete="name" className={cls('name')} value={form.name} onChange={set('name')} maxLength={50} />
      </Field>
      <Field id="re" label="Е-пошта" error={errors.email}>
        <input id="re" type="email" autoComplete="email" className={cls('email')} value={form.email} onChange={set('email')} />
      </Field>
      <Field id="rt" label="Телефон (опционално)" error={errors.phone} hint="Пр. 070 123 456">
        <input id="rt" type="tel" autoComplete="tel" className={cls('phone')} value={form.phone} onChange={set('phone')} />
      </Field>
      <Field id="rk" label="Искуство" error={errors.experience}>
        <select id="rk" className={cls('experience', 'form-select')} value={form.experience} onChange={set('experience')}>
          {Object.entries(User.EXPERIENCE).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
      </Field>
      <div className="row g-2">
        <Field id="rl" label="Лозинка" error={errors.password} hint="Мин. 8 знаци, буква и бројка" className="col-sm-6 mb-3">
          <input id="rl" type="password" autoComplete="new-password" className={cls('password')} value={form.password} onChange={set('password')} />
        </Field>
        <Field id="rl2" label="Повтори лозинка" error={errors.password2} className="col-sm-6 mb-3">
          <input id="rl2" type="password" autoComplete="new-password" className={cls('password2')} value={form.password2} onChange={set('password2')} />
        </Field>
      </div>
      <div className="form-check mb-3">
        <input className={cls('terms', 'form-check-input')} type="checkbox" id="terms" checked={form.terms} onChange={set('terms')} />
        <label className="form-check-label small" htmlFor="terms">Се согласувам со правилата за безбедност на турите</label>
        {errors.terms && <div className="invalid-feedback d-block">{errors.terms}</div>}
      </div>
      <button type="submit" className="btn btn-forest w-100" disabled={busy}><i className="bi bi-person-plus me-1" />Креирај профил</button>
      <p className="small text-muted mt-3 mb-0"><i className="bi bi-envelope-check me-1" />По регистрацијата ќе добиете е-пошта за добредојде.</p>
    </form>
  );
}

export default function LoginPage() {
  useTitle('Најава');
  const { isLoggedIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [params, setParams] = useSearchParams();
  const tab = params.get('tab') === 'registracija' ? 'registracija' : 'najava';
  const goBack = () => navigate(location.state?.from || '/profil', { replace: true });

  if (isLoggedIn && !location.state?.from) return <Navigate to="/profil" replace />;

  return (
    <>
      <PageHeader title="Најава / Регистрација" subtitle="Пристап за регистрирани корисници и администратори" crumbs={[{ label: 'Најава' }]} />
      <div className="container">
        <div className="auth-wrap mx-auto panel">
          <ul className="nav nav-pills nav-justified mb-4" role="tablist">
            {[['najava', 'Најава'], ['registracija', 'Регистрација']].map(([k, label]) => (
              <li className="nav-item" key={k}>
                <button type="button" role="tab" aria-selected={tab === k} className={`nav-link ${tab === k ? 'active bg-forest' : 'text-forest'}`}
                  onClick={() => setParams(k === 'najava' ? {} : { tab: k }, { replace: true, state: location.state })}>{label}</button>
              </li>
            ))}
          </ul>
          {location.state?.from && <div className="alert alert-info small">Најавете се за да продолжите.</div>}
          {tab === 'najava' ? <LoginForm onSuccess={goBack} /> : <RegisterForm onSuccess={goBack} />}
        </div>
      </div>
    </>
  );
}
