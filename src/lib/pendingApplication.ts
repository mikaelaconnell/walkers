import type { ApplicationInput } from './types';

let pending: ApplicationInput | null = null;

export function setPendingApplication(a: ApplicationInput) { pending = a; }
export function peekPendingApplication(): ApplicationInput | null {
  return pending;
}
export function clearPendingApplication(): void {
  pending = null;
}
