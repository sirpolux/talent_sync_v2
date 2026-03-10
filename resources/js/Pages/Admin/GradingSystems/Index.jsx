import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { Plus, Search, Filter, Eye, Edit, Trash2, Star, Building2, Globe } from 'lucide-react';

import AdminLayout from '@/Layouts/AdminLayout';
import Breadcrumbs from '@/Components/Breadcrumbs';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Badge } from '@/Components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/Components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/Components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/Components/ui/alert-dialog';

export default function Index({ gradingSystems, filters, breadcrumbs }) {
  const [searchTerm, setSearchTerm] = useState(filters.search || '');
  const [typeFilter, setTypeFilter] = useState(filters.type || 'all');

  const handleSearch = () => {
    router.get(route('admin.grading.index'), {
      search: searchTerm,
      type: typeFilter === 'all' ? '' : typeFilter,
    }, {
      preserveState: true,
      replace: true,
    });
  };

  const handleFilterChange = (value) => {
    setTypeFilter(value);
    router.get(route('admin.grading.index'), {
      search: searchTerm,
      type: value === 'all' ? '' : value,
    }, {
      preserveState: true,
      replace: true,
    });
  };

  const handleDelete = (gradingSystem) => {
    router.delete(route('admin.grading.destroy', gradingSystem.id), {
      preserveScroll: true,
      onSuccess: () => {
        // Handle success
      },
      onError: (errors) => {
        // Handle errors
      },
    });
  };

  return (
    <AdminLayout
      headerTitle="Grading Systems"
      tabName="Grading Systems"
      openedMenu="talent"
      activeSubmenu="talent.grading"
    >
      <Head title="Grading Systems" />

      <div className="space-y-6">
        <Breadcrumbs items={breadcrumbs} />

        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Grading Systems</h1>
            <p className="text-gray-600">Manage assessment grading scales for your organization</p>
          </div>
          <Button asChild>
            <Link href={route('admin.grading.create')}>
              <Plus className="w-4 h-4 mr-2" />
              Create Grading System
            </Link>
          </Button>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search grading systems..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="pl-10"
              />
            </div>
          </div>
          <Select value={typeFilter} onValueChange={handleFilterChange}>
            <SelectTrigger className="w-full sm:w-48">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Systems</SelectItem>
              <SelectItem value="system">System-wide</SelectItem>
              <SelectItem value="organization">Organization-specific</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg shadow-sm border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Grades</TableHead>
                <TableHead>Usage</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="w-24">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {gradingSystems.data.map((system) => (
                <TableRow key={system.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div>
                        <div className="font-medium text-gray-900">{system.name}</div>
                        {system.description && (
                          <div className="text-sm text-gray-500 truncate max-w-xs">
                            {system.description}
                          </div>
                        )}
                      </div>
                      {system.is_default && (
                        <Star className="w-4 h-4 text-yellow-500 fill-current" />
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {system.is_system_wide ? (
                      <Badge variant="secondary" className="flex items-center gap-1">
                        <Globe className="w-3 h-3" />
                        System-wide
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="flex items-center gap-1">
                        <Building2 className="w-3 h-3" />
                        Organization
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{system.grades_count} grades</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{system.positions_count} positions</Badge>
                  </TableCell>
                  <TableCell className="text-sm text-gray-500">
                    {new Date(system.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="sm" asChild>
                        <Link href={route('admin.grading.show', system.id)}>
                          <Eye className="w-4 h-4" />
                        </Link>
                      </Button>
                      <Button variant="ghost" size="sm" asChild>
                        <Link href={route('admin.grading.edit', system.id)}>
                          <Edit className="w-4 h-4" />
                        </Link>
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Grading System</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete "{system.name}"? This action cannot be undone.
                              {system.positions_count > 0 && (
                                <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-red-800 text-sm">
                                  Warning: This grading system is currently used by {system.positions_count} position(s).
                                  You cannot delete it until it's no longer in use.
                                </div>
                              )}
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(system)}
                              className="bg-red-600 hover:bg-red-700"
                              disabled={system.positions_count > 0}
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {gradingSystems.data.length === 0 && (
            <div className="text-center py-12">
              <div className="text-gray-500">No grading systems found.</div>
              <Button asChild className="mt-4">
                <Link href={route('admin.grading.create')}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Your First Grading System
                </Link>
              </Button>
            </div>
          )}
        </div>

        {/* Pagination */}
        {gradingSystems.last_page > 1 && (
          <div className="flex justify-center">
            <div className="flex gap-2">
              {gradingSystems.links.map((link, index) => (
                <Button
                  key={index}
                  variant={link.active ? "default" : "outline"}
                  size="sm"
                  asChild={!link.active && link.url}
                  disabled={!link.url}
                  onClick={() => link.url && router.get(link.url, {}, { preserveState: true })}
                >
                  {link.label.includes('&laquo;') ? '«' :
                   link.label.includes('&raquo;') ? '»' :
                   link.label}
                </Button>
              ))}
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}