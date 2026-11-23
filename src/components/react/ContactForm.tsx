import { useId, useState, type ChangeEvent, type FormEvent } from 'react';
import { site } from '../../data/site';
import { AlertIcon, ArrowRightIcon, CheckIcon } from './Icons';

type FieldName = 'name' | 'email' | 'subject' | 'message';
type Status = 'idle' | 'submitting' | 'success' | 'error';

interface FormValues {
  name: string;
  email: string;
  subject: string;
  message: string;
}

type FormErrors = Partial<Record<FieldName, string>>;

const INITIAL_VALUES: FormValues = {
  name: '',
  email: '',
  subject: '',
  message: '',
};

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const MESSAGE_MAX = 1200;

function validateField(name: FieldName, value: string): string | undefined {
  const trimmed = value.trim();

  if (name === 'name') {
    if (!trimmed) return 'Nama wajib diisi.';
    if (trimmed.length < 2) return 'Nama minimal 2 karakter.';
    if (trimmed.length > 80) return 'Nama maksimal 80 karakter.';
  }

  if (name === 'email') {
    if (!trimmed) return 'Email wajib diisi.';
    if (!EMAIL_PATTERN.test(trimmed)) return 'Masukkan alamat email yang valid.';
  }

  if (name === 'subject') {
    if (!trimmed) return 'Subjek wajib diisi.';
    if (trimmed.length < 3) return 'Subjek minimal 3 karakter.';
    if (trimmed.length > 120) return 'Subjek maksimal 120 karakter.';
  }

  if (name === 'message') {
    if (!trimmed) return 'Pesan wajib diisi.';
    if (trimmed.length < 20) return 'Ceritakan sedikit lebih banyak (minimal 20 karakter).';
    if (trimmed.length > MESSAGE_MAX) return `Pesan maksimal ${MESSAGE_MAX} karakter.`;
  }

  return undefined;
}

function validateForm(values: FormValues): FormErrors {
  const errors: FormErrors = {};
  (Object.keys(values) as FieldName[]).forEach((field) => {
    const error = validateField(field, values[field]);
    if (error) errors[field] = error;
  });
  return errors;
}

function firstErrorField(errors: FormErrors): FieldName | null {
  const order: FieldName[] = ['name', 'email', 'subject', 'message'];
  return order.find((field) => Boolean(errors[field])) ?? null;
}

