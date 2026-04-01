import { Bell, CheckCheck, ChevronDown, ExternalLink, Inbox } from 'lucide-react';
import Dropdown from '@/Components/Dropdown';
import { Link, usePage } from '@inertiajs/react';
import { useNotifications } from '@/Contexts/NotificationContext';

function formatTimestamp(value) {
    if (!value) {
        return '';
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return '';
    }

    return date.toLocaleString(undefined, {
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
    });
}

function getNotificationLabel(item) {
    const type = item?.notification_type ?? item?.type ?? item?.event ?? '';
    const event = item?.event ?? '';
    const title = item?.title ?? 'Notification';

    if (type === 'leave_request' || String(event).startsWith('leave_request_')) {
        return title;
    }

    return title;
}

function getNotificationDescription(item) {
    return item?.body ?? item?.message ?? '';
}

function getNotificationActionUrl(item) {
    return item?.action_url ?? item?.url ?? item?.link ?? null;
}

function NotificationTrigger({ label, unreadCount, onOpen }) {
    return (
        <button
            type="button"
            className="relative inline-flex items-center justify-center rounded-md p-2 transition hover:bg-gray-100"
            aria-label={label}
            onClick={onOpen}
        >
            <Bell className="h-5 w-5 text-gray-600 transition hover:text-[#1E3A8A]" />
            {unreadCount > 0 ? (
                <span className="absolute right-1 top-1 inline-flex min-h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-semibold leading-none text-white">
                    {unreadCount > 99 ? '99+' : unreadCount}
                </span>
            ) : null}
        </button>
    );
}

export default function NotificationBell({
    href = null,
    label = 'Notifications',
    emptyLabel = 'No new notifications',
    showDropdown = true,
    onOpen = null,
    adminOnly = true,
}) {
    const { adminOnly: contextAdminOnly, unreadCount, notifications, markAsRead, markAllAsRead } = useNotifications();
    const page = usePage();
    const isAdminNotificationsEnabled = adminOnly && contextAdminOnly;
    const recentNotifications = Array.isArray(notifications) ? notifications.slice(0, 5) : [];

    if (!isAdminNotificationsEnabled) {
        return null;
    }

    if (!showDropdown) {
        return href ? (
            <Link href={href} className="relative inline-flex items-center justify-center rounded-md p-2 transition hover:bg-gray-100" aria-label={label}>
                <Bell className="h-5 w-5 text-gray-600 transition hover:text-[#1E3A8A]" />
                {unreadCount > 0 ? (
                    <span className="absolute right-1 top-1 inline-flex min-h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-semibold leading-none text-white">
                        {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                ) : null}
            </Link>
        ) : (
            <NotificationTrigger label={label} unreadCount={unreadCount} onOpen={onOpen} />
        );
    }

    return (
        <Dropdown>
            <Dropdown.Trigger>
                <NotificationTrigger label={label} unreadCount={unreadCount} onOpen={onOpen} />
            </Dropdown.Trigger>

            <Dropdown.Content width="80" contentClasses="py-2 bg-white">
                <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
                    <div>
                        <div className="text-sm font-semibold text-slate-900">{label}</div>
                        <div className="text-xs text-slate-500">
                            {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount === 1 ? '' : 's'}` : 'You are all caught up'}
                        </div>
                    </div>

                    <button
                        type="button"
                        className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-slate-600 transition hover:bg-slate-50 hover:text-slate-900"
                        onClick={markAllAsRead}
                    >
                        <CheckCheck className="h-4 w-4" />
                        Mark all read
                    </button>
                </div>

                <div className="max-h-80 overflow-auto">
                    {recentNotifications.length ? (
                        recentNotifications.map((item) => {
                            const actionUrl = getNotificationActionUrl(item);
                            const labelText = getNotificationLabel(item);
                            const description = getNotificationDescription(item);

                            return (
                                <div
                                    key={item.id}
                                    className={`border-b border-slate-100 px-4 py-3 last:border-b-0 ${item.is_read ? 'bg-white' : 'bg-slate-50/80'}`}
                                >
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="min-w-0 flex-1">
                                            <div className="flex items-center gap-2">
                                                <div className={`h-2 w-2 rounded-full ${item.is_read ? 'bg-slate-300' : 'bg-emerald-500'}`} />
                                                <div className={`truncate text-sm font-medium ${item.is_read ? 'text-slate-700' : 'text-slate-900'}`}>
                                                    {labelText}
                                                </div>
                                            </div>

                                            {description ? (
                                                <div className="mt-1 line-clamp-2 text-sm text-slate-600">
                                                    {description}
                                                </div>
                                            ) : null}

                                            <div className="mt-2 text-xs text-slate-400">
                                                {formatTimestamp(item.created_at)}
                                            </div>
                                        </div>

                                        {actionUrl ? (
                                            <Link
                                                href={actionUrl}
                                                className="inline-flex shrink-0 items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-[#1E3A8A] transition hover:bg-blue-50"
                                                onClick={() => markAsRead(item.id)}
                                            >
                                                Open
                                                <ExternalLink className="h-3.5 w-3.5" />
                                            </Link>
                                        ) : (
                                            <button
                                                type="button"
                                                className="inline-flex shrink-0 items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-[#1E3A8A] transition hover:bg-blue-50"
                                                onClick={() => markAsRead(item.id)}
                                            >
                                                Dismiss
                                            </button>
                                        )}
                                    </div>
                                </div>
                            );
                        })
                    ) : (
                        <div className="flex flex-col items-center justify-center gap-2 px-4 py-10 text-center">
                            <Inbox className="h-8 w-8 text-slate-300" />
                            <div className="text-sm font-medium text-slate-700">{emptyLabel}</div>
                            <div className="text-xs text-slate-500">New activity will appear here in real time.</div>
                        </div>
                    )}
                </div>

                {href ? (
                    <div className="border-t border-slate-100 px-4 py-3">
                        <Link href={href} className="inline-flex items-center gap-1 text-sm font-medium text-[#1E3A8A] transition hover:text-[#0f255f]">
                            View all
                            <ChevronDown className="h-4 w-4 rotate-[-90deg]" />
                        </Link>
                    </div>
                ) : null}
            </Dropdown.Content>
        </Dropdown>
    );
}