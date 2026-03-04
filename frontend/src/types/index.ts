export type UserRole = 'parent' | 'provider' | 'super_admin';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  phone?: string;
  aadhaar?: string;
  address?: string;
}

export interface Child {
  id: string;
  name: string;
  dateOfBirth: string;
  gender: 'male' | 'female' | 'other';
  parentId: string;
  birthCertificateUrl?: string;
  createdAt: string;
}

export interface VaccinationRecord {
  id: string;
  childId: string;
  vaccineName: string;
  dateAdministered: string;
  location: string;
  administeredBy?: string;
  batchNumber?: string;
  notes?: string;
}

export interface VaccinationSchedule {
  id: string;
  vaccineName: string;
  recommendedAge: string;
  ageInDays: number;
  description: string;
}

export interface Notification {
  id: string;
  childId: string;
  type: 'vaccine' | 'checkup';
  title: string;
  message: string;
  dueDate: string;
  isRead: boolean;
}

export interface VaccinationCenter {
  id: string;
  name: string;
  address: string;
  phone: string;
  latitude: number;
  longitude: number;
  distance?: string;
}

export interface DoctorVisit {
  id: string;
  childId: string;
  doctorName: string;
  visitDate: string;
  reason: string;
  notes?: string;
  prescriptionImages?: string[];
}
