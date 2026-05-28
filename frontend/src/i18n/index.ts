import en from './en';
import ptBR from './pt-BR';

export const dictionaries = {
  en,
  'pt-BR': ptBR
} as const;

export type Locale = keyof typeof dictionaries;

export const getDictionary = (locale: Locale) => dictionaries[locale];
