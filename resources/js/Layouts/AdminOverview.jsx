import React, { useEffect, useState } from "react";
import { BarChart, PieChart, Bell, Users, ClipboardList, TrendingUp } from "lucide-react";
import axios from "axios";

export default function AdminOverview() {
  const [metrics, setMetrics] = useState({
    totalStaff: 0,
    activeStaff: 0,
    pendingTrainingRequests: 0,
    pendingLeaveApplications: 0,
  });
  const [recentActivities, setRecentActivities] = useState([]);

  useEffect(() => {
    // Fetch metrics and recent activities
    const fetchData = async () => {
      try {
        const metricsResponse = await axios.get("/api/admin/metrics");
        const activitiesResponse = await axios.get("/api/admin/recent-activities");

        setMetrics(metricsResponse.data);
        setRecentActivities(activitiesResponse.data);
      } catch (error) {
        console.error("Error fetching admin data:", error);
      }
    };

    fetchData();
  }, []);

  const quickActions = [
    { label: "Manage Staff", href: "/admin/staff" },
    { label: "View Training Requests", href: "/admin/training-requests" },
    { label: "Approve Leave Applications", href: "/admin/leave-requests" },
  ];

  return (
    <div className="p-6 space-y-6">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">Admin Dashboard</h1>
        <p className="text-gray-500">Welcome back! Here's an overview of the platform's activity.</p>
      </header>

      {/* Key Metrics */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="flex items-center gap-4 p-4 bg-white shadow rounded-lg border border-gray-200">
          <Users className="w-6 h-6 text-blue-500" />
          <div>
            <h3 className="text-lg font-semibold text-gray-800">{metrics.totalStaff}</h3>
            <p className="text-sm text-gray-500">Total Staff</p>
          </div>
        </div>
        <div className="flex items-center gap-4 p-4 bg-white shadow rounded-lg border border-gray-200">
          <TrendingUp className="w-6 h-6 text-green-500" />
          <div>
            <h3 className="text-lg font-semibold text-gray-800">{metrics.activeStaff}</h3>
            <p className="text-sm text-gray-500">Active Staff</p>
          </div>
        </div>
        <div className="flex items-center gap-4 p-4 bg-white shadow rounded-lg border border-gray-200">
          <ClipboardList className="w-6 h-6 text-yellow-500" />
          <div>
            <h3 className="text-lg font-semibold text-gray-800">{metrics.pendingTrainingRequests}</h3>
            <p className="text-sm text-gray-500">Pending Training Requests</p>
          </div>
        </div>
        <div className="flex items-center gap-4 p-4 bg-white shadow rounded-lg border border-gray-200">
          <Bell className="w-6 h-6 text-red-500" />
          <div>
            <h3 className="text-lg font-semibold text-gray-800">{metrics.pendingLeaveApplications}</h3>
            <p className="text-sm text-gray-500">Pending Leave Applications</p>
          </div>
        </div>
      </section>

      {/* Recent Activities */}
      <section>
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Recent Activities</h2>
        <ul className="space-y-2">
          {recentActivities.map((activity, index) => (
            <li key={index} className="p-4 bg-white shadow rounded-lg border border-gray-200">
              {activity}
            </li>
          ))}
        </ul>
      </section>

      {/* Charts */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="p-6 bg-white shadow rounded-lg border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Staff Distribution</h3>
          <PieChart className="w-full h-40 text-gray-400" />
        </div>
        <div className="p-6 bg-white shadow rounded-lg border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Training Participation</h3>
          <BarChart className="w-full h-40 text-gray-400" />
        </div>
      </section>

      {/* Quick Actions */}
      <section>
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {quickActions.map((action, index) => (
            <a
              key={index}
              href={action.href}
              className="block p-4 bg-gradient-to-r from-blue-500 to-green-500 text-white text-center font-semibold rounded-lg shadow hover:opacity-90"
            >
              {action.label}
            </a>
          ))}
        </div>
      </section>
    </div>
  );
}