import { useState, useEffect, useMemo } from 'react';
import { Personne, DropdownItem } from '../types';
import { createPersonDropdownItems, addSelectedPersonToItems } from '../utils/personFilters';
import { apiFetch } from '../../../services/FetchAPI';

export function usePersonsData(initialData?: Personne, mode?: string) {
  const [persons, setPersons] = useState<Personne[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const genderItems: DropdownItem[] = [
    { label: 'Homme', value: 'Homme' },
    { label: 'Femme', value: 'Femme' }
  ];

  // Load persons data
  useEffect(() => {
    const loadPersons = async () => {
      try {
        setLoading(true);
        const response = await apiFetch("/personnes");
        const data: Personne[] = await response.json();
        setPersons(data);
      } catch (err) {
        console.error("Erreur lors du chargement des personnes:", err);
        setError("Impossible de charger la liste des personnes");
      } finally {
        setLoading(false);
      }
    };

    loadPersons();
  }, []);

  // Memoized dropdown items to prevent unnecessary recalculations
  const dropdownItems = useMemo(() => {
    if (persons.length === 0) {
      return {
        fatherItems: [{ label: "--Aucun--", value: "" }],
        motherItems: [{ label: "--Aucune--", value: "" }],
        conjointItems: [{ label: "--Aucun(e)--", value: "" }],
      };
    }

    const fatherCandidates = createPersonDropdownItems(persons, initialData, 'father');
    const motherCandidates = createPersonDropdownItems(persons, initialData, 'mother');
    const conjointCandidates = createPersonDropdownItems(persons, initialData, 'conjoint');

    return {
      fatherItems: addSelectedPersonToItems(
        fatherCandidates, 
        persons, 
        initialData?.fatherId, 
        "--Aucun--"
      ),
      motherItems: addSelectedPersonToItems(
        motherCandidates, 
        persons, 
        initialData?.motherId, 
        "--Aucune--"
      ),
      conjointItems: addSelectedPersonToItems(
        conjointCandidates, 
        persons, 
        initialData?.conjointId, 
        "--Aucun(e)--"
      ),
    };
  }, [persons, initialData]);

  return {
    persons,
    genderItems,
    ...dropdownItems,
    loading,
    error,
  };
}