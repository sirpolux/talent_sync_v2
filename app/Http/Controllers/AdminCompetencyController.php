<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;

class AdminCompetencyController extends Controller
{
    public function index()
    {
        return Inertia::render('Admin/Competencies/Index');
    }

    public function create()
    {
        return Inertia::render('Admin/Competencies/Create');
    }

    public function store(Request $request)
    {
        // TODO: Implement store logic
    }

    public function show($id)
    {
        return Inertia::render('Admin/Competencies/Show');
    }

    public function edit($id)
    {
        return Inertia::render('Admin/Competencies/Edit');
    }

    public function update(Request $request, $id)
    {
        // TODO: Implement update logic
    }

    public function destroy($id)
    {
        // TODO: Implement destroy logic
    }
}
