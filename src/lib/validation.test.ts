import { stripHandle, validateApplication } from './validation';
import type { ApplicationInput } from './types';

const valid: ApplicationInput = {
  firstName: 'Maya', email: 'maya@example.com', instagramHandle: '@mayawalks',
  hasDog: true, dogName: 'Miso', dogBreed: 'Corgi mix', dogSize: 'small', why: 'Saturday routine',
};

test('valid application returns no errors', () => {
  expect(validateApplication(valid)).toEqual({});
});

test('stripHandle removes leading @ and lowercases', () => {
  expect(stripHandle('@MayaWalks')).toBe('mayawalks');
  expect(stripHandle('  @@maya ')).toBe('maya');
  expect(stripHandle('maya')).toBe('maya');
});

test('missing first name, email, handle all error', () => {
  const errors = validateApplication({ ...valid, firstName: ' ', email: 'nope', instagramHandle: '@' });
  expect(errors.firstName).toBeTruthy();
  expect(errors.email).toBeTruthy();
  expect(errors.instagramHandle).toBeTruthy();
});

test('unanswered dog question errors', () => {
  expect(validateApplication({ ...valid, hasDog: null }).hasDog).toBeTruthy();
});

test('dog selected without a name errors, but just-me needs none', () => {
  expect(validateApplication({ ...valid, dogName: '' }).dogName).toBeTruthy();
  expect(validateApplication({ ...valid, hasDog: false, dogName: '' })).toEqual({});
});
