import { useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { Child, VaccinationRecord } from '@/types';
import { vaccinationSchedule } from '@/data/mockData';
import { useToast } from '@/hooks/use-toast';

export function VaccineNotifications() {
    const { user } = useAuth();
    const { toast } = useToast();
    const hasChecked = useRef(false);

    useEffect(() => {
        // Only run if user is logged in and is a parent
        if (!user || user.role !== 'parent') return;

        // Prevent running multiple times in the same session mount (strict mode double invocation protection)
        if (hasChecked.current) return;

        const checkVaccines = async () => {
            try {
                // Fetch children
                const childrenQ = query(collection(db, 'children'), where('parentId', '==', user.id));
                const childrenSnapshot = await getDocs(childrenQ);
                const children = childrenSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Child));

                if (children.length === 0) return;

                // For each child, check overdue
                for (const child of children) {
                    // Fetch records
                    const recordsQ = query(collection(db, 'vaccination_records'), where('childId', '==', child.id));
                    const recordsSnapshot = await getDocs(recordsQ);
                    const records = recordsSnapshot.docs.map(doc => doc.data() as VaccinationRecord);
                    const administeredVaccines = new Set(records.map(r => r.vaccineName));

                    const birthDate = new Date(child.dateOfBirth);
                    const today = new Date();
                    const ageInDays = Math.floor((today.getTime() - birthDate.getTime()) / (1000 * 60 * 60 * 24));

                    // Check for vaccines that are overdue (e.g., missed by more than 7 days)
                    // We define overdue as: current age > recommended age + 7 days
                    const overdue = vaccinationSchedule.filter(v =>
                        !administeredVaccines.has(v.vaccineName) &&
                        ageInDays > (v.ageInDays + 7)
                    );

                    if (overdue.length > 0) {
                        const vaccineNames = overdue.map(v => v.vaccineName).slice(0, 2).join(', ');
                        const moreCount = overdue.length - 2;

                        // Use a slight delay to ensure toast appears after UI load
                        setTimeout(() => {
                            toast({
                                title: `⚠️ Vaccinations Overdue for ${child.name}`,
                                description: `Pending: ${vaccineNames}${moreCount > 0 ? ` + ${moreCount} more` : ''}. Please schedule immediately.`,
                                variant: "destructive",
                                duration: 8000,
                            });
                        }, 1500);
                    }
                }
                hasChecked.current = true;
            } catch (error) {
                console.error("Error checking vaccines:", error);
            }
        };

        checkVaccines();
    }, [user, toast]);

    return null;
}
