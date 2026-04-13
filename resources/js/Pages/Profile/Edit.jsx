import { Head, Link, useForm, usePage } from '@inertiajs/react'
import { useRef, useState } from 'react'
import Shell from '@/Layouts/Shell'
import InputError from '@/Components/InputError'
import UpdatePasswordForm from './Partials/UpdatePasswordForm'
import DeleteUserForm from './Partials/DeleteUserForm'

function Section({ title, description, children }) {
    return (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <div className="mb-5">
                <h2 className="text-base font-semibold text-gray-900">{title}</h2>
                {description && <p className="text-sm text-gray-500 mt-0.5">{description}</p>}
            </div>
            {children}
        </div>
    )
}

export default function Edit({ mustVerifyEmail, status }) {
    const { auth } = usePage().props
    const user = auth.user

    const { data, setData, post, errors, processing, recentlySuccessful } = useForm({
        _method:              'PATCH',
        name:                 user.name ?? '',
        email:                user.email ?? '',
        tagline:              user.tagline ?? '',
        bio:                  user.bio ?? '',
        location:             user.location ?? '',
        website:              user.website ?? '',
        phone:                user.phone ?? '',
        notify_on_guest_view: user.notify_on_guest_view ?? false,
        profile_photo:        null,
    })

    const [preview, setPreview] = useState(user.profile_photo ?? null)
    const fileRef = useRef(null)

    function onPhotoChange(e) {
        const file = e.target.files[0]
        if (!file) return
        setData('profile_photo', file)
        setPreview(URL.createObjectURL(file))
    }

    function submit(e) {
        e.preventDefault()
        post(route('profile.update'), { forceFormData: true })
    }

    const initials = user.name?.split(' ').map(w => w[0]).join('').slice(0,2).toUpperCase()

    return (
        <Shell>
            <Head title="Edit Profile" />

            <div className="max-w-2xl mx-auto space-y-6">

                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Edit Profile</h1>
                        <p className="text-sm text-gray-500 mt-0.5">Manage how you appear across HostFlows</p>
                    </div>
                    <Link href={route('profile.show')} className="text-sm text-indigo-600 hover:underline">
                        ← View profile
                    </Link>
                </div>

                {recentlySuccessful && (
                    <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm rounded-xl px-4 py-3 flex items-center gap-2">
                        <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>
                        Profile updated successfully.
                    </div>
                )}

                {/* Photo + Identity */}
                <Section title="Profile Photo & Identity" description="Your name and photo are visible across the platform.">
                    <form onSubmit={submit} encType="multipart/form-data" className="space-y-5">

                        {/* Photo upload */}
                        <div className="flex items-center gap-5">
                            <div className="relative cursor-pointer group" onClick={() => fileRef.current?.click()}>
                                {preview
                                    ? <img src={preview} alt="Profile" className="w-20 h-20 rounded-2xl object-cover ring-2 ring-indigo-100" />
                                    : <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white text-2xl font-black ring-2 ring-indigo-100">
                                        {initials}
                                      </div>
                                }
                                <div className="absolute inset-0 rounded-2xl bg-black/30 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                                    <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z"/><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z"/></svg>
                                </div>
                            </div>
                            <div>
                                <button type="button" onClick={() => fileRef.current?.click()}
                                    className="text-sm font-medium text-indigo-600 hover:text-indigo-500 transition">
                                    Upload new photo
                                </button>
                                <p className="text-xs text-gray-400 mt-0.5">PNG, JPG, WEBP · Max 4MB</p>
                                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={onPhotoChange} />
                                <InputError message={errors.profile_photo} className="mt-1" />
                            </div>
                        </div>

                        {/* Name */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                            <input type="text" value={data.name} onChange={e => setData('name', e.target.value)} required
                                className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition" />
                            <InputError message={errors.name} className="mt-1" />
                        </div>

                        {/* Tagline */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Tagline <span className="text-gray-400 font-normal">(optional)</span></label>
                            <input type="text" maxLength={160} value={data.tagline} onChange={e => setData('tagline', e.target.value)} placeholder="e.g. Property manager in Sydney · 12 properties"
                                className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition" />
                            <InputError message={errors.tagline} className="mt-1" />
                        </div>

                        {/* Bio */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Bio <span className="text-gray-400 font-normal">(optional)</span></label>
                            <textarea rows={3} maxLength={1000} value={data.bio} onChange={e => setData('bio', e.target.value)} placeholder="A little about you and how you manage your properties…"
                                className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm text-gray-900 resize-none focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition" />
                            <InputError message={errors.bio} className="mt-1" />
                        </div>

                        {/* Location + Website + Phone */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                                <input type="text" value={data.location} onChange={e => setData('location', e.target.value)} placeholder="Sydney, Australia"
                                    className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition" />
                                <InputError message={errors.location} className="mt-1" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                                <input type="tel" value={data.phone} onChange={e => setData('phone', e.target.value)} placeholder="+61 400 000 000"
                                    className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition" />
                                <InputError message={errors.phone} className="mt-1" />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Website</label>
                            <input type="url" value={data.website} onChange={e => setData('website', e.target.value)} placeholder="https://yourwebsite.com"
                                className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition" />
                            <InputError message={errors.website} className="mt-1" />
                        </div>

                        <button type="submit" disabled={processing}
                            className="px-6 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-500 disabled:opacity-50 transition shadow-sm shadow-indigo-100">
                            {processing ? 'Saving…' : 'Save changes'}
                        </button>
                    </form>
                </Section>

                {/* Email */}
                <Section title="Email Address" description="Update the email address associated with your account.">
                    <form onSubmit={submit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                            <input type="email" value={data.email} onChange={e => setData('email', e.target.value)} required
                                className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition" />
                            <InputError message={errors.email} className="mt-1" />
                        </div>
                        {mustVerifyEmail && user.email_verified_at === null && (
                            <div className="text-sm text-amber-600 bg-amber-50 rounded-xl px-4 py-3 border border-amber-200">
                                Your email is unverified.{' '}
                                <Link href={route('verification.send')} method="post" as="button" className="underline hover:text-amber-700">
                                    Re-send verification email
                                </Link>
                            </div>
                        )}
                        {status === 'verification-link-sent' && (
                            <p className="text-sm text-emerald-600">Verification link sent!</p>
                        )}
                        <button type="submit" disabled={processing}
                            className="px-6 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-500 disabled:opacity-50 transition">
                            {processing ? 'Saving…' : 'Update email'}
                        </button>
                    </form>
                </Section>

                {/* Notifications */}
                <Section title="Notifications" description="Choose when to receive email notifications.">
                    <label className="flex items-center gap-3 cursor-pointer">
                        <input type="checkbox" checked={data.notify_on_guest_view}
                            onChange={e => { setData('notify_on_guest_view', e.target.checked); setTimeout(() => submit({ preventDefault: () => {} }), 0) }}
                            className="w-4 h-4 rounded accent-indigo-600" />
                        <span className="text-sm text-gray-700">Email me when a guest views their welcome page</span>
                    </label>
                </Section>

                {/* Change Password */}
                <Section title="Change Password" description="Use a strong password of at least 8 characters.">
                    <UpdatePasswordForm />
                </Section>

                {/* Danger zone */}
                <Section title="Danger Zone" description="Permanently delete your account and all data.">
                    <DeleteUserForm />
                </Section>

            </div>
        </Shell>
    )
}
