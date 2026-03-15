import AdminLayout from "@/Layouts/AdminLayout";
import Breadcrumbs from "@/Components/Breadcrumbs";
import PrimaryButton from "@/Components/PrimaryButton";
import { Head, router, usePage } from "@inertiajs/react";
import { useMemo, useState } from "react";

function buildChildrenMap(nodes) {
    const map = new Map();
    nodes.forEach((n) => {
        map.set(n.id, []);
    });
    nodes.forEach((n) => {
        if (n.parent_position_id) {
            if (!map.has(n.parent_position_id)) map.set(n.parent_position_id, []);
            map.get(n.parent_position_id).push(n);
        }
    });
    // sort children by name for stable UI
    for (const [k, arr] of map.entries()) {
        arr.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
        map.set(k, arr);
    }
    return map;
}

function HierarchyNodeRow({
    node,
    depth,
    childrenMap,
    positionsById,
    allPositionsOptions,
    onSelectParent,
    onSaveParent,
    savingId,
}) {
    const children = childrenMap.get(node.id) || [];
    const indent = depth * 18;

    return (
        <>
            <div
                className="grid grid-cols-12 items-center gap-3 py-2 border-b border-slate-100"
                style={{ paddingLeft: indent }}
            >
                <div className="col-span-5">
                    <div className="font-medium text-slate-900">{node.name}</div>
                    <div className="text-xs text-slate-500">
                        {node.department_name ? `Dept: ${node.department_name}` : "Dept: —"}{" "}
                        {node.level ? `• Level: ${node.level}` : ""}
                    </div>
                </div>

                <div className="col-span-5">
                    <label className="sr-only">Parent position</label>
                    <select
                        className="w-full rounded-lg border-slate-200 text-sm"
                        value={node.parent_position_id ?? ""}
                        onChange={(e) => onSelectParent(node.id, e.target.value)}
                    >
                        <option value="">— No parent (top-level) —</option>
                        {allPositionsOptions.map((p) => (
                            <option key={p.id} value={p.id}>
                                {p.name}
                            </option>
                        ))}
                    </select>
                    <div className="mt-1 text-xs text-slate-500">
                        Current parent:{" "}
                        {node.parent_position_id
                            ? positionsById.get(node.parent_position_id)?.name ?? "Unknown"
                            : "None"}
                    </div>
                </div>

                <div className="col-span-2 flex justify-end">
                    <PrimaryButton
                        type="button"
                        className="px-3 py-2 text-xs"
                        disabled={savingId === node.id}
                        onClick={() => onSaveParent(node.id, node.parent_position_id)}
                    >
                        {savingId === node.id ? "Saving..." : "Save"}
                    </PrimaryButton>
                </div>
            </div>

            {children.map((child) => (
                <HierarchyNodeRow
                    key={child.id}
                    node={child}
                    depth={depth + 1}
                    childrenMap={childrenMap}
                    positionsById={positionsById}
                    allPositionsOptions={allPositionsOptions.filter((p) => p.id !== child.id)}
                    onSelectParent={onSelectParent}
                    onSaveParent={onSaveParent}
                    savingId={savingId}
                />
            ))}
        </>
    );
}

