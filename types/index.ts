export type Personne = {
  id: number;
  first_name: string;
  last_name: string;
  gender?: string;
  age?: number;
  birth_date?: string;
  birth_place?: string;
  dateDeces?: string;
  photo?: string;
  notes?: string;
  father?: Partial<Personne>;
  fatherId?: number;
  mother?: Partial<Personne>;
  motherId?: number;
  conjoint?: Partial<Personne>;
  conjointId?: number;
  children?: Partial<Personne>[];
};