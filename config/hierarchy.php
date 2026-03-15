<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Hierarchy Levels
    |--------------------------------------------------------------------------
    |
    | We split hierarchy rules into:
    | - Department hierarchy: positions with level < org_level_min must only
    |   choose parents within the same department (unless promoting into org-level).
    | - Organization hierarchy: positions with level >= org_level_min can only
    |   choose parents that are also org-level, and ideally strictly higher.
    |
    */

    // Positions with level >= this value are considered "org-level"
    'org_level_min' => (int) env('HIERARCHY_ORG_LEVEL_MIN', 4),

    // If true, org-level positions must choose a strictly higher-level parent.
    // If false, org-level positions may parent to same-level org roles (still cycle-checked).
    'org_parent_requires_higher_level' => (bool) env('HIERARCHY_ORG_PARENT_REQUIRES_HIGHER_LEVEL', true),
];