function OrgChartSubtree({ nodeId, childrenMap }) {
    const children = childrenMap.get(nodeId) || [];
    if (!children.length) return null;

    return (
        <div className="pl-5 border-l-2 border-slate-200 space-y-3">
            {children.map((child) => (
                <div key={child.id} className="relative">
                    <div className="absolute -left-5 top-5 h-px w-5 bg-slate-200"></div>

                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 shadow-sm">
                        <div className="font-semibold text-slate-900">{child.name}</div>
                        <div className="mt-1 text-xs text-slate-500">
                            {child.department_name ? `Dept: ${child.department_name}` : "Dept: —"}{" "}
                            {child.level ? `• Level: ${child.level}` : ""}
                        </div>

                        <div className="mt-3">
                            <OrgChartSubtree nodeId={child.id} childrenMap={childrenMap} />
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}

export default function Index({ positions, departments = [], filters = {}, orgLevelMin = 4 }) {
    const { flash, errors } = usePage().props;

    const [savingId, setSavingId] = useState(null);
    const [scopeMode, setScopeMode] = useState("department"); // department | org
    const [deptId, setDeptId] = useState(filters?.department_id ?? "");
    const [viewMode, setViewMode] = useState("edit"); // edit | chart
    const [localPositions, setLocalPositions] = useState(() => positions || []);

    const positionsById = useMemo(() => {
        const m = new Map();
        (localPositions || []).forEach((p) => m.set(p.id, p));
        return m;
    }, [localPositions]);

    // If user changes department/scope, fetch positions for that scope
    const loadScope = (nextScopeMode, nextDeptId) => {
        const params = new URLSearchParams();
        if (nextScopeMode === "department" && nextDeptId) {
            params.set("department_id", String(nextDeptId));
        }

        router.get(route("admin.hierarchies.index") + (params.toString() ? `?${params.toString()}` : ""), {}, {
            preserveState: true,
            preserveScroll: true,
            only: ["positions", "filters", "departments", "orgLevelMin"],
            onSuccess: (page) => {
                setLocalPositions(page.props.positions || []);
                setDeptId(page.props.filters?.department_id ?? "");
            },
        });
    };

    const childrenMap = useMemo(() => buildChildrenMap(localPositions || []), [localPositions]);

    const roots = useMemo(() => {
        const rootNodes = (localPositions || []).filter((p) => !p.parent_position_id);
        rootNodes.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
        return rootNodes;
    }, [localPositions]);

    const allPositionsOptions = useMemo(() => {
        return (localPositions || [])
            .map((p) => ({ id: p.id, name: p.name, level: p.level, department_id: p.department_id }))
            .sort((a, b) => (a.name || "").localeCompare(b.name || ""));
    }, [localPositions]);

    // Only updates local UI state (does not save)
    const onSelectParent = (positionId, parentPositionIdOrEmpty) => {
        const parentId =
            parentPositionIdOrEmpty === "" ? null : Number(parentPositionIdOrEmpty);

        setLocalPositions((prev) =>
            (prev || []).map((p) =>
                p.id === positionId ? { ...p, parent_position_id: parentId } : p
            )
        );
    };

    // Persists current selection for a row
    const onSaveParent = (positionId, parentId) => {
        setSavingId(positionId);

        router.put(
            route("admin.hierarchies.update", positionId),
            {
                parent_position_id: parentId,
            },
            {
                preserveScroll: true,
                onFinish: () => setSavingId(null),
                onError: () => {
                    // revert by reloading props
                    setLocalPositions(positions || []);
                },
            }
        );
    };

    return (
        <AdminLayout
            headerTitle="Position Hierarchies"
            tabName="Career Management"
            openedMenu="careers"
            activeSubmenu="careers.hierarchies"
        >
            <Head title="Position Hierarchies" />

            <div className="max-w-6xl space-y-4">
                <div className="flex items-start justify-between gap-4">
                    <div className="space-y-2">
                        <Breadcrumbs
                            items={[
                                { label: "Admin", href: "admin.dashboard" },
                                { label: "Position Hierarchies" },
                            ]}
                        />

                        <div>
                            <h1 className="text-xl font-semibold text-[#1E3A8A]">
                                Position Hierarchies
                            </h1>
                            <p className="mt-1 text-sm text-slate-600">
                                Define a canonical promotion hierarchy by assigning each position a single
                                parent position (the next higher role). This is separate from
                                reporting lines.
                            </p>

                            {flash?.status ? (
                                <div className="mt-2 text-sm font-medium text-emerald-700">
                                    {flash.status}
                                </div>
                            ) : null}

                            {errors?.parent_position_id ? (
                                <div className="mt-2 text-sm font-medium text-red-700">
                                    {errors.parent_position_id}
                                </div>
                            ) : null}
                        </div>
                    </div>
                </div>

                <div className="bg-white/90 backdrop-blur border border-white/30 shadow-sm rounded-2xl p-6">
                    <div className="mb-4 flex flex-col gap-3">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                            <div className="text-sm text-slate-600">Scope:</div>
                            <div className="inline-flex rounded-lg border border-slate-200 overflow-hidden">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setScopeMode("department");
                                        loadScope("department", deptId);
                                    }}
                                    className={
                                        scopeMode === "department"
                                            ? "px-3 py-2 text-sm font-semibold bg-[#1E3A8A] text-white"
                                            : "px-3 py-2 text-sm font-semibold bg-white text-slate-700"
                                    }
                                >
                                    Department Hierarchy
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setScopeMode("org");
                                        loadScope("org", "");
                                    }}
                                    className={
                                        scopeMode === "org"
                                            ? "px-3 py-2 text-sm font-semibold bg-[#1E3A8A] text-white"
                                            : "px-3 py-2 text-sm font-semibold bg-white text-slate-700"
                                    }
                                >
                                    Organization Hierarchy (Org-level)
                                </button>
                            </div>
                        </div>

                        {scopeMode === "department" ? (
                            <div className="flex flex-wrap items-center gap-3">
                                <div className="text-sm text-slate-600">Department:</div>
                                <select
                                    className="rounded-lg border-slate-200 text-sm"
                                    value={deptId ?? ""}
                                    onChange={(e) => {
                                        const next = e.target.value;
                                        setDeptId(next);
                                        loadScope("department", next);
                                    }}
                                >
                                    <option value="">— Select department —</option>
                                    {departments.map((d) => (
                                        <option key={d.id} value={d.id}>
                                            {d.name}
                                        </option>
                                    ))}
                                </select>
                                <div className="text-xs text-slate-500">
                                    Department ladder is enforced. Non-org-level roles cannot select parents in other departments.
                                </div>
                            </div>
                        ) : (
                            <div className="text-xs text-slate-500">
                                Showing org-level positions only (level {"\u2265"} {orgLevelMin}). Org-level roles can only parent to org-level roles (strictly higher level).
                            </div>
                        )}

                        <div className="flex flex-wrap items-center justify-between gap-3">
                            <div className="text-sm text-slate-600">View:</div>
                            <div className="inline-flex rounded-lg border border-slate-200 overflow-hidden">
                                <button
                                    type="button"
                                    onClick={() => setViewMode("edit")}
                                    className={
                                        viewMode === "edit"
                                            ? "px-3 py-2 text-sm font-semibold bg-[#1E3A8A] text-white"
                                            : "px-3 py-2 text-sm font-semibold bg-white text-slate-700"
                                    }
                                >
                                    Edit Hierarchy
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setViewMode("chart")}
                                    className={
                                        viewMode === "chart"
                                            ? "px-3 py-2 text-sm font-semibold bg-[#1E3A8A] text-white"
                                            : "px-3 py-2 text-sm font-semibold bg-white text-slate-700"
                                    }
                                >
                                    Org Chart (Visual)
                                </button>
                            </div>
                        </div>
                    </div>
                    {viewMode === "edit" ? (
                        <>
                            <div className="grid grid-cols-12 gap-3 pb-3 border-b border-slate-200 text-xs font-semibold text-slate-500">
                                <div className="col-span-5">Position</div>
                                <div className="col-span-5">Parent (next higher position)</div>
                                <div className="col-span-2 text-right">Action</div>
                            </div>

                            <div className="divide-y divide-slate-100">
                                {roots.length === 0 ? (
                                    <div className="py-6 text-sm text-slate-600">
                                        No positions found for the current organization.
                                    </div>
                                ) : (
                                    roots.map((root) => (
                                        <HierarchyNodeRow
                                            key={root.id}
                                            node={root}
                                            depth={0}
                                            childrenMap={childrenMap}
                                            positionsById={positionsById}
                                            allPositionsOptions={allPositionsOptions
                                                .filter((p) => p.id !== root.id)
                                                .filter((p) => {
                                                    const nodeIsOrg = (root.level ?? 0) >= orgLevelMin;
                                                    const candidateIsOrg = (p.level ?? 0) >= orgLevelMin;

                                                    if (nodeIsOrg) {
                                                        return candidateIsOrg && (p.level ?? 0) > (root.level ?? 0);
                                                    }

                                                    // department-level: allow same department (dept ladder)
                                                    if ((p.level ?? 0) < orgLevelMin) {
                                                        return p.department_id === root.department_id;
                                                    }

                                                    // allow promotion into org-level
                                                    return candidateIsOrg;
                                                })}
                                            onSelectParent={onSelectParent}
                                            onSaveParent={onSaveParent}
                                            savingId={savingId}
                                        />
                                    ))
                                )}
                            </div>

                            {savingId ? (
                                <div className="mt-4 text-xs text-slate-500">
                                    Saving changes for position #{savingId}…
                                </div>
                            ) : null}
                        </>
                    ) : (
                        <div className="space-y-4">
                            <div className="text-sm text-slate-600">
                                Visual-only representation of the promotion hierarchy (based on
                                <span className="font-mono"> parent_position_id</span>).
                            </div>

                            {roots.length === 0 ? (
                                <div className="py-6 text-sm text-slate-600">
                                    No positions found for the current organization.
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    {roots.map((root) => (
                                        <div key={root.id} className="rounded-2xl border border-slate-200 bg-white p-5">
                                            <div className="flex items-start justify-between gap-3">
                                                <div>
                                                    <div className="text-sm text-slate-500">Top level</div>
                                                    <div className="text-lg font-semibold text-slate-900">
                                                        {root.name}
                                                    </div>
                                                    <div className="text-xs text-slate-500">
                                                        {root.department_name ? `Dept: ${root.department_name}` : "Dept: —"}{" "}
                                                        {root.level ? `• Level: ${root.level}` : ""}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="mt-5">
                                                <OrgChartSubtree nodeId={root.id} childrenMap={childrenMap} />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </AdminLayout>
    );
}
