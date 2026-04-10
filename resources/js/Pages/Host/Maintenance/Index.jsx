import React from "react";
import { Head, usePage, router } from "@inertiajs/react";
import Shell from "@/Layouts/Shell";

const PRIORITY_COLORS = {
    urgent: "bg-red-100 text-red-700 border-red-200",
    high:   "bg-orange-100 text-orange-700 border-orange-200",
    medium: "bg-amber-100 text-amber-700 border-amber-200",
    low:    "bg-gray-100 text-gray-500 border-gray-200",
};

const STATUS_COLUMNS = [
    { key: "open",        label: "Open",        color: "border-t-red-400" },
    { key: "in_progress", label: "In Progress",  color: "border-t-amber-400" },
    { key: "resolved",    label: "Resolved",     color: "border-t-emerald-400" },
];

function TaskCard({ task, onEdit, onDelete, onStatusChange }) {
    return (
        <div className={`bg-white rounded-xl border p-3 shadow-sm ${task.is_overdue ? "border-red-300" : ""}`}>
            <div className="flex items-start justify-between gap-2 mb-2">
                <div className="font-medium text-sm text-gray-900 leading-snug">{task.title}</div>
                <span className={`text-[10px] px-1.5 py-0.5 rounded border font-medium shrink-0 ${PRIORITY_COLORS[task.priority]}`}>
                    {task.priority.toUpperCase()}
                </span>
            </div>

            <div className="text-xs text-gray-500 mb-1">{task.property}</div>

            {task.description && (
                <p className="text-xs text-gray-600 mb-2 line-clamp-2">{task.description}</p>
            )}

            {task.due_date && (
                <div className={`text-[11px] mb-2 ${task.is_overdue ? "text-red-600 font-medium" : "text-gray-400"}`}>
                    {task.is_overdue ? "⚠ Overdue: " : "Due: "}{task.due_date}
                </div>
            )}

            <div className="flex gap-1.5 mt-2">
                {task.status !== "open" && (
                    <button
                        onClick={() => onStatusChange(task, "open")}
                        className="text-[10px] px-2 py-1 rounded border border-gray-200 hover:bg-gray-50 text-gray-500"
                    >← Open</button>
                )}
                {task.status === "open" && (
                    <button
                        onClick={() => onStatusChange(task, "in_progress")}
                        className="text-[10px] px-2 py-1 rounded border border-amber-200 hover:bg-amber-50 text-amber-700"
                    >Start →</button>
                )}
                {task.status === "in_progress" && (
                    <button
                        onClick={() => onStatusChange(task, "resolved")}
                        className="text-[10px] px-2 py-1 rounded border border-emerald-200 hover:bg-emerald-50 text-emerald-700"
                    >Resolve ✓</button>
                )}
                <button onClick={() => onEdit(task)} className="text-[10px] px-2 py-1 rounded border border-gray-200 hover:bg-gray-50 text-gray-500 ml-auto">Edit</button>
                <button onClick={() => onDelete(task)} className="text-[10px] px-2 py-1 rounded border border-red-100 hover:bg-red-50 text-red-500">Del</button>
            </div>
        </div>
    );
}

