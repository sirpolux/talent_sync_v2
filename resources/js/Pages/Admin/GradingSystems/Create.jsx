import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { ArrowLeft, Plus, Trash2, Save } from 'lucide-react';

import AdminLayout from '@/Layouts/AdminLayout';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Textarea } from '@/Components/ui/textarea';
import { Checkbox } from '@/Components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Badge } from '@/Components/ui/badge';

export default function Create() {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    is_default: false,
    grades: [
      { label: '', min_value: '', max_value: '', description: '' },
    ],
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: null,
      }));
    }
  };

  const handleGradeChange = (index, field, value) => {
    const newGrades = [...formData.grades];
    newGrades[index] = {
      ...newGrades[index],
      [field]: value,
    };
    setFormData(prev => ({
      ...prev,
      grades: newGrades,
    }));

    // Clear grade errors
    const errorKey = `grades.${index}.${field}`;
    if (errors[errorKey]) {
      setErrors(prev => ({
        ...prev,
        [errorKey]: null,
      }));
    }
  };

  const addGrade = () => {
    setFormData(prev => ({
      ...prev,
      grades: [
        ...prev.grades,
        { label: '', min_value: '', max_value: '', description: '' },
      ],
    }));
  };

  const removeGrade = (index) => {
    if (formData.grades.length > 1) {
      setFormData(prev => ({
        ...prev,
        grades: prev.grades.filter((_, i) => i !== index),
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (formData.grades.length === 0) {
      newErrors.grades = 'At least one grade is required';
    }

    formData.grades.forEach((grade, index) => {
      if (!grade.label.trim()) {
        newErrors[`grades.${index}.label`] = 'Grade label is required';
      }
      if (grade.min_value === '' || grade.min_value < 0 || grade.min_value > 100) {
        newErrors[`grades.${index}.min_value`] = 'Min value must be between 0 and 100';
      }
      if (grade.max_value === '' || grade.max_value < 0 || grade.max_value > 100) {
        newErrors[`grades.${index}.max_value`] = 'Max value must be between 0 and 100';
      }
      if (parseFloat(grade.min_value) > parseFloat(grade.max_value)) {
        newErrors[`grades.${index}.max_value`] = 'Max value must be greater than min value';
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    router.post(route('admin.grading.store'), formData, {
      onSuccess: () => {
        // Success handled by redirect
      },
      onError: (errors) => {
        setErrors(errors);
        setIsSubmitting(false);
      },
      onFinish: () => {
        setIsSubmitting(false);
      },
    });
  };

  return (
    <AdminLayout
      headerTitle="Create Grading System"
      tabName="Create Grading System"
      openedMenu="talent"
      activeSubmenu="talent.grading"
    >
      <Head title="Create Grading System" />

      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href={route('admin.grading.index')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Grading Systems
            </Link>
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="e.g., Academic Grading System"
                    className={errors.name ? 'border-red-500' : ''}
                  />
                  {errors.name && (
                    <p className="text-sm text-red-600">{errors.name}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="is_default">Default System</Label>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="is_default"
                      checked={formData.is_default}
                      onCheckedChange={(checked) => handleInputChange('is_default', checked)}
                    />
                    <Label htmlFor="is_default" className="text-sm text-gray-600">
                      Mark as default grading system
                    </Label>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Describe the purpose and usage of this grading system..."
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Grades Configuration */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Grade Configuration</CardTitle>
                <Button type="button" onClick={addGrade} variant="outline" size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Grade
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {formData.grades.map((grade, index) => (
                  <div key={index} className="border rounded-lg p-4 space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">Grade {index + 1}</h4>
                      {formData.grades.length > 1 && (
                        <Button
                          type="button"
                          onClick={() => removeGrade(index)}
                          variant="ghost"
                          size="sm"
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor={`grade-${index}-label`}>Label *</Label>
                        <Input
                          id={`grade-${index}-label`}
                          value={grade.label}
                          onChange={(e) => handleGradeChange(index, 'label', e.target.value)}
                          placeholder="e.g., A, Excellent, Pass"
                          className={errors[`grades.${index}.label`] ? 'border-red-500' : ''}
                        />
                        {errors[`grades.${index}.label`] && (
                          <p className="text-sm text-red-600">{errors[`grades.${index}.label`]}</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor={`grade-${index}-min`}>Min Value *</Label>
                        <Input
                          id={`grade-${index}-min`}
                          type="number"
                          min="0"
                          max="100"
                          step="0.01"
                          value={grade.min_value}
                          onChange={(e) => handleGradeChange(index, 'min_value', e.target.value)}
                          placeholder="0"
                          className={errors[`grades.${index}.min_value`] ? 'border-red-500' : ''}
                        />
                        {errors[`grades.${index}.min_value`] && (
                          <p className="text-sm text-red-600">{errors[`grades.${index}.min_value`]}</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor={`grade-${index}-max`}>Max Value *</Label>
                        <Input
                          id={`grade-${index}-max`}
                          type="number"
                          min="0"
                          max="100"
                          step="0.01"
                          value={grade.max_value}
                          onChange={(e) => handleGradeChange(index, 'max_value', e.target.value)}
                          placeholder="100"
                          className={errors[`grades.${index}.max_value`] ? 'border-red-500' : ''}
                        />
                        {errors[`grades.${index}.max_value`] && (
                          <p className="text-sm text-red-600">{errors[`grades.${index}.max_value`]}</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor={`grade-${index}-desc`}>Description</Label>
                        <Input
                          id={`grade-${index}-desc`}
                          value={grade.description}
                          onChange={(e) => handleGradeChange(index, 'description', e.target.value)}
                          placeholder="Optional description"
                        />
                      </div>
                    </div>
                  </div>
                ))}

                {errors.grades && (
                  <p className="text-sm text-red-600">{errors.grades}</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex justify-end gap-4">
            <Button type="button" variant="outline" asChild>
              <Link href={route('admin.grading.index')}>Cancel</Link>
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              <Save className="w-4 h-4 mr-2" />
              {isSubmitting ? 'Creating...' : 'Create Grading System'}
            </Button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
}