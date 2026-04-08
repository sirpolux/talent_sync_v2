import axios from 'axios';

window.axios = axios;
window.axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';

if (typeof window !== 'undefined') {
    const broadcaster = import.meta.env.VITE_BROADCAST_DRIVER;
    const broadcastEnabled = broadcaster && broadcaster !== 'null' && broadcaster !== 'false' && broadcaster !== 'off';

    if (broadcastEnabled) {
        import('laravel-echo')
            .then(({ default: Echo }) => {
                const pusherKey = import.meta.env.VITE_PUSHER_APP_KEY;
                const pusherCluster = import.meta.env.VITE_PUSHER_APP_CLUSTER || 'mt1';

                if (!pusherKey) {
                    window.Echo = null;
                    return;
                }

                if (typeof window.Pusher === 'undefined') {
                    import('pusher-js')
                        .then(() => {
                            window.Echo = new Echo({
                                broadcaster: 'pusher',
                                key: pusherKey,
                                cluster: pusherCluster,
                                wsHost: import.meta.env.VITE_REVERB_HOST || window.location.hostname,
                                wsPort: Number(import.meta.env.VITE_REVERB_PORT || 80),
                                wssPort: Number(import.meta.env.VITE_REVERB_PORT || 443),
                                forceTLS: String(import.meta.env.VITE_REVERB_SCHEME || 'http') === 'https',
                                enabledTransports: ['ws', 'wss'],
                                authEndpoint: '/broadcasting/auth',
                                auth: {
                                    headers: {
                                        Accept: 'application/json',
                                    },
                                },
                            });
                        })
                        .catch(() => {
                            window.Echo = null;
                        });

                    return;
                }

                window.Echo = new Echo({
                    broadcaster: 'pusher',
                    key: pusherKey,
                    cluster: pusherCluster,
                    wsHost: import.meta.env.VITE_REVERB_HOST || window.location.hostname,
                    wsPort: Number(import.meta.env.VITE_REVERB_PORT || 80),
                    wssPort: Number(import.meta.env.VITE_REVERB_PORT || 443),
                    forceTLS: String(import.meta.env.VITE_REVERB_SCHEME || 'http') === 'https',
                    enabledTransports: ['ws', 'wss'],
                    authEndpoint: '/broadcasting/auth',
                    auth: {
                        headers: {
                            Accept: 'application/json',
                        },
                    },
                });
            })
            .catch(() => {
                window.Echo = null;
            });
    } else {
        window.Echo = null;
    }
}