function TaskModal({ task, properties, onClose, onSave }) {
    const [form, setForm] = React.useState(task || {
        property_id: properties[0]?.id ?? "",
        title: "",
        description: "",
        priority: "medium",
        status: "open",
        due_date: "",
        notes: "",
    });

    const set = (key, val) => setForm(f => ({ ...f, [key]: val }));

    const submit = (e) => {
        e.preventDefault();
        onSave(form);
    };

    return (
        <div className="fixed inset-0 z-50 bg-black/30 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl w-full max-w-md shadow-xl p-5 max-h-[90vh] overflow-y-auto">
                <h3 className="text-base font-semibold mb-4">{task ? "Edit Task" : "New Task"}</h3>
                <form onSubmit={submit} className="space-y-3 text-sm">
                    <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Property</label>
                        <select className="w-full border rounded-lg px-3 py-2 text-sm" value={form.property_id} onChange={e => set("property_id", e.target.value)} required>
                            {properties.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Title</label>
                        <input className="w-full border rounded-lg px-3 py-2 text-sm" value={form.title} onChange={e => set("title", e.target.value)} required placeholder="e.g. Fix leaking tap in bathroom" />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Description</label>
                        <textarea className="w-full border rounded-lg px-3 py-2 text-sm" rows={2} value={form.description || ""} onChange={e => set("description", e.target.value)} placeholder="Optional details…" />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Priority</label>
                            <select className="w-full border rounded-lg px-3 py-2 text-sm" value={form.priority} onChange={e => set("priority", e.target.value)}>
                                <option value="low">Low</option>
                                <option value="medium">Medium</option>
                                <option value="high">High</option>
                                <option value="urgent">Urgent</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Status</label>
                            <select className="w-full border rounded-lg px-3 py-2 text-sm" value={form.status} onChange={e => set("status", e.target.value)}>
                                <option value="open">Open</option>
                                <option value="in_progress">In Progress</option>
                                <option value="resolved">Resolved</option>
                            </select>
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Due date</label>
                        <input type="date" className="w-full border rounded-lg px-3 py-2 text-sm" value={form.due_date || ""} onChange={e => set("due_date", e.target.value)} />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Notes</label>
                        <textarea className="w-full border rounded-lg px-3 py-2 text-sm" rows={2} value={form.notes || ""} onChange={e => set("notes", e.target.value)} placeholder="Internal notes…" />
                    </div>
                    <div className="flex gap-2 pt-2">
                        <button type="button" onClick={onClose} className="flex-1 py-2 rounded-lg border hover:bg-gray-50 text-sm">Cancel</button>
                        <button type="submit" className="flex-1 py-2 rounded-lg bg-black text-white text-sm hover:bg-gray-900">Save</button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default function MaintenanceIndex() {
    const { tasks, properties, counts } = usePage().props;

    const [modal, setModal] = React.useState(null); // null | {task} | {task: null} for new
    const [confirmDelete, setConfirmDelete] = React.useState(null);

    const openNew  = () => setModal({ task: null });
    const openEdit = (task) => setModal({ task });

    const handleSave = (form) => {
        if (modal.task) {
            router.put(route("maintenance.update", modal.task.id), form, {
                preserveScroll: true,
                onSuccess: () => setModal(null),
            });
        } else {
            router.post(route("maintenance.store"), form, {
                preserveScroll: true,
                onSuccess: () => setModal(null),
            });
        }
    };

    const handleStatusChange = (task, newStatus) => {
        router.put(route("maintenance.update", task.id), { ...task, status: newStatus }, { preserveScroll: true });
    };

    const handleDelete = (task) => {
        router.delete(route("maintenance.destroy", task.id), {
            preserveScroll: true,
            onSuccess: () => setConfirmDelete(null),
        });
    };

    const tasksByStatus = (status) => tasks.filter(t => t.status === status);

    return (
        <Shell title="Maintenance">
            <Head title="Maintenance — HostFlows" />

            <div className="mb-6 flex items-center justify-between flex-wrap gap-3">
                <div>
                    <div className="text-lg font-semibold">Maintenance</div>
                    <div className="text-sm text-gray-500">Track and resolve property tasks</div>
                </div>
                <button onClick={openNew} className="px-4 py-2 rounded-lg bg-black text-white text-sm hover:bg-gray-900">
                    + New Task
                </button>
            </div>

            {/* Summary KPIs */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                {[
                    { label: "Open",        value: counts.open,        color: "text-red-600" },
                    { label: "In Progress", value: counts.in_progress, color: "text-amber-600" },
                    { label: "Resolved",    value: counts.resolved,    color: "text-emerald-600" },
                    { label: "Overdue",     value: counts.overdue,     color: "text-red-700" },
                ].map(k => (
                    <div key={k.label} className="rounded-xl border bg-white p-4">
                        <div className="text-xs text-gray-500 mb-1">{k.label}</div>
                        <div className={`text-2xl font-semibold ${k.color}`}>{k.value}</div>
                    </div>
                ))}
            </div>

            {/* Kanban board */}
            <div className="grid md:grid-cols-3 gap-4">
                {STATUS_COLUMNS.map(col => (
                    <div key={col.key} className={`rounded-2xl border-t-4 bg-gray-50 ${col.color} p-4 flex flex-col gap-3`}>
                        <div className="flex items-center justify-between mb-1">
                            <div className="text-sm font-semibold text-gray-700">{col.label}</div>
                            <span className="text-xs text-gray-400 bg-white border rounded-full px-2 py-0.5">{tasksByStatus(col.key).length}</span>
                        </div>
                        {tasksByStatus(col.key).map(task => (
                            <TaskCard
                                key={task.id}
                                task={task}
                                onEdit={openEdit}
                                onDelete={setConfirmDelete}
                                onStatusChange={handleStatusChange}
                            />
                        ))}
                        {tasksByStatus(col.key).length === 0 && (
                            <div className="text-xs text-gray-400 text-center py-6 border-2 border-dashed border-gray-200 rounded-xl">
                                No {col.label.toLowerCase()} tasks
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* Task Modal */}
            {modal && (
                <TaskModal
                    task={modal.task}
                    properties={properties}
                    onClose={() => setModal(null)}
                    onSave={handleSave}
                />
            )}

            {/* Delete Confirm */}
            {confirmDelete && (
                <div className="fixed inset-0 z-50 bg-black/30 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl p-5 w-full max-w-sm shadow-xl">
                        <h3 className="text-base font-semibold">Delete task?</h3>
                        <p className="text-sm text-gray-600 mt-1">
                            "<strong>{confirmDelete.title}</strong>" will be permanently removed.
                        </p>
                        <div className="mt-4 flex gap-3 justify-end">
                            <button className="px-3 py-2 rounded-lg border hover:bg-gray-50 text-sm" onClick={() => setConfirmDelete(null)}>Cancel</button>
                            <button className="px-3 py-2 rounded-lg bg-red-600 text-white text-sm font-medium hover:bg-red-700" onClick={() => handleDelete(confirmDelete)}>Delete</button>
                        </div>
                    </div>
                </div>
            )}
        </Shell>
    );
}
