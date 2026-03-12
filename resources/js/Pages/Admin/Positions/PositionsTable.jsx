import { Link } from "@inertiajs/react";
import { useState } from "react";

export default function PositionsTable({
    positions,
    search,
    pagination,
    searchParam = "search",
    pageParam = "page",
    totalLabel = "positions",
}) {
    const [searchTerm, setSearchTerm] = useState(search || "");

    const handleSearch = () => {
        const url = new URL(window.location);
        if (searchTerm.trim()) {
            url.searchParams.set(searchParam, searchTerm);
        } else {
            url.searchParams.delete(searchParam);
        }
        url.searchParams.set(pageParam, 1);
        window.location.href = url.toString();
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    };

    const handleClearSearch = () => {
        setSearchTerm("");
        const url = new URL(window.location);
        url.searchParams.delete(searchParam);
        url.searchParams.set(pageParam, 1);
        window.location.href = url.toString();
    };

    const handlePageChange = (page) => {
        const url = new URL(window.location);
        url.searchParams.set(pageParam, page);
        if (search) {
            url.searchParams.set(searchParam, search);
        }
        window.location.href = url.toString();
    };

    const getPaginationRange = () => {
        const { current_page, last_page } = pagination || {};
        if (!current_page || !last_page) return [];
        
        const range = [];
        const maxButtons = 5;
        let start = Math.max(1, current_page - Math.floor(maxButtons / 2));
        let end = Math.min(last_page, start + maxButtons - 1);
        
        if (end - start < maxButtons - 1) {
            start = Math.max(1, end - maxButtons + 1);
        }
        
        for (let i = start; i <= end; i++) {
            range.push(i);
        }
        return range;
    };

    return (
        <div className="space-y-4">
            {/* Search and Actions */}
            <div className="flex items-center justify-between gap-4">
                <div className="flex-1 max-w-md relative">
                    <input
                        type="text"
                        placeholder="Search positions..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        onKeyDown={handleKeyDown}
                        className="w-full rounded-lg border border-slate-300 px-3 py-2 pl-9 text-sm placeholder-slate-400 focus:border-[#1E3A8A] focus:outline-none focus:ring-1 focus:ring-[#1E3A8A]"
                    />
                    <button
                        onClick={handleSearch}
                        className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#1E3A8A] transition-colors"
                        title="Search"
                    >
                        <svg
                            className="h-5 w-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                            />
                        </svg>
                    </button>
                    {searchTerm && (
                        <button
                            onClick={() => setSearchTerm("")}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                        >
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    )}
                </div>

                {search && (
                    <button
                        onClick={handleClearSearch}
                        className="text-sm text-slate-600 hover:text-slate-900 underline"
                    >
                        Clear Filter
                    </button>
                )}

                <div className="text-sm text-slate-600">
                    {pagination?.total || 0} {totalLabel}
                </div>
            </div>

            {/* Table */}
            <div className="bg-white/90 backdrop-blur border border-white/30 shadow-sm rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full text-sm">
                        <thead className="bg-slate-50 text-slate-600">
                            <tr>
                                <th className="text-left px-5 py-3 font-semibold">Name</th>
                                <th className="text-left px-5 py-3 font-semibold">Slug</th>
                                <th className="text-left px-5 py-3 font-semibold">Department</th>
                                <th className="text-left px-5 py-3 font-semibold">Level</th>
                                <th className="text-left px-5 py-3 font-semibold">Min Months</th>
                                <th className="text-right px-5 py-3 font-semibold">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {positions?.length ? (
                                positions.map((p) => (
                                    <tr key={p.id} className="hover:bg-slate-50/60 transition-colors">
                                        <td className="px-5 py-3">
                                            <div className="font-medium text-slate-900">
                                                {p.name}
                                            </div>
                                            {p.responsibilities && (
                                                <div className="text-xs text-slate-500 mt-1 line-clamp-2">
                                                    {p.responsibilities}
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-5 py-3 text-slate-700 font-mono text-xs">
                                            {p.slug}
                                        </td>
                                        <td className="px-5 py-3 text-slate-700">
                                            {p.department?.name ? (
                                                <span className="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-700">
                                                    {p.department.name}
                                                </span>
                                            ) : (
                                                <span className="text-slate-400">—</span>
                                            )}
                                        </td>
                                        <td className="px-5 py-3 text-slate-700">
                                            {p.level ? (
                                                <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${
                                                    p.level === 'entry' ? 'bg-green-50 text-green-700' :
                                                    p.level === 'intermediate' ? 'bg-yellow-50 text-yellow-700' :
                                                    p.level === 'senior' ? 'bg-orange-50 text-orange-700' :
                                                    p.level === 'lead' ? 'bg-purple-50 text-purple-700' :
                                                    p.level === 'manager' ? 'bg-blue-50 text-blue-700' :
                                                    'bg-gray-50 text-gray-700'
                                                }`}>
                                                    {p.level}
                                                </span>
                                            ) : (
                                                <span className="text-slate-400">—</span>
                                            )}
                                        </td>
                                        <td className="px-5 py-3 text-slate-700">
                                            {p.min_months_in_role ? (
                                                <span className="text-sm">
                                                    {p.min_months_in_role} month{p.min_months_in_role !== 1 ? 's' : ''}
                                                </span>
                                            ) : (
                                                <span className="text-slate-400">—</span>
                                            )}
                                        </td>
                                        <td className="px-5 py-3 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <Link
                                                    href={route("admin.positions.show", p.id)}
                                                    className="text-[#1E3A8A] font-semibold hover:underline text-sm"
                                                >
                                                    View
                                                </Link>
                                                <span className="text-slate-300">|</span>
                                                <Link
                                                    href={route("admin.positions.edit", p.id)}
                                                    className="text-[#1E3A8A] font-semibold hover:underline text-sm"
                                                >
                                                    Edit
                                                </Link>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td className="px-5 py-8 text-center text-slate-600" colSpan={6}>
                                        <div className="flex flex-col items-center gap-2">
                                            <svg className="h-8 w-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                            </svg>
                                            <div>
                                                {search ? "No positions found matching your search." : "No positions have been created yet."}
                                            </div>
                                            {!search && (
                                                <Link
                                                    href={route("admin.positions.create")}
                                                    className="text-[#1E3A8A] font-semibold hover:underline text-sm"
                                                >
                                                    Create your first position
                                                </Link>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Pagination Controls */}
            {pagination && pagination.last_page > 1 && (
                <div className="flex items-center justify-between gap-4 pt-4">
                    <div className="text-sm text-slate-600">
                        Page {pagination.current_page} of {pagination.last_page}
                    </div>
                    
                    <div className="flex items-center gap-2">
                        {/* Previous Button */}
                        <button
                            onClick={() => handlePageChange(pagination.current_page - 1)}
                            disabled={pagination.current_page === 1}
                            className="inline-flex items-center justify-center rounded-lg px-3 py-2 text-sm font-medium border border-slate-300 text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                        </button>

                        {/* Page Numbers */}
                        {getPaginationRange().map((page) => (
                            <button
                                key={page}
                                onClick={() => handlePageChange(page)}
                                className={`inline-flex items-center justify-center rounded-lg px-3 py-2 text-sm font-medium border transition-colors ${
                                    page === pagination.current_page
                                        ? 'bg-[#1E3A8A] text-white border-[#1E3A8A]'
                                        : 'border-slate-300 text-slate-700 hover:bg-slate-50'
                                }`}
                            >
                                {page}
                            </button>
                        ))}

                        {/* Next Button */}
                        <button
                            onClick={() => handlePageChange(pagination.current_page + 1)}
                            disabled={!pagination.has_more}
                            className="inline-flex items-center justify-center rounded-lg px-3 py-2 text-sm font-medium border border-slate-300 text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        </button>
                    </div>

                    <div className="text-sm text-slate-600">
                        {Math.min((pagination.current_page - 1) * pagination.per_page + 1, pagination.total)} - {Math.min(pagination.current_page * pagination.per_page, pagination.total)} of {pagination.total}
                    </div>
                </div>
            )}
        </div>
    );
}
