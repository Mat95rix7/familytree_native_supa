import { useState, useCallback } from 'react';
import { PersonFormData, ImageAsset } from '../types';

export function usePersonForm(initialData?: any) {
  const [formData, setFormData] = useState<PersonFormData>({
    first_name: initialData?.first_name || "",
    last_name: initialData?.last_name || "",
    gender: initialData?.gender || "",
    birth_date: initialData?.birth_date || "",
    birth_place: initialData?.birth_place || "",
    father: initialData?.fatherId?.toString() || "",
    mother: initialData?.motherId?.toString() || "",
    conjoint: initialData?.conjointId?.toString() || "",
    photo: initialData?.photo ? { uri: initialData.photo } : null,
    notes: initialData?.notes || "",
    date_deces: initialData?.dateDeces || "",
  });

  const [showDateDeces, setShowDateDeces] = useState<boolean>(!!initialData?.dateDeces);
  const [loading, setLoading] = useState<boolean>(false);
  const [errors, setErrors] = useState<string[]>([]);

  const updateField = useCallback((field: keyof PersonFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear errors when user starts typing
    if (errors.length > 0) {
      setErrors([]);
    }
  }, [errors.length]);

  const resetForm = useCallback(() => {
    setFormData({
      first_name: "",
      last_name: "",
      gender: "",
      birth_date: "",
      birth_place: "",
      father: "",
      mother: "",
      conjoint: "",
      photo: null,
      notes: "",
      date_deces: "",
    });
    setShowDateDeces(false);
    setErrors([]);
  }, []);

  return {
    formData,
    updateField,
    resetForm,
    showDateDeces,
    setShowDateDeces,
    loading,
    setLoading,
    errors,
    setErrors,
  };
}