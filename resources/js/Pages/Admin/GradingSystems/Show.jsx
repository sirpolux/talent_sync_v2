import React from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { ArrowLeft, Edit, Star, Building2, Globe, Users, Calendar } from 'lucide-react';

import AdminLayout from '@/Layouts/AdminLayout';
import { Button } from '@/Components/ui/button';
import { Badge } from '@/Components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Separator } from '@/Components/ui/separator';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/Components/ui/table';

export default function Show({ gradingSystem }) {
  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this grading system?')) {
      router.delete(route('admin.grading.destroy', gradingSystem.id));
    }
  };

  return (
    <AdminLayout
      headerTitle={gradingSystem.name}
      tabName={gradingSystem.name}
      openedMenu="talent"
      activeSubmenu="talent.grading"
    >
      <Head title={gradingSystem.name} />

      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" asChild>
              <Link href={route('admin.grading.index')}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Grading Systems
              </Link>
            </Button>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" asChild>
              <Link href={route('admin.grading.edit', gradingSystem.id)}>
                <Edit className="w-4 h-4 mr-2" />
                Edit
              </Link>
            </Button>
          </div>
        </div>

        {/* Basic Information */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                {gradingSystem.name}
                {gradingSystem.is_default && (
                  <Star className="w-5 h-5 text-yellow-500 fill-current" />
                )}
              </CardTitle>
              <div className="flex items-center gap-2">
                {gradingSystem.is_system_wide ? (
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
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {gradingSystem.description && (
              <p className="text-gray-600">{gradingSystem.description}</p>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-gray-400" />
                <span className="text-gray-600">Used by:</span>
                <span className="font-medium">{gradingSystem.positions.length} positions</span>
              </div>

              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-gray-400" />
                <span className="text-gray-600">Created:</span>
                <span className="font-medium">
                  {new Date(gradingSystem.created_at).toLocaleDateString()}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-gray-400" />
                <span className="text-gray-600">Updated:</span>
                <span className="font-medium">
                  {new Date(gradingSystem.updated_at).toLocaleDateString()}
                </span>
              </div>
            </div>

            {!gradingSystem.is_system_wide && gradingSystem.organization && (
              <>
                <Separator />
                <div>
                  <span className="text-sm text-gray-600">Organization:</span>
                  <span className="ml-2 font-medium">{gradingSystem.organization.name}</span>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Grades Table */}
        <Card>
          <CardHeader>
            <CardTitle>Grade Scale ({gradingSystem.grades.length} grades)</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Grade</TableHead>
                  <TableHead>Score Range</TableHead>
                  <TableHead>Description</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {gradingSystem.grades.map((grade) => (
                  <TableRow key={grade.id}>
                    <TableCell className="font-medium">{grade.label}</TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {grade.min_value} - {grade.max_value}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-gray-600">
                      {grade.description || 'No description'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Positions Using This System */}
        {gradingSystem.positions.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Positions Using This Grading System ({gradingSystem.positions.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {gradingSystem.positions.map((position) => (
                  <div key={position.id} className="border rounded-lg p-4">
                    <div className="font-medium text-gray-900">{position.title}</div>
                    {position.department && (
                      <div className="text-sm text-gray-600 mt-1">
                        {position.department.name}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <Button variant="outline" asChild>
                <Link href={route('admin.grading.edit', gradingSystem.id)}>
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Grading System
                </Link>
              </Button>

              <Button
                variant="outline"
                onClick={handleDelete}
                className="text-red-600 hover:text-red-700 border-red-200 hover:border-red-300"
              >
                Delete Grading System
              </Button>
            </div>

            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">Quick Actions</h4>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" asChild>
                  <Link href={route('admin.grading.create')}>
                    Create Similar System
                  </Link>
                </Button>
                <Button variant="outline" size="sm" asChild>
                  <Link href={route('admin.positions.index')}>
                    View Positions
                  </Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}