// utils/normalizeNames.ts
export const normalizeName = (name: string): string => {
    if (!name) return '';
  
    // Remove common suffixes
    const suffixes = [
      'Region',
      'District',
      'Municipal',
      'Metropolis',
      'Municipal District',
      'Metropolitan',
    ];
  
    let normalizedName = name;
    for (const suffix of suffixes) {
      normalizedName = normalizedName.replace(new RegExp(`\\s*${suffix}\\s*`, 'i'), '');
    }
  
    return normalizedName.trim();
  };