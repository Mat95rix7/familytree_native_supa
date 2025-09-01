export interface PersonFormData {
  first_name: string;
  last_name: string;
  gender: string;
  birth_date: string;
  birth_place: string;
  father: string;
  mother: string;
  conjoint: string;
  photo: ImageAsset | null;
  notes: string;
  date_deces: string;
}

export interface ImageAsset {
  uri: string;
  name?: string;
  size?: number;
  type?: string;
  
}

export interface DropdownItem {
  label: string;
  value: string;
}

export interface PersonFormProps {
  initialData?: Personne | null;
  mode?: "add" | "edit";
  onSuccess?: (() => void) | null;
}

export interface Personne {
  id: number;
  first_name: string;
  last_name: string;
  gender: string;
  birth_date: string;
  birth_place?: string;
  fatherId?: number;
  motherId?: number;
  conjointId?: number;
  photo?: string;
  notes?: string;
  dateDeces?: string;
  age?: number;
  children?: Personne[];
}