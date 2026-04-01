import NotificationBell from '@/Components/NotificationBell';
import PlaceholderPage from '@/Pages/Staff/_shared/PlaceholderPage';

export default function Index() {
    return (
        <PlaceholderPage
            title="Notifications"
            description="System alerts, training updates, and approval notifications will appear here."
        >
            <div className="mt-6">
                <NotificationBell
                    label="Notifications"
                    emptyLabel="No notifications yet"
                    showDropdown={false}
                    adminOnly={true}
                />
            </div>
        </PlaceholderPage>
    );
}