import { useEffect, useState } from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import { Bell, CheckCheck, ExternalLink, Trash2, Eye, EyeOff } from 'lucide-react';
import axios from 'axios';
import AdminLayout from '@/Layouts/AdminLayout';

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

export default function Index() {
    const { notifications: notificationsData } = usePage().props;
    const initialNotifications = notificationsData?.notifications || notificationsData?.items || [];
    const initialUnreadCount = notificationsData?.unreadCount || notificationsData?.unread_count || 0;

    const [notifications, setNotifications] = useState(Array.isArray(initialNotifications) ? initialNotifications : []);
    const [unreadCount, setUnreadCount] = useState(initialUnreadCount);
    const [loading, setLoading] = useState(false);
    const [filter, setFilter] = useState('all'); // all, unread, read
    // Note: We don't call loadNotifications on mount to preserve the initial props data

    const loadNotifications = async () => {
        setLoading(true);
        try {
            const response = await axios.get('/api/notifications');
            const notifs = response.data.data || [];
            // Only update if we got actual data back
            if (Array.isArray(notifs) && notifs.length > 0) {
                setNotifications(notifs);
                updateUnreadCount(notifs);
            }
        } catch (error) {
            console.error('Failed to load notifications:', error);
            // Don't clear notifications on error - keep the existing ones from props
        } finally {
            setLoading(false);
        }
    };

    const updateUnreadCount = (notifs) => {
        const notifArray = Array.isArray(notifs) ? notifs : [];
        const unread = notifArray.filter(n => !n.is_read).length;
        setUnreadCount(unread);
    };

    const toggleReadStatus = async (notificationId) => {
        try {
            const notification = notifications.find(n => n.id === notificationId);
            if (!notification) return;

            const shouldMarkAsRead = !notification.is_read;
            const readAt = shouldMarkAsRead ? new Date().toISOString() : null;

            await axios.patch(`/api/notifications/${notificationId}`, {
                read_at: readAt
            });

            setNotifications(prev => {
                const prevArray = Array.isArray(prev) ? prev : [];
                return prevArray.map(n =>
                    n.id === notificationId
                        ? { ...n, is_read: shouldMarkAsRead, read_at: readAt }
                        : n
                );
            });

            // Update unread count
            setUnreadCount(prev => shouldMarkAsRead ? prev - 1 : prev + 1);
        } catch (error) {
            console.error('Failed to toggle notification read status:', error);
        }
    };

    const markAllAsRead = async () => {
        try {
            await axios.post('/api/notifications/mark-all-read');
            setNotifications(prev => {
                const prevArray = Array.isArray(prev) ? prev : [];
                return prevArray.map(n => ({ ...n, is_read: true }));
            });
            setUnreadCount(0);
        } catch (error) {
            console.error('Failed to mark all notifications as read:', error);
        }
    };

    const deleteNotification = async (notificationId) => {
        if (!confirm('Are you sure you want to delete this notification?')) {
            return;
        }

        try {
            await axios.delete(`/api/notifications/${notificationId}`);
            setNotifications(prev => {
                const prevArray = Array.isArray(prev) ? prev : [];
                const filtered = prevArray.filter(n => n.id !== notificationId);
                updateUnreadCount(filtered);
                return filtered;
            });
        } catch (error) {
            console.error('Failed to delete notification:', error);
        }
    };

    const filteredNotifications = (Array.isArray(notifications) ? notifications : []).filter(notification => {
        if (filter === 'unread') return !notification.is_read;
        if (filter === 'read') return notification.is_read;
        return true;
    });

    return (
        <AdminLayout
            headerTitle="Notifications"
            tabName="Notifications"
            openedMenu="notifications"
            activeSubmenu={null}
        >
            <>
                <Head title="Notifications" />

                <div className="max-w-4xl mx-auto">
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                        {/* Header */}
                        <div className="px-6 py-4 border-b border-gray-200">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <Bell className="w-6 h-6 text-[#1E3A8A]" />
                                    <div>
                                        <h1 className="text-xl font-semibold text-gray-900">Notifications</h1>
                                        <p className="text-sm text-gray-600">
                                            {unreadCount > 0
                                                ? `${unreadCount} unread notification${unreadCount === 1 ? '' : 's'}`
                                                : 'You are all caught up'
                                            }
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">
                                    {unreadCount > 0 && (
                                        <button
                                            onClick={markAllAsRead}
                                            className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-[#1E3A8A] bg-blue-50 rounded-md hover:bg-blue-100 transition"
                                        >
                                            <CheckCheck className="w-4 h-4" />
                                            Mark all read
                                        </button>
                                    )}

                                    <select
                                        value={filter}
                                        onChange={(e) => setFilter(e.target.value)}
                                        className="px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-[#1E3A8A] focus:border-transparent"
                                    >
                                        <option value="all">All notifications</option>
                                        <option value="unread">Unread only</option>
                                        <option value="read">Read only</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Notifications List */}
                        <div className="divide-y divide-gray-200">
                            {loading ? (
                                <div className="px-6 py-12 text-center">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1E3A8A] mx-auto"></div>
                                    <p className="mt-2 text-sm text-gray-600">Loading notifications...</p>
                                </div>
                            ) : filteredNotifications.length === 0 ? (
                                <div className="px-6 py-12 text-center">
                                    <Bell className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                                        {filter === 'all' ? 'No notifications yet' :
                                         filter === 'unread' ? 'No unread notifications' :
                                         'No read notifications'}
                                    </h3>
                                    <p className="text-sm text-gray-600">
                                        {filter === 'all'
                                            ? 'New activity will appear here in real time.'
                                            : 'Check back later for new notifications.'
                                        }
                                    </p>
                                </div>
                            ) : (
                                filteredNotifications.map((notification) => {
                                    const actionUrl = getNotificationActionUrl(notification);
                                    const labelText = getNotificationLabel(notification);
                                    const description = getNotificationDescription(notification);

                                    return (
                                        <div
                                            key={notification.id}
                                            className={`px-6 py-4 hover:bg-gray-50 transition ${!notification.is_read ? 'bg-blue-50/30' : ''}`}
                                        >
                                            <div className="flex items-start justify-between gap-4">
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-3 mb-2">
                                                        <div className={`w-2 h-2 rounded-full ${notification.is_read ? 'bg-gray-300' : 'bg-emerald-500'}`} />
                                                        <h4 className={`text-sm font-medium ${notification.is_read ? 'text-gray-700' : 'text-gray-900'}`}>
                                                            {labelText}
                                                        </h4>
                                                        <span className="text-xs text-gray-500">
                                                            {formatTimestamp(notification.created_at)}
                                                        </span>
                                                    </div>

                                                    {description && (
                                                        <p className="text-sm text-gray-600 mb-3 ml-5">
                                                            {description}
                                                        </p>
                                                    )}

                                                    <div className="flex items-center gap-2 ml-5">
                                                        {actionUrl && (
                                                            <Link
                                                                href={actionUrl}
                                                                onClick={() => toggleReadStatus(notification.id)}
                                                                className="inline-flex items-center gap-1 px-3 py-1 text-xs font-medium text-[#1E3A8A] bg-blue-50 rounded-md hover:bg-blue-100 transition"
                                                            >
                                                                <ExternalLink className="w-3 h-3" />
                                                                View Details
                                                            </Link>
                                                        )}

                                                        <button
                                                            onClick={() => toggleReadStatus(notification.id)}
                                                            className={`inline-flex items-center gap-1 px-3 py-1 text-xs font-medium rounded-md transition ${
                                                                !notification.is_read
                                                                    ? 'text-green-700 bg-green-50 hover:bg-green-100'
                                                                    : 'text-gray-600 bg-gray-50 hover:bg-gray-100'
                                                            }`}
                                                        >
                                                            {!notification.is_read ? (
                                                                <>
                                                                    <Eye className="w-3 h-3" />
                                                                    Mark as Read
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <EyeOff className="w-3 h-3" />
                                                                    Mark as Unread
                                                                </>
                                                            )}
                                                        </button>

                                                        <button
                                                            onClick={() => deleteNotification(notification.id)}
                                                            className="inline-flex items-center gap-1 px-3 py-1 text-xs font-medium text-red-700 bg-red-50 rounded-md hover:bg-red-100 transition"
                                                        >
                                                            <Trash2 className="w-3 h-3" />
                                                            Delete
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>
                </div>
            </>
        </AdminLayout>
    );
}