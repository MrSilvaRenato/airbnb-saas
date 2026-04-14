import { Head, Link, useForm, usePage } from '@inertiajs/react';
import Shell from '@/Layouts/Shell';

export default function EditTemplate() {
  const { template } = usePage().props;
  const { data, setData, put, processing, errors } = useForm({
    subject: template.subject,
    body: template.body,
    is_enabled: !!template.is_enabled,
  });

  const submit = (e) => {
    e.preventDefault();
    put(route('messaging.templates.update', template.id));
  };

  return (
    <Shell title="Edit Message Template">
      <Head title={`Edit ${template.name}`} />

      <div className="max-w-3xl mx-auto space-y-4">
        <Link href={route('messaging.templates')} className="text-sm text-indigo-600 hover:underline">← Back to templates</Link>

        <div className="rounded-xl border bg-white p-5">
          <h1 className="text-xl font-semibold text-gray-900">{template.name}</h1>

          <form onSubmit={submit} className="mt-4 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
              <input
                className="w-full rounded-lg border-gray-300 text-sm"
                value={data.subject}
                onChange={(e) => setData('subject', e.target.value)}
              />
              {errors.subject && <div className="text-xs text-red-600 mt-1">{errors.subject}</div>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Body</label>
              <textarea
                rows={8}
                className="w-full rounded-lg border-gray-300 text-sm"
                value={data.body}
                onChange={(e) => setData('body', e.target.value)}
              />
              {errors.body && <div className="text-xs text-red-600 mt-1">{errors.body}</div>}
            </div>

            <label className="inline-flex items-center gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                checked={data.is_enabled}
                onChange={(e) => setData('is_enabled', e.target.checked)}
              />
              Enabled
            </label>

            <div>
              <button disabled={processing} className="px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700">
                Save template
              </button>
            </div>
          </form>
        </div>
      </div>
    </Shell>
  );
}
