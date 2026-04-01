import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { usePage } from '@inertiajs/react';

const NotificationContext = createContext(null);

function normalizeNotification(notification) {
    if (!notification || typeof notification !== 'object') {
        return null;
    }

    const id = notification.id ?? notification.notification_id ?? notification.uuid ?? null;

    if (id === null || id === undefined) {
        return null;
    }

    const readAt = notification.read_at ?? notification.readAt ?? null;
    const isRead = typeof notification.is_read === 'boolean' ? notification.is_read : Boolean(readAt);

    return {
        ...notification,
        id,
        unread: notification.unread ?? (!isRead),
        is_read: isRead,
        read_at: readAt,
        title: notification.title ?? notification.data?.title ?? 'Notification',
        body: notification.body ?? notification.message ?? notification.data?.body ?? '',
        url: notification.url ?? notification.link ?? notification.data?.url ?? null,
        type: notification.type ?? notification.data?.type ?? 'general',
        created_at: notification.created_at ?? notification.createdAt ?? notification.data?.created_at ?? null,
    };
}

function normalizeNotifications(notifications) {
    if (!Array.isArray(notifications)) {
        return [];
    }

    return notifications
        .map(normalizeNotification)
        .filter(Boolean);
}

export function NotificationProvider({ children }) {
    const page = (() => {
        try {
            return usePage();
        } catch {
            return null;
        }
    })();

    const pageProps = page?.props ?? {};
    const initialState = pageProps?.notifications ?? {};
    const [unreadCount, setUnreadCount] = useState(Number(initialState.unreadCount ?? initialState.unread_count ?? 0));
    const [notifications, setNotifications] = useState(() => normalizeNotifications(initialState.notifications ?? initialState.items ?? []));
    const echoRef = useRef(null);

    useEffect(() => {
        const nextUnreadCount = Number(initialState.unreadCount ?? initialState.unread_count ?? 0);
        const nextNotifications = normalizeNotifications(initialState.notifications ?? initialState.items ?? []);

        setUnreadCount(Number.isNaN(nextUnreadCount) ? 0 : nextUnreadCount);
        setNotifications(nextNotifications);
    }, [initialState?.unreadCount, initialState?.unread_count, initialState?.notifications, initialState?.items]);

    const pushNotification = useCallback((notification) => {
        const normalized = normalizeNotification(notification);
        if (!normalized) {
            return;
        }

        setNotifications((prev) => {
            const next = [normalized, ...prev.filter((item) => String(item.id) !== String(normalized.id))];
            return next.slice(0, 20);
        });

        if (!normalized.is_read) {
            setUnreadCount((prev) => prev + 1);
        }
    }, []);

    const markAsRead = useCallback((notificationId) => {
        setNotifications((prev) =>
            prev.map((item) => {
                if (String(item.id) !== String(notificationId)) {
                    return item;
                }

                return {
                    ...item,
                    unread: false,
                    is_read: true,
                    read_at: item.read_at ?? new Date().toISOString(),
                };
            }),
        );

        setUnreadCount((prev) => Math.max(0, prev - 1));
    }, []);

    const markAllAsRead = useCallback(() => {
        setNotifications((prev) =>
            prev.map((item) => ({
                ...item,
                unread: false,
                is_read: true,
                read_at: item.read_at ?? new Date().toISOString(),
            })),
        );

        setUnreadCount(0);
    }, []);

    useEffect(() => {
        const echo = window.Echo ?? null;

        if (!echo || echoRef.current === echo) {
            return;
        }

        echoRef.current = echo;

        const userId = pageProps?.auth?.user?.id ?? null;
        const orgId = pageProps?.auth?.organization?.id ?? pageProps?.org?.id ?? pageProps?.organization?.id ?? null;
        const role = pageProps?.auth?.user?.role ?? pageProps?.auth?.role ?? null;

        const channels = [];

        if (userId) {
            channels.push(`private-user.${userId}`);
        }

        if (orgId) {
            channels.push(`private-organization.${orgId}`);
        }

        if (role) {
            channels.push(`private-role.${role}`);
        }

        channels.forEach((channelName) => {
            try {
                echo.private(channelName).listen('.notification.created', (event) => {
                    pushNotification(event?.notification ?? event);
                });
            } catch (error) {
                // no-op: keep notification UI resilient when a channel is unavailable
            }
        });
    }, [pageProps, pushNotification]);

    const value = useMemo(
        () => ({
            unreadCount,
            notifications,
            pushNotification,
            markAsRead,
            markAllAsRead,
            setUnreadCount,
            setNotifications,
        }),
        [unreadCount, notifications, pushNotification, markAsRead, markAllAsRead],
    );

    return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>;
}

export function useNotifications() {
    const context = useContext(NotificationContext);

    if (!context) {
        throw new Error('useNotifications must be used within a NotificationProvider');
    }

    return context;
}

export default NotificationContext;
