import { Child, VaccinationRecord, VaccinationSchedule, Notification, VaccinationCenter, DoctorVisit } from '@/types';


export const mockChildren: Child[] = [
  {
    id: '1',
    name: 'Aarav Sharma',
    dateOfBirth: '2024-08-15',
    gender: 'male',
    parentId: '1',
    createdAt: '2024-08-15',
  },
];

export const mockVaccinationRecords: VaccinationRecord[] = [
  {
    id: '1',
    childId: '1',
    vaccineName: 'BCG',
    dateAdministered: '2024-08-16',
    location: 'City Hospital',
    administeredBy: 'Dr. Patel',
  },
  {
    id: '2',
    childId: '1',
    vaccineName: 'Hepatitis B (Birth Dose)',
    dateAdministered: '2024-08-16',
    location: 'City Hospital',
    administeredBy: 'Dr. Patel',
  },
  {
    id: '3',
    childId: '1',
    vaccineName: 'OPV-0',
    dateAdministered: '2024-08-16',
    location: 'City Hospital',
    administeredBy: 'Dr. Patel',
  },
  {
    id: '4',
    childId: '1',
    vaccineName: 'DPT-1',
    dateAdministered: '2024-10-10',
    location: 'Primary Health Center',
    administeredBy: 'Dr. Singh',
  },
];

export const vaccinationSchedule: VaccinationSchedule[] = [
  { id: '1', vaccineName: 'BCG', recommendedAge: 'At Birth', ageInDays: 0, description: 'Protects against tuberculosis' },
  { id: '2', vaccineName: 'Hepatitis B (Birth Dose)', recommendedAge: 'At Birth', ageInDays: 0, description: 'Protects against Hepatitis B' },
  { id: '3', vaccineName: 'OPV-0', recommendedAge: 'At Birth', ageInDays: 0, description: 'Oral Polio Vaccine' },
  { id: '4', vaccineName: 'DPT-1', recommendedAge: '6 Weeks', ageInDays: 42, description: 'Diphtheria, Pertussis, Tetanus' },
  { id: '5', vaccineName: 'IPV-1', recommendedAge: '6 Weeks', ageInDays: 42, description: 'Inactivated Polio Vaccine' },
  { id: '6', vaccineName: 'Hepatitis B-2', recommendedAge: '6 Weeks', ageInDays: 42, description: 'Second dose of Hepatitis B' },
  { id: '7', vaccineName: 'DPT-2', recommendedAge: '10 Weeks', ageInDays: 70, description: 'Second dose of DPT' },
  { id: '8', vaccineName: 'IPV-2', recommendedAge: '10 Weeks', ageInDays: 70, description: 'Second dose of IPV' },
  { id: '9', vaccineName: 'DPT-3', recommendedAge: '14 Weeks', ageInDays: 98, description: 'Third dose of DPT' },
  { id: '10', vaccineName: 'IPV-3', recommendedAge: '14 Weeks', ageInDays: 98, description: 'Third dose of IPV' },
  { id: '11', vaccineName: 'Measles-1', recommendedAge: '9 Months', ageInDays: 270, description: 'First dose of Measles vaccine' },
  { id: '12', vaccineName: 'MR-1', recommendedAge: '9 Months', ageInDays: 270, description: 'Measles-Rubella vaccine' },
  { id: '13', vaccineName: 'DPT Booster-1', recommendedAge: '16-24 Months', ageInDays: 480, description: 'First booster of DPT' },
  { id: '14', vaccineName: 'Measles-2', recommendedAge: '16-24 Months', ageInDays: 480, description: 'Second dose of Measles' },
  { id: '15', vaccineName: 'OPV Booster', recommendedAge: '16-24 Months', ageInDays: 480, description: 'Booster dose of OPV' },
];

export const mockNotifications: Notification[] = [
  {
    id: '1',
    childId: '1',
    type: 'vaccine',
    title: 'IPV-2 Due Soon',
    message: 'IPV-2 vaccine for Aarav is due in 3 days',
    dueDate: '2024-12-16',
    isRead: false,
  },
  {
    id: '2',
    childId: '1',
    type: 'checkup',
    title: 'Monthly Checkup',
    message: 'Schedule monthly health checkup for Aarav',
    dueDate: '2024-12-20',
    isRead: false,
  },
  {
    id: '3',
    childId: '1',
    type: 'vaccine',
    title: 'DPT-3 Coming Up',
    message: 'DPT-3 vaccine for Aarav is due in 10 days',
    dueDate: '2024-12-23',
    isRead: true,
  },
];

export const mockVaccinationCenters: VaccinationCenter[] = [
  {
    id: '1',
    name: 'City General Hospital',
    address: '123 Main Street, Downtown',
    phone: '+91 98765 43210',
    latitude: 28.6139,
    longitude: 77.2090,
    distance: '1.2 km',
  },
  {
    id: '2',
    name: 'Primary Health Center',
    address: '45 Health Avenue, Sector 5',
    phone: '+91 98765 43211',
    latitude: 28.6200,
    longitude: 77.2150,
    distance: '2.5 km',
  },
  {
    id: '3',
    name: 'Child Wellness Clinic',
    address: '78 Care Road, Model Town',
    phone: '+91 98765 43212',
    latitude: 28.6100,
    longitude: 77.2000,
    distance: '3.1 km',
  },
  {
    id: '4',
    name: 'Government Vaccination Center',
    address: '90 Government Complex, Civil Lines',
    phone: '+91 98765 43213',
    latitude: 28.6250,
    longitude: 77.2200,
    distance: '4.0 km',
  },
];

export const mockDoctorVisits: DoctorVisit[] = [
  {
    id: '1',
    childId: '1',
    doctorName: 'Dr. Sarah Smith',
    visitDate: '2024-09-10',
    reason: 'Regular Checkup',
    notes: 'Growth is normal. Weight: 4.5kg',
    prescriptionImages: []
  },
  {
    id: '2',
    childId: '1',
    doctorName: 'Dr. Rajesh Kumar',
    visitDate: '2024-11-05',
    reason: 'Fever',
    notes: 'Viral fever diagnosed. Prescribed paracetamol.',
    prescriptionImages: []
  }
];

