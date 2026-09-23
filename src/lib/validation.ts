import type { ApplicationInput } from './types';

export type ApplicationErrors = Partial<Record<'firstName' | 'email' | 'instagramHandle' | 'hasDog' | 'dogName' | 'why', string>>;

export function stripHandle(raw: string): string {
  return raw.trim().replace(/^@+/, '').toLowerCase();
}

export function validateApplication(input: ApplicationInput): ApplicationErrors {
  const errors: ApplicationErrors = {};
  if (!input.firstName.trim()) errors.firstName = 'we need your first name';
  if (!/^\S+@\S+\.\S+$/.test(input.email.trim())) errors.email = 'we need a real email so your approval can find you';
  if (!stripHandle(input.instagramHandle)) errors.instagramHandle = 'we check instagram so everyone on the walk is a real person';
  if (input.hasDog === null) errors.hasDog = 'let us know either way';
  if (input.hasDog === true && !input.dogName.trim()) errors.dogName = 'what should we call the dog?';
  if (!input.why.trim()) errors.why = 'a sentence is plenty, but we do read them';
  return errors;
}
