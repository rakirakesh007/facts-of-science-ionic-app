export interface ScienceFact {
    id?: string;
    title: string;
    description: string;
    imageURL?: string;
    category: string;
    isFavorite?: boolean; // New property for UI
  }
  