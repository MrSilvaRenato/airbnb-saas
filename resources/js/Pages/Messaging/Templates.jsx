import { Head, Link, usePage } from '@inertiajs/react';
import Shell from '@/Layouts/Shell';

export default function Templates() {
  const { templates } = usePage().props;

  return (
    <Shell title="Automated Messages">
      <Head title="Automated Messages" />

      <div className="max-w-3xl mx-auto space-y-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Automated Messages</h1>
          <p className="text-sm text-gray-500">Configure automatic guest emails.</p>
        </div>

        <div className="rounded-xl border border-indigo-100 bg-indigo-50 p-4 text-sm text-indigo-800">
          Placeholders: {'{{guest_first_name}}'}, {'{{property}}'}, {'{{check_in_date}}'}, {'{{check_out_date}}'}, {'{{welcome_url}}'}, {'{{host_name}}'}
        </div>

        <div className="space-y-3">
          {templates.map((tpl) => (
            <div key={tpl.id} className="rounded-xl border bg-white p-4 flex items-center justify-between gap-4">
              <div>
                <div className="font-medium text-gray-900">{tpl.name}</div>
                <div className="text-sm text-gray-500 truncate max-w-[480px]">{tpl.subject}</div>
                <div className="text-xs mt-1">
                  <span className={tpl.is_enabled ? 'text-emerald-600' : 'text-gray-400'}>
                    {tpl.is_enabled ? 'Enabled' : 'Disabled'}
                  </span>
                </div>
              </div>
              <Link href={route('messaging.templates.edit', tpl.id)} className="text-indigo-600 text-sm font-medium hover:underline">
                Edit
              </Link>
            </div>
          ))}
        </div>
      </div>
    </Shell>
  );
}
