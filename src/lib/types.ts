export type DogSize = 'small' | 'medium' | 'large';

export type Profile = {
  id: string;
  first_name: string;
  instagram_handle: string;
  has_dog: boolean;
  dog_name: string | null;
  dog_breed: string | null;
  dog_size: DogSize | null;
  why: string | null;
  membership_status: 'pending' | 'approved' | 'declined';
  role: string;
};

export type ApplicationInput = {
  firstName: string;
  email: string;
  instagramHandle: string;
  hasDog: boolean | null;
  dogName: string;
  dogBreed: string;
  dogSize: DogSize | null;
  why: string;
};
