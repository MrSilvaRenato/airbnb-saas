import React from 'react'
import { Head, useForm, usePage, Link } from '@inertiajs/react'
import Shell from '@/Layouts/Shell'
import PropertyForm from '@/Components/PropertyForm'

export default function Create() {
    const { errors = {}, userMeta = {} } = usePage().props
    const isPro = userMeta.plan === 'pro'

    const { data, setData, post, processing } = useForm({
        title: '',
        address: '',
        wifi_name: '',
        wifi_password: '',
        notes: '',
        default_host_phone: '',
        default_smart_lock_code: '',
        default_arrival_tips: '',
        default_parking_info: '',
        default_emergency_info: '',
        default_rules_summary: '',
        default_garbage_recycling: '',
        default_appliances_notes: '',
        default_safety_notes: '',
        default_checkout_list: '',
        brand_display_name: '',
        brand_contact_label: '',
        brand_logo_file: null,
    })

    const submit = (e) => {
        e.preventDefault()
        post(route('properties.store'), { preserveScroll: true, forceFormData: true })
    }

    return (
        <Shell title="Add Property">
            <Head title="Add Property" />

            <div className="max-w-2xl mx-auto">
                {/* Page header */}
                <div className="mb-6">
                    <div className="flex items-center gap-2 text-xs text-gray-400 mb-2">
                        <Link href={route('host.dashboard')} className="hover:text-gray-600">Dashboard</Link>
                        <span>›</span>
                        <span className="text-gray-600">New property</span>
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900">Add a property</h1>
                    <p className="text-sm text-gray-400 mt-1">Set up your property once — stays and guest welcome pages are created separately.</p>
                </div>

                {Object.keys(errors).length > 0 && (
                    <div className="mb-4 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 flex items-center gap-2">
                        <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                        Please fix the highlighted fields below.
                    </div>
                )}

                <PropertyForm
                    data={data}
                    setData={setData}
                    errors={errors}
                    processing={processing}
                    onSubmit={submit}
                    mode="create"
                    isPro={isPro}
                />
            </div>
        </Shell>
    )
}
