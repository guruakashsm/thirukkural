import { useMemo, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { useLanguage } from '../contexts/LanguageContext'

type ContactType = 'comment' | 'question' | 'contribute'

type ContactFormState = {
  firstName: string
  email: string
  type: ContactType | ''
  message: string
}

const CONTACT_EMAIL = 'guruakashsm@gmail.com'

export default function Contact() {
  const { t } = useLanguage()
  const [form, setForm] = useState<ContactFormState>({
    firstName: '',
    email: '',
    type: '',
    message: '',
  })
  const [submittedType, setSubmittedType] = useState<ContactType | null>(null)

  const typeOptions = useMemo(
    () => [
      { value: 'comment' as const, label: t('contactTypeComment') },
      { value: 'question' as const, label: t('contactTypeQuestion') },
      { value: 'contribute' as const, label: t('contactTypeContribute') },
    ],
    [t],
  )

  const replyByType: Record<ContactType, string> = {
    comment: t('contactReplyComment'),
    question: t('contactReplyQuestion'),
    contribute: t('contactReplyContribute'),
  }
  const isFormComplete =
    form.firstName.trim().length > 0 &&
    form.email.trim().length > 0 &&
    form.message.trim().length > 0 &&
    form.type !== ''
  const submittedTypeLabel = submittedType
    ? (typeOptions.find((option) => option.value === submittedType)?.label ?? submittedType)
    : ''

  function updateField<Key extends keyof ContactFormState>(key: Key, value: ContactFormState[Key]) {
    setForm((prev) => ({ ...prev, [key]: value }))
    if (submittedType) setSubmittedType(null)
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!form.type) return

    setSubmittedType(form.type)
    const selectedType = typeOptions.find((option) => option.value === form.type)?.label ?? form.type
    const subject = `Thirukkural Contact - ${selectedType} - ${form.firstName.trim()}`
    const submittedAt = new Date().toLocaleString()
    const body = [
      'Vanakkam Guruakash SM,',
      '',
      'You have received a new message from the Thirukkural Contact page.',
      '',
      '------------------------------',
      `${t('contactTypeLabel')}: ${selectedType}`,
      `${t('contactFirstNameLabel')}: ${form.firstName.trim()}`,
      `${t('contactEmailLabel')}: ${form.email.trim()}`,
      `Submitted At: ${submittedAt}`,
      '------------------------------',
      '',
      `${t('contactMessageLabel')}:`,
      form.message.trim(),
      '',
      '------------------------------',
      'Please reply to the sender using the email above.',
      'Sent via Thirukkural website contact form.',
    ].join('\n')
    const mailtoUrl = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`

    // Render the selected response first, then open mail composer.
    window.setTimeout(() => {
      window.location.href = mailtoUrl
    }, 120)
  }

  return (
    <div className="relative max-w-5xl mx-auto px-4 py-8 md:py-10">
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-10 -left-16 w-56 h-56 rounded-full bg-gold/10 blur-3xl" />
        <div className="absolute top-1/3 -right-16 w-56 h-56 rounded-full bg-copper/10 blur-3xl" />
      </div>

      <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-gold-dark hover:text-gold transition-colors no-underline mb-6">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        {t('back')}
      </Link>

      <header className="text-center mb-7 md:mb-8">
        <h1 className="font-tamil text-3xl md:text-4xl font-bold text-dark ornamental-underline">
          {t('contactTitle')}
        </h1>
        <p className="text-sm md:text-base text-gray mt-5 max-w-2xl mx-auto leading-relaxed">
          {t('contactSubtitle')}
        </p>
      </header>

      <section className="rounded-2xl border border-gold/20 bg-gradient-to-br from-white via-cream/90 to-cream-dark/60 p-5 md:p-7 shadow-[0_12px_30px_rgba(92,61,46,0.08)]">
        <div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <p className="text-sm text-gray leading-relaxed">{t('contactIntro')}</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <label className="block">
                <span className="text-sm font-medium text-dark">{t('contactFirstNameLabel')}</span>
                <input
                  type="text"
                  required
                  value={form.firstName}
                  onChange={(event) => updateField('firstName', event.target.value)}
                  placeholder={t('contactFirstNamePlaceholder')}
                  className="mt-1.5 w-full rounded-xl border border-gold/25 bg-white/95 px-3.5 py-2.5 text-sm text-dark outline-none transition focus:border-gold focus:ring-2 focus:ring-gold/25"
                />
              </label>

              <label className="block">
                <span className="text-sm font-medium text-dark">{t('contactEmailLabel')}</span>
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={(event) => updateField('email', event.target.value)}
                  placeholder={t('contactEmailPlaceholder')}
                  className="mt-1.5 w-full rounded-xl border border-gold/25 bg-white/95 px-3.5 py-2.5 text-sm text-dark outline-none transition focus:border-gold focus:ring-2 focus:ring-gold/25"
                />
              </label>
            </div>

            <label className="block">
              <span className="text-sm font-medium text-dark">{t('contactTypeLabel')}</span>
              <select
                required
                value={form.type}
                onChange={(event) => updateField('type', event.target.value as ContactType | '')}
                className="mt-1.5 w-full rounded-xl border border-gold/25 bg-white/95 px-3.5 py-2.5 text-sm text-dark outline-none transition focus:border-gold focus:ring-2 focus:ring-gold/25"
              >
                <option value="" disabled>
                  {t('contactTypePlaceholder')}
                </option>
                {typeOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="text-sm font-medium text-dark">{t('contactMessageLabel')}</span>
              <textarea
                required
                rows={6}
                value={form.message}
                onChange={(event) => updateField('message', event.target.value)}
                placeholder={t('contactMessagePlaceholder')}
                className="mt-1.5 w-full rounded-xl border border-gold/25 bg-white/95 px-3.5 py-2.5 text-sm text-dark outline-none transition focus:border-gold focus:ring-2 focus:ring-gold/25 resize-y min-h-36"
              />
            </label>

            <p className="text-xs text-gray-light">
              {t('contactMailHint')} ({CONTACT_EMAIL})
            </p>

            <button
              type="submit"
              disabled={!isFormComplete}
              className={`inline-flex items-center justify-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold text-white transition-colors ${
                isFormComplete
                  ? 'bg-gold-dark hover:bg-gold cursor-pointer'
                  : 'bg-gold/60 cursor-not-allowed opacity-70'
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l8.28 5.52a1.25 1.25 0 001.44 0L21 8m-17 9h16a1 1 0 001-1V8a1 1 0 00-1-1H4a1 1 0 00-1 1v8a1 1 0 001 1z" />
              </svg>
              {t('contactSend')}
            </button>
          </form>
        </div>

        {submittedType && (
          <div className="mt-5 rounded-xl border border-gold/25 bg-gold/10 px-4 py-3">
            <p className="text-sm md:text-base font-semibold text-dark">{t('contactSuccessTitle')}</p>
            <p className="text-xs uppercase tracking-[0.12em] text-gold-dark font-semibold mt-1">{submittedTypeLabel}</p>
            <p className="text-sm text-gray mt-1">{replyByType[submittedType]}</p>
            <p className="text-sm text-gold-dark mt-1.5">{t('contactReplyConnection')}</p>
          </div>
        )}
      </section>
    </div>
  )
}
