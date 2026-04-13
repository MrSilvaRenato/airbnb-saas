import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import { Transition } from '@headlessui/react';
import { Link, router, useForm, usePage } from '@inertiajs/react';
import { useEffect, useMemo } from 'react';


export default function UpdateProfileInformation({
    mustVerifyEmail,
    status,
    className = '',
}) {
    const user = usePage().props.auth.user;

    const { data, setData, post, transform, errors, processing, recentlySuccessful } =
        useForm({
            name: user.name,
            email: user.email,
            phone: user.phone ?? '',
            business_name: user.business_name ?? '',
            host_display_name: user.host_display_name ?? '',
            profile_bio: user.profile_bio ?? '',
            brand_logo_file: null,
            remove_brand_logo: false,
            notify_on_guest_view: user.notify_on_guest_view ?? false,
            _method: 'patch',
        });

    const logoPreview = useMemo(() => {
        if (data.brand_logo_file) {
            return URL.createObjectURL(data.brand_logo_file);
        }
        return user.brand_logo_path;
    }, [data.brand_logo_file, user.brand_logo_path]);

    useEffect(() => {
        return () => {
            if (data.brand_logo_file && logoPreview?.startsWith('blob:')) {
                URL.revokeObjectURL(logoPreview);
            }
        };
    }, [data.brand_logo_file, logoPreview]);

const submit = (e) => {
    e.preventDefault();

    router.post(route('profile.update'), {
        ...data,
        _method: 'patch',
    }, {
        forceFormData: true,
    });
};

    return (
        <section className={className}>
            <header>
                <h2 className="text-lg font-medium text-gray-900">
                    Profile & Branding
                </h2>

                <p className="mt-1 text-sm text-gray-600">
                    Personalize your host identity, business branding, and account details.
                </p>
            </header>

            <form onSubmit={submit} className="mt-6 space-y-6">
                <div className="rounded-xl border border-indigo-100 bg-indigo-50/70 p-4">
                    <h3 className="text-sm font-semibold text-indigo-900">Brand Preview</h3>
                    <div className="mt-3 flex items-center gap-4">
                        <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-xl border border-indigo-200 bg-white">
                            {logoPreview ? (
                                <img src={logoPreview} alt="Brand logo preview" className="h-full w-full object-cover" />
                            ) : (
                                <span className="text-xl font-bold text-indigo-400">
                                    {(data.business_name || data.name || 'HF').slice(0, 1).toUpperCase()}
                                </span>
                            )}
                        </div>
                        <div>
                            <p className="text-base font-semibold text-gray-900">
                                {data.business_name || 'Your Business Name'}
                            </p>
                            <p className="text-sm text-gray-600">
                                Hosted by {data.host_display_name || data.name || 'Your Name'}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <div>
                        <InputLabel htmlFor="name" value="Name" />

                        <TextInput
                            id="name"
                            className="mt-1 block w-full"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            required
                            isFocused
                            autoComplete="name"
                        />

                        <InputError className="mt-2" message={errors.name} />
                    </div>

                    <div>
                        <InputLabel htmlFor="host_display_name" value="Host Display Name" />

                        <TextInput
                            id="host_display_name"
                            className="mt-1 block w-full"
                            value={data.host_display_name}
                            onChange={(e) => setData('host_display_name', e.target.value)}
                            autoComplete="organization-title"
                            placeholder="How guests should see your name"
                        />

                        <InputError className="mt-2" message={errors.host_display_name} />
                    </div>

                    <div>
                        <InputLabel htmlFor="business_name" value="Business Name" />

                        <TextInput
                            id="business_name"
                            className="mt-1 block w-full"
                            value={data.business_name}
                            onChange={(e) => setData('business_name', e.target.value)}
                            autoComplete="organization"
                            placeholder="e.g. Coastal Stay Co."
                        />

                        <InputError className="mt-2" message={errors.business_name} />
                    </div>

                    <div>
                        <InputLabel htmlFor="phone" value="Phone" />

                        <TextInput
                            id="phone"
                            type="tel"
                            className="mt-1 block w-full"
                            value={data.phone}
                            onChange={(e) => setData('phone', e.target.value)}
                            autoComplete="tel"
                            placeholder="+61 400 000 000"
                        />

                        <InputError className="mt-2" message={errors.phone} />
                    </div>
                </div>

                <div>
                    <InputLabel htmlFor="profile_bio" value="Bio" />
                    <textarea
                        id="profile_bio"
                        className="mt-1 block w-full rounded-md border-gray-300 text-sm shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                        rows={4}
                        value={data.profile_bio}
                        onChange={(e) => setData('profile_bio', e.target.value)}
                        placeholder="Tell guests about your hosting style and what they can expect."
                    />
                    <div className="mt-1 flex items-center justify-between">
                        <InputError className="mt-0" message={errors.profile_bio} />
                        <span className="text-xs text-gray-500">{data.profile_bio.length}/2000</span>
                    </div>
                </div>

                <div>
                    <InputLabel htmlFor="brand_logo_file" value="Business Logo" />
                    <input
                        id="brand_logo_file"
                        type="file"
                        accept=".png,.jpg,.jpeg,.webp"
                        className="mt-1 block w-full text-sm text-gray-700 file:mr-4 file:rounded-md file:border-0 file:bg-indigo-50 file:px-3 file:py-2 file:text-sm file:font-medium file:text-indigo-700 hover:file:bg-indigo-100"
                        onChange={(e) => {
                            const file = e.target.files?.[0] ?? null;
                            setData('brand_logo_file', file);
                            if (file) setData('remove_brand_logo', false);
                        }}
                    />
                    <div className="mt-2">
                        <label className="inline-flex items-center gap-2 text-sm text-gray-600">
                            <input
                                type="checkbox"
                                checked={data.remove_brand_logo}
                                onChange={(e) => setData('remove_brand_logo', e.target.checked)}
                                className="rounded border-gray-300 text-indigo-600 shadow-sm focus:ring-indigo-500"
                            />
                            Remove current logo
                        </label>
                    </div>
                    <InputError className="mt-2" message={errors.brand_logo_file} />
                    <InputError className="mt-2" message={errors.remove_brand_logo} />
                </div>

                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <div>
                    <InputLabel htmlFor="email" value="Email" />

                    <TextInput
                        id="email"
                        type="email"
                        className="mt-1 block w-full"
                        value={data.email}
                        onChange={(e) => setData('email', e.target.value)}
                        required
                        autoComplete="username"
                    />

                        <InputError className="mt-2" message={errors.email} />
                    </div>

                    {mustVerifyEmail && user.email_verified_at === null && (
                        <div>
                        <p className="mt-2 text-sm text-gray-800">
                            Your email address is unverified.
                            <Link
                                href={route('verification.send')}
                                method="post"
                                as="button"
                                className="rounded-md text-sm text-gray-600 underline hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                            >
                                Click here to re-send the verification email.
                            </Link>
                        </p>

                        {status === 'verification-link-sent' && (
                            <div className="mt-2 text-sm font-medium text-green-600">
                                A new verification link has been sent to your
                                email address.
                            </div>
                        )}
                        </div>
                    )}
                </div>

                <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                    <label className="inline-flex items-center gap-2 text-sm text-gray-700">
                        <input
                            type="checkbox"
                            checked={data.notify_on_guest_view}
                            onChange={(e) => setData('notify_on_guest_view', e.target.checked)}
                            className="rounded border-gray-300 text-indigo-600 shadow-sm focus:ring-indigo-500"
                        />
                        Notify me when guests view their welcome page
                    </label>
                </div>

                <div className="flex items-center gap-4">
                    <PrimaryButton disabled={processing}>Save</PrimaryButton>

                    <Transition
                        show={recentlySuccessful}
                        enter="transition ease-in-out"
                        enterFrom="opacity-0"
                        leave="transition ease-in-out"
                        leaveTo="opacity-0"
                    >
                        <p className="text-sm text-gray-600">
                            Saved.
                        </p>
                    </Transition>
                </div>
            </form>
        </section>
    );
}
