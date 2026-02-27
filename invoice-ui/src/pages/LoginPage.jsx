import { useForm } from 'react-hook-form';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../services/api';

export default function LoginPage() {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({ mode: 'onChange' });
  const [serverError, setServerError] = useState('');
  const navigate = useNavigate();

  const onSubmit = async (data) => {
    setServerError('');
    try {
      const res = await login(data);
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('userId', res.data.userId);
      localStorage.setItem('userName', res.data.userName);
      navigate('/invoices');
    } catch (err) {
      setServerError('Kullanıcı adı veya şifre hatalı.');
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <div className="auth-logo">⚡️ InvoiceApp</div>
        <p className="auth-subtitle">Devam etmek için giriş yapın</p>

        {serverError && (
          <div className="alert alert-danger alert-custom mb-4" role="alert">
            {serverError}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <div className="mb-4">
            <label className="form-label-custom">Kullanıcı Adı</label>
            <input
              type="text"
              maxLength={50}
              className={`form-control form-control-custom ${errors.userName ? 'is-invalid' : ''}`}
              placeholder="Kullanıcı adınızı girin"
              {...register('userName', {
                required: 'Kullanıcı adı zorunludur.',
                minLength: { value: 3, message: 'En az 3 karakter olmalıdır.' },
                maxLength: { value: 50, message: 'En fazla 50 karakter olabilir.' },
                pattern: {
                  value: /^[a-zA-Z0-9_]+$/,
                  message: 'Sadece harf, rakam ve alt çizgi kullanılabilir.',
                },
              })}
            />
            {errors.userName && (
              <div className="invalid-feedback d-block">{errors.userName.message}</div>
            )}
          </div>

          <div className="mb-4">
            <label className="form-label-custom">Şifre</label>
            <input
              type="password"
              maxLength={100}
              className={`form-control form-control-custom ${errors.password ? 'is-invalid' : ''}`}
              placeholder="Şifrenizi girin"
              {...register('password', {
                required: 'Şifre zorunludur.',
                minLength: { value: 6, message: 'En az 6 karakter olmalıdır.' },
                maxLength: { value: 100, message: 'En fazla 100 karakter olabilir.' },
                pattern: {
                  value: /^[a-zA-Z0-9!@#$%^&*]+$/,
                  message: 'Geçersiz karakter kullanıldı.',
                },
              })}
            />
            {errors.password && (
              <div className="invalid-feedback d-block">{errors.password.message}</div>
            )}
          </div>

          <button
            type="submit"
            className="btn-primary-custom"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" />
                Giriş yapılıyor...
              </>
            ) : (
              'Giriş Yap'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}