import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, usePage } from '@inertiajs/react';

export default function Show() {
    const user = usePage().props.auth.user;

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    My Profile
                </h2>
            }
        >
            <Head title="My Profile" />

            <div className="py-12">
                <div className="mx-auto max-w-4xl space-y-6 sm:px-6 lg:px-8">
                    <div className="overflow-hidden bg-white shadow sm:rounded-2xl">
                        <div className="border-b border-gray-100 bg-gradient-to-r from-indigo-50 to-violet-50 p-6 sm:p-8">
                            <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-2xl border border-indigo-200 bg-white">
                                        {user.brand_logo_path ? (
                                            <img
                                                src={user.brand_logo_path}
                                                alt="Brand logo"
                                                className="h-full w-full object-cover"
                                            />
                                        ) : (
                                            <span className="text-2xl font-bold text-indigo-500">
                                                {(user.business_name || user.name || 'H').slice(0, 1).toUpperCase()}
                                            </span>
                                        )}
                                    </div>

                                    <div>
                                        <p className="text-xl font-semibold text-gray-900">
                                            {user.business_name || 'Your Business'}
                                        </p>
                                        <p className="text-sm text-gray-600">
                                            Hosted by {user.host_display_name || user.name}
                                        </p>
                                        {user.phone && (
                                            <p className="mt-1 text-sm text-gray-500">{user.phone}</p>
                                        )}
                                    </div>
                                </div>

                                <Link
                                    href={route('profile.edit')}
                                    className="inline-flex items-center justify-center rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-indigo-700"
                                >
                                    Edit Profile
                                </Link>
                            </div>
                        </div>

                        <div className="space-y-5 p-6 sm:p-8">
                            <div>
                                <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-500">About</h3>
                                <p className="mt-2 whitespace-pre-line text-gray-700">
                                    {user.profile_bio || 'Add your profile bio so guests can get to know you.'}
                                </p>
                            </div>

                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="rounded-xl border border-gray-100 p-4">
                                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Account Name</p>
                                    <p className="mt-1 text-sm text-gray-800">{user.name}</p>
                                </div>
                                <div className="rounded-xl border border-gray-100 p-4">
                                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Email</p>
                                    <p className="mt-1 text-sm text-gray-800">{user.email}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
