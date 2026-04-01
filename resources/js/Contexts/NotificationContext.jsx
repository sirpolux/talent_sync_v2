import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { usePage } from '@inertiajs/react';

const NotificationContext = createContext(null);

const ADMIN_ROUTE_PREFIXES = ['admin.'];

function normalizeNotification(notification) {
    if (!notification || typeof notification !== 'object') {
        return null;
    }

    const payload = notification.data && typeof notification.data === 'object' ? notification.data : {};
    const id = notification.id ?? notification.notification_id ?? notification.uuid ?? payload.id ?? payload.notification_id ?? null;

    if (id === null || id === undefined) {
        return null;
    }

    const readAt = notification.read_at ?? notification.readAt ?? payload.read_at ?? payload.readAt ?? null;
    const isRead = typeof notification.is_read === 'boolean'
        ? notification.is_read
        : typeof notification.unread === 'boolean'
            ? !notification.unread
            : Boolean(readAt);

    const actionUrl = notification.action_url ?? notification.url ?? notification.link ?? payload.action_url ?? payload.url ?? payload.link ?? null;
    const title = notification.title ?? payload.title ?? notification.data?.title ?? 'Notification';
    const message = notification.message ?? notification.body ?? payload.message ?? payload.body ?? '';
    const type = notification.type ?? payload.type ?? notification.data?.type ?? 'general';
    const notificationType = notification.notification_type ?? payload.notification_type ?? notification.data?.notification_type ?? type;
    const event = notification.event ?? payload.event ?? notification.data?.event ?? type;
    const createdAt = notification.created_at ?? notification.createdAt ?? payload.created_at ?? payload.createdAt ?? null;

    return {
        ...notification,
        ...payload,
        id,
        unread: notification.unread ?? !isRead,
        is_read: isRead,
        read_at: readAt,
        title,
        body: message,
        message,
        action_url: actionUrl,
        url: actionUrl,
        link: actionUrl,
        type,
        notification_type: notificationType,
        event,
        created_at: createdAt,
    };
}

function normalizeNotifications(notifications) {
    if (!Array.isArray(notifications)) {
        return [];
    }

    return notifications.map(normalizeNotification).filter(Boolean);
}

function getRouteName(pageProps, pageUrl) {
    const ziggy = pageProps?.ziggy ?? null;

    if (ziggy && typeof ziggy === 'object') {
        const routeName = ziggy.location?.name ?? ziggy.name ?? null;

        if (routeName) {
            return routeName;
        }
    }

    const routeInfo = pageProps?.route ?? null;

    if (routeInfo && typeof routeInfo === 'object') {
        const routeName = routeInfo.name ?? routeInfo.routeName ?? null;

        if (routeName) {
            return routeName;
        }
    }

    const explicitName = pageProps?.routeName ?? pageProps?.currentRouteName ?? null;

    if (explicitName) {
        return explicitName;
    }

    const url = String(pageUrl ?? '').replace(/^\//, '').split('?')[0];

    if (url.startsWith('admin/')) {
        return `admin.${url.slice('admin/'.length).replace(/\//g, '.')}`;
    }

    if (url.startsWith('staff/')) {
        return `staff.${url.slice('staff/'.length).replace(/\//g, '.')}`;
    }

    return null;
}

function isAdminRoute(pageProps, pageUrl) {
    const routeName = getRouteName(pageProps, pageUrl);

    if (routeName) {
        return ADMIN_ROUTE_PREFIXES.some((prefix) => routeName.startsWith(prefix));
    }

    const url = String(pageUrl ?? '').replace(/^\//, '').split('?')[0];

    return url.startsWith('admin/');
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
    const currentUrl = page?.url ?? '';
    const adminOnly = isAdminRoute(pageProps, currentUrl);
    const initialState = adminOnly ? pageProps?.notifications ?? {} : {};
    const [unreadCount, setUnreadCount] = useState(Number(initialState.unreadCount ?? initialState.unread_count ?? 0));
    const [notifications, setNotifications] = useState(() => normalizeNotifications(initialState.notifications ?? initialState.items ?? initialState.data ?? []));
    const echoRef = useRef(null);

    useEffect(() => {
        const nextUnreadCount = adminOnly ? Number(initialState.unreadCount ?? initialState.unread_count ?? 0) : 0;
        const nextNotifications = adminOnly ? normalizeNotifications(initialState.notifications ?? initialState.items ?? initialState.data ?? []) : [];

        setUnreadCount(Number.isNaN(nextUnreadCount) ? 0 : nextUnreadCount);
        setNotifications(nextNotifications);
    }, [adminOnly, initialState?.unreadCount, initialState?.unread_count, initialState?.notifications, initialState?.items, initialState?.data]);

    const pushNotification = useCallback((notification) => {
        if (!adminOnly) {
            return;
        }

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
    }, [adminOnly]);

    const markAsRead = useCallback((notificationId) => {
        if (!adminOnly) {
            return;
        }

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
    }, [adminOnly]);

    const markAllAsRead = useCallback(() => {
        if (!adminOnly) {
            return;
        }

        setNotifications((prev) =>
            prev.map((item) => ({
                ...item,
                unread: false,
                is_read: true,
                read_at: item.read_at ?? new Date().toISOString(),
            })),
        );

        setUnreadCount(0);
    }, [adminOnly]);

    useEffect(() => {
        if (!adminOnly) {
            return;
        }

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
    }, [adminOnly, pageProps, pushNotification]);

    const value = useMemo(
        () => ({
            unreadCount,
            notifications,
            pushNotification,
            markAsRead,
            markAllAsRead,
            setUnreadCount,
            setNotifications,
            adminOnly,
        }),
        [unreadCount, notifications, pushNotification, markAsRead, markAllAsRead, adminOnly],
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