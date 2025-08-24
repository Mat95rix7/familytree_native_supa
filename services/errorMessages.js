export const validateField = (name, value) => {
    switch (name) {
      
      case 'username':
        if (!value) return '';
        if (value.length < 3) return 'Le nom d\'utilisateur doit contenir au moins 3 caractères';
        if (value.length > 20) return 'Le nom d\'utilisateur ne doit pas dépasser 20 caractères';
        if (!/^[a-zA-Z0-9_]+$/.test(value)) return "Le nom d'utilisateur ne peut contenir que des lettres, chiffres et _";
        return '';
        
        case 'actualPassword':
          if (!value) return "Le mot de passe actuel est requis";
          return '';
        
        case 'confirmPassword':
          if (!value) return "La confirmation du mot de passe est requise";
          return '';
  
      case 'email':
        if (!value) return '';
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
          return 'Veuillez entrer une adresse email valide';
        }
        return '';
  
      case 'password':
        if (value.length < 8) {
          return 'Le mot de passe doit contenir au moins 8 caractères';
        }
        if (!/[A-Z]/.test(value)) {
          return 'Le mot de passe doit contenir au moins une majuscule';
        }
        if (!/[0-9]/.test(value)) {
          return 'Le mot de passe doit contenir au moins un chiffre';
        }
        return '';
      default:
        return '';
    }
  };

  