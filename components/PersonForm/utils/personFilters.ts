import { Personne, DropdownItem } from '../types';

const MAX_AGE_FOR_PARENT = 20;

export function createPersonDropdownItems(
  persons: Personne[],
  currentPerson?: Personne,
  filterType: 'father' | 'mother' | 'conjoint' = 'father'
): DropdownItem[] {
  const excludeIds = getExcludeIds(currentPerson);
  
  const filtered = persons.filter(person => {
    if (excludeIds.has(person.id)) return false;
    
    switch (filterType) {
      case 'father':
        return person.gender === 'Homme' && 
               (!person.age || person.age >= MAX_AGE_FOR_PARENT) &&
               !isChild(person, currentPerson);
      
      case 'mother':
        return person.gender === 'Femme' && 
               (!person.age || person.age >= MAX_AGE_FOR_PARENT) &&
               !isChild(person, currentPerson);
      
      case 'conjoint':
        return person.gender !== undefined &&
               (!person.age || person.age >= MAX_AGE_FOR_PARENT) &&
               isOppositeGender(person, currentPerson);
      
      default:
        return false;
    }
  });

  return filtered.map(person => ({
    label: `${person.last_name} ${person.first_name}`,
    value: person.id.toString(),
  }));
}

function getExcludeIds(currentPerson?: Personne): Set<number> {
  const excludeIds = new Set<number>();
  
  if (!currentPerson) return excludeIds;
  
  excludeIds.add(currentPerson.id);
  if (currentPerson.fatherId) excludeIds.add(currentPerson.fatherId);
  if (currentPerson.motherId) excludeIds.add(currentPerson.motherId);
  if (currentPerson.conjointId) excludeIds.add(currentPerson.conjointId);
  
  // Exclure les enfants
  currentPerson.children?.forEach(child => {
    if (child.id !== undefined) excludeIds.add(child.id);
  });

  return excludeIds;
}

function isChild(person: Personne, currentPerson?: Personne): boolean {
  if (!currentPerson?.children) return false;
  return currentPerson.children.some(child => child.id === person.id);
}

function isOppositeGender(person: Personne, currentPerson?: Personne): boolean {
  if (!currentPerson?.gender) return true;
  return (currentPerson.gender === "Homme" && person.gender === "Femme") ||
         (currentPerson.gender === "Femme" && person.gender === "Homme");
}

export function addSelectedPersonToItems(
  items: DropdownItem[],
  persons: Personne[],
  selectedId?: number,
  placeholder: string = "--Aucun--"
): DropdownItem[] {
  const baseItems = [{ label: placeholder, value: "" }, ...items];
  
  if (!selectedId) return baseItems;
  
  const selectedPerson = persons.find(p => p.id === selectedId);
  if (!selectedPerson) return baseItems;
  
  const itemExists = items.some(item => item.value === selectedId.toString());
  if (itemExists) return baseItems;
  
  // Ajouter l'item sélectionné au début (après le placeholder)
  const selectedItem = {
    label: `${selectedPerson.last_name} ${selectedPerson.first_name}`,
    value: selectedId.toString(),
  };
  
  return [baseItems[0], selectedItem, ...items];
}