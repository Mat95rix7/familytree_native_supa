export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export function validatePersonForm(data: {
  first_name: string;
  last_name: string;
  gender: string;
  birth_date: string;
}): ValidationResult {
  const errors: string[] = [];

  if (!data.first_name.trim()) {
    errors.push("Le prénom est requis");
  }

  if (!data.last_name.trim()) {
    errors.push("Le nom est requis");
  }

  if (!data.gender) {
    errors.push("Le genre est requis");
  }

  if (!data.birth_date) {
    errors.push("La date de naissance est requise");
  } else if (!isValidDate(data.birth_date)) {
    errors.push("Format de date invalide");
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

export function isValidDate(dateString: string): boolean {
  if (!dateString) return false;
  
  // Support for DD/MM/YYYY or YYYY-MM-DD format
  const date = new Date(convertDateFormat(dateString));
  return date instanceof Date && !isNaN(date.getTime());
}

export function convertDateFormat(dateString: string): string {
  if (dateString.includes('/')) {
    const parts = dateString.split('/');
    if (parts.length === 3) {
      return `${parts[2]}-${parts[1]}-${parts[0]}`;
    }
  }
  return dateString;
}