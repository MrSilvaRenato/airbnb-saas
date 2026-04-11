import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, usePage } from '@inertiajs/react';
import DeleteUserForm from './Partials/DeleteUserForm';
import UpdatePasswordForm from './Partials/UpdatePasswordForm';
import UpdateProfileInformationForm from './Partials/UpdateProfileInformationForm';

function NotificationPreferences() {
    const { auth } = usePage().props
    const { data, setData, patch, processing, recentlySuccessful } = useForm({
        notify_on_guest_view: auth?.user?.notify_on_guest_view ?? false,
    })
    return (
        <div className="max-w-xl">
            <h2 className="text-lg font-medium text-gray-900">Notifications</h2>
            <p className="mt-1 text-sm text-gray-600">Choose when to receive email notifications.</p>
            <div className="mt-4 flex items-center gap-3">
                <input
                    id="notify_guest"
                    type="checkbox"
                    checked={data.notify_on_guest_view}
                    onChange={e => {
                        setData('notify_on_guest_view', e.target.checked)
                        patch(route('profile.update'), { preserveScroll: true })
                    }}
                    className="w-4 h-4 rounded"
                    disabled={processing}
                />
                <label htmlFor="notify_guest" className="text-sm text-gray-700">
                    Email me when a guest views their welcome page
                </label>
            </div>
            {recentlySuccessful && <p className="mt-2 text-sm text-emerald-600">Saved.</p>}
        </div>
    )
}

export default function Edit({ mustVerifyEmail, status }) {
    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    Profile
                </h2>
            }
        >
            <Head title="Profile" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl space-y-6 sm:px-6 lg:px-8">
                    <div className="bg-white p-4 shadow sm:rounded-lg sm:p-8">
                        <UpdateProfileInformationForm
                            mustVerifyEmail={mustVerifyEmail}
                            status={status}
                            className="max-w-xl"
                        />
                    </div>

                    <div className="bg-white p-4 shadow sm:rounded-lg sm:p-8">
                        <UpdatePasswordForm className="max-w-xl" />
                    </div>

                    <div className="bg-white p-4 shadow sm:rounded-lg sm:p-8">
                        <NotificationPreferences />
                    </div>

                    <div className="bg-white p-4 shadow sm:rounded-lg sm:p-8">
                        <DeleteUserForm className="max-w-xl" />
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