export default function ContactForm() {
  const formId = useId();
  const [values, setValues] = useState<FormValues>(INITIAL_VALUES);
  const [errors, setErrors] = useState<FormErrors>({});
  const [status, setStatus] = useState<Status>('idle');
  const [formError, setFormError] = useState('');
  const [honeypot, setHoneypot] = useState('');

  const isSubmitting = status === 'submitting';

  const handleChange = (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const name = event.target.name as FieldName;
    const value = event.target.value;

    setValues((current) => ({ ...current, [name]: value }));

    if (errors[name]) {
      setErrors((current) => ({
        ...current,
        [name]: validateField(name, value),
      }));
    }

    if (status === 'error') setStatus('idle');
  };

  const handleBlur = (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const name = event.target.name as FieldName;
    const error = validateField(name, event.target.value);
    setErrors((current) => ({ ...current, [name]: error }));
  };

  const focusField = (field: FieldName) => {
    document.getElementById(`${formId}-${field}`)?.focus();
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isSubmitting) return;

    if (honeypot) {
      setStatus('success');
      return;
    }

    const nextErrors = validateForm(values);
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      const first = firstErrorField(nextErrors);
      if (first) focusField(first);
      return;
    }

    const web3formsKey = import.meta.env.PUBLIC_WEB3FORMS_KEY?.trim();
    const formspreeEndpoint = import.meta.env.PUBLIC_FORMSPREE_ENDPOINT?.trim();

    if (!web3formsKey && !formspreeEndpoint) {
      if (import.meta.env.DEV) {
        console.warn(
          'Contact form is not configured. Set PUBLIC_WEB3FORMS_KEY or PUBLIC_FORMSPREE_ENDPOINT in .env.',
        );
      }
      setStatus('error');
      setFormError(
        `Maaf, formulir sedang tidak tersedia. Silakan hubungi saya langsung di ${site.email}.`,
      );
      return;
    }

    setStatus('submitting');
    setFormError('');

    const payload = {
      name: values.name.trim(),
      email: values.email.trim(),
      subject: values.subject.trim(),
      message: values.message.trim(),
    };

    try {
      let response: Response;

      if (web3formsKey) {
        response = await fetch('https://api.web3forms.com/submit', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          body: JSON.stringify({
            access_key: web3formsKey,
            ...payload,
            from_name: `${site.name} — Portofolio`,
            botcheck: false,
          }),
        });
      } else {
        response = await fetch(formspreeEndpoint as string, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          body: JSON.stringify({
            ...payload,
            _subject: payload.subject,
          }),
        });
      }

      const data: unknown = await response.json().catch(() => null);
      const apiFailed =
        typeof data === 'object' &&
        data !== null &&
        'success' in data &&
        (data as { success?: boolean }).success === false;

      if (!response.ok || apiFailed) {
        throw new Error('The form endpoint rejected the submission.');
      }

      setValues(INITIAL_VALUES);
      setErrors({});
      setStatus('success');
    } catch (error) {
      console.error('Contact form submission failed:', error);
      setStatus('error');
      setFormError(
        `Pesan belum terkirim. Coba lagi sebentar lagi, atau kirim email langsung ke ${site.email}.`,
      );
    }
  };

  const resetForm = () => {
    setValues(INITIAL_VALUES);
    setErrors({});
    setFormError('');
    setStatus('idle');
    window.setTimeout(() => focusField('name'), 50);
  };

  const fieldError = (field: FieldName) => errors[field];
  const describedBy = (field: FieldName) =>
    fieldError(field) ? `${formId}-${field}-error` : undefined;

  return (
    <form
      className={`contact-form${status === 'success' ? ' is-success' : ''}`}
      onSubmit={handleSubmit}
      noValidate
    >
      <div className="contact-form__head">
        <h3 className="contact-form__title">Kirim pesan</h3>
        <p className="contact-form__note">
          Balasan biasanya dalam 1–2 hari kerja
        </p>
      </div>

      {status === 'success' ? (
        <div className="contact-success" role="status" aria-live="polite">
          <span className="contact-success__icon">
            <CheckIcon />
          </span>
          <h3>Pesan terkirim.</h3>
          <p>
            Terima kasih sudah menghubungi. Saya akan membaca pesan Anda dan
            membalas secepatnya.
          </p>
          <button type="button" className="btn btn--secondary btn--sm" onClick={resetForm}>
            Kirim pesan lain
          </button>
        </div>
      ) : (
        <>
          <div className="form-grid">
            <div className={`field${fieldError('name') ? ' has-error' : ''}`}>
              <label htmlFor={`${formId}-name`}>
                Nama <span>Wajib</span>
              </label>
              <input
                id={`${formId}-name`}
                name="name"
                type="text"
                autoComplete="name"
                placeholder="Nama lengkap"
                value={values.name}
                onChange={handleChange}
                onBlur={handleBlur}
                required
                disabled={isSubmitting}
                aria-invalid={Boolean(fieldError('name'))}
                aria-describedby={describedBy('name')}
              />
              <p className="field__error" id={`${formId}-name-error`} aria-live="polite">
                {fieldError('name') ?? ''}
              </p>
            </div>

            <div className={`field${fieldError('email') ? ' has-error' : ''}`}>
              <label htmlFor={`${formId}-email`}>
                Email <span>Wajib</span>
              </label>
              <input
                id={`${formId}-email`}
                name="email"
                type="email"
                autoComplete="email"
                placeholder="nama@email.com"
                value={values.email}
                onChange={handleChange}
                onBlur={handleBlur}
                required
                disabled={isSubmitting}
                aria-invalid={Boolean(fieldError('email'))}
                aria-describedby={describedBy('email')}
              />
              <p className="field__error" id={`${formId}-email-error`} aria-live="polite">
                {fieldError('email') ?? ''}
              </p>
            </div>

            <div
              className={`field form-row--full${fieldError('subject') ? ' has-error' : ''}`}
            >
              <label htmlFor={`${formId}-subject`}>
                Subjek <span>Wajib</span>
              </label>
              <input
                id={`${formId}-subject`}
                name="subject"
                type="text"
                placeholder="Misalnya: peluang magang front-end"
                value={values.subject}
                onChange={handleChange}
                onBlur={handleBlur}
                required
                disabled={isSubmitting}
                aria-invalid={Boolean(fieldError('subject'))}
                aria-describedby={describedBy('subject')}
              />
              <p className="field__error" id={`${formId}-subject-error`} aria-live="polite">
                {fieldError('subject') ?? ''}
              </p>
            </div>

            <div
              className={`field form-row--full${fieldError('message') ? ' has-error' : ''}`}
            >
              <label htmlFor={`${formId}-message`}>
                Pesan <span>Wajib</span>
              </label>
              <textarea
                id={`${formId}-message`}
                name="message"
                rows={5}
                placeholder="Ceritakan proyek, peran yang ditawarkan, atau sekadar menyapa."
                value={values.message}
                onChange={handleChange}
                onBlur={handleBlur}
                maxLength={MESSAGE_MAX}
                required
                disabled={isSubmitting}
                aria-invalid={Boolean(fieldError('message'))}
                aria-describedby={describedBy('message')}
              />
              <div className="field__meta-row">
                <p className="field__error" id={`${formId}-message-error`} aria-live="polite">
                  {fieldError('message') ?? ''}
                </p>
                <p className="field__hint" aria-hidden="true">
                  {values.message.length}/{MESSAGE_MAX}
                </p>
              </div>
            </div>

            <div className="form-honeypot" aria-hidden="true">
              <label htmlFor={`${formId}-botcheck`}>Jangan diisi</label>
              <input
                id={`${formId}-botcheck`}
                name="botcheck"
                type="text"
                tabIndex={-1}
                autoComplete="off"
                value={honeypot}
                onChange={(event) => setHoneypot(event.target.value)}
              />
            </div>
          </div>

          {status === 'error' && formError ? (
            <div className="form-status form-status--error" role="alert">
              <AlertIcon />
              <span>{formError}</span>
            </div>
          ) : null}

          <div className="form-footer">
            <p className="form-privacy">
              Data hanya dipakai untuk membalas pesan Anda. Tidak ada newsletter,
              tidak ada pelacakan.
            </p>
            <button
              type="submit"
              className="btn btn--primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <span className="spinner" aria-hidden="true" />
                  Mengirim…
                </>
              ) : (
                <>
                  Kirim pesan
                  <ArrowRightIcon />
                </>
              )}
            </button>
          </div>
        </>
      )}
    </form>
  );
}
