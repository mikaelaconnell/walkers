import type { ApplicationInput } from './types';

let pending: ApplicationInput | null = null;

export function setPendingApplication(a: ApplicationInput) { pending = a; }
export function takePendingApplication(): ApplicationInput | null {
  const a = pending;
  pending = null;
  return a;
}
