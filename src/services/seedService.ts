
import { db } from '../lib/firebase';
import {
    collection,
    getDocs,
    writeBatch,
    doc,
    setDoc,
    serverTimestamp
} from 'firebase/firestore';
import { User } from '../../types';

export const seedService = {
    resetDatabase: async () => {
        console.log("Starting Database Reset (Real Data Seed)...");

        // 1. WIPE DATA
        const collectionsToWipe = ['users', 'jobs', 'chats', 'follows', 'proposals', 'notifications', 'reviews', 'messages', 'job_requests'];

        for (const colName of collectionsToWipe) {
            console.log(`Wiping collection: ${colName}`);
            const snapshot = await getDocs(collection(db, colName));
            const batch = writeBatch(db);
            let count = 0;

            for (const docSnapshot of snapshot.docs) {
                batch.delete(docSnapshot.ref);
                count++;
                if (count >= 400) {
                    await batch.commit();
                    count = 0;
                }
            }
            if (count > 0) {
                await batch.commit();
            }
        }
        console.log("Data wipe complete.");

        // 2. SEED USERS - 6 Realistic Accounts (3 Clients, 3 Pros)

        // --- CLIENT 1: Sophie Martin (Luxembourg City) ---
        const clientSophie: User = {
            id: 'client_sophie',
            role: 'CLIENT',
            name: 'Sophie Martin',
            email: 'sophie.martin@email.lu', // Pass: 123456
            phone: '+352 691 100 200',
            addresses: [{
                id: 'addr_sophie',
                label: 'Appartement Ville',
                street: 'Avenue de la Liberté',
                number: '45',
                postalCode: 'L-1931',
                locality: 'Luxembourg',
                country: 'Luxembourg'
            }],
            languages: ['FR', 'EN', 'LB'],
            onboardingStep: 5,
            status: 'active',
            avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?ixlib=rb-1.2.1&auto=format&fit=crop&w=256&q=80',
            followers: [],
            following: []
        };

        // --- CLIENT 2: Marc Weber (Esch-sur-Alzette) ---
        const clientMarc: User = {
            id: 'client_marc',
            role: 'CLIENT',
            name: 'Marc Weber',
            email: 'marc.weber@email.lu', // Pass: 123456
            phone: '+352 661 300 400',
            addresses: [{
                id: 'addr_marc',
                label: 'Maison',
                street: 'Rue de l\'Alzette',
                number: '120',
                postalCode: 'L-4010',
                locality: 'Esch-sur-Alzette',
                country: 'Luxembourg'
            }],
            languages: ['LB', 'DE', 'FR'],
            onboardingStep: 5,
            status: 'active',
            avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-1.2.1&auto=format&fit=crop&w=256&q=80',
            followers: [],
            following: []
        };

        // --- CLIENT 3: Elena Costa (Differdange) ---
        const clientElena: User = {
            id: 'client_elena',
            role: 'CLIENT',
            name: 'Elena Costa',
            email: 'elena.costa@email.lu', // Pass: 123456
            phone: '+352 691 500 600',
            addresses: [{
                id: 'addr_elena',
                label: 'Domicile',
                street: 'Grand-Rue',
                number: '15',
                postalCode: 'L-4503',
                locality: 'Differdange',
                country: 'Luxembourg'
            }],
            languages: ['PT', 'FR', 'EN'],
            onboardingStep: 5,
            status: 'active',
            avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-1.2.1&auto=format&fit=crop&w=256&q=80',
            followers: [],
            following: []
        };

        // --- PRO 1: JPS Rénovation (General Contractor) ---
        const proJPS: User = {
            id: 'pro_jps',
            role: 'PRO',
            name: 'Jean Pierre Silva', // Represents JPS Rénovation
            email: 'jps@renovation.lu', // Pass: 123456
            phone: '+352 621 888 777',
            addresses: [{
                id: 'addr_jps',
                label: 'Siège Social',
                street: 'Route d\'Arlon',
                number: '250',
                postalCode: 'L-8010',
                locality: 'Strassen',
                country: 'Luxembourg'
            }],
            companyDetails: {
                legalName: 'JPS Rénovation S.à r.l.',
                legalType: 'sarl',
                vatNumber: 'LU23456789',
                description: 'Entreprise générale de rénovation. Électricité, peinture, et finitions.',
                iban: 'LU90 1234 5678 9012',
            },
            services: [
                { id: 'Electrician', price: 75, unit: 'hour' },
                { id: 'Painter', price: 55, unit: 'm2' }
            ],
            jobTitle: 'Entrepreneur Général',
            languages: ['PT', 'FR', 'LB'],
            isVerified: true,
            rating: 4.8,
            reviewsCount: 42,
            avatar: 'https://images.unsplash.com/photo-1581092921461-eab62e97a783?ixlib=rb-1.2.1&auto=format&fit=crop&w=256&q=80',
            followers: [],
            following: []
        };

        // --- PRO 2: CleanHome Lux (Cleaning Service) ---
        const proClean: User = {
            id: 'pro_clean',
            role: 'PRO',
            name: 'Maria Santos', // CleanHome Lux
            email: 'contact@cleanhome.lu', // Pass: 123456
            phone: '+352 661 222 333',
            addresses: [{
                id: 'addr_clean',
                label: 'Bureau',
                street: 'Rue de Hollerich',
                number: '80',
                postalCode: 'L-1740',
                locality: 'Luxembourg',
                country: 'Luxembourg'
            }],
            companyDetails: {
                legalName: 'CleanHome Lux S.A.',
                legalType: 'societe',
                vatNumber: 'LU34567890',
                description: 'Service de nettoyage professionnel pour particuliers et bureaux.',
                iban: 'LU55 9876 5432 1098',
            },
            services: [
                { id: 'Cleaning', price: 35, unit: 'hour' }
            ],
            jobTitle: 'Service de Nettoyage',
            languages: ['PT', 'FR', 'EN'],
            isVerified: true,
            rating: 4.9,
            reviewsCount: 156,
            avatar: 'https://images.unsplash.com/photo-1520333789090-1afc82db536a?ixlib=rb-1.2.1&auto=format&fit=crop&w=256&q=80',
            followers: [],
            following: []
        };

        // --- PRO 3: TechSolutions (IT Support) ---
        const proTech: User = {
            id: 'pro_tech',
            role: 'PRO',
            name: 'David Muller', // TechSolutions
            email: 'support@techsolutions.lu', // Pass: 123456
            phone: '+352 691 999 000',
            addresses: [{
                id: 'addr_tech',
                label: 'Labo',
                street: 'Avenue Kennedy',
                number: '12',
                postalCode: 'L-1855',
                locality: 'Luxembourg',
                country: 'Luxembourg'
            }],
            companyDetails: {
                legalName: 'TechSolutions G.I.E.',
                legalType: 'societe',
                vatNumber: 'LU45678901',
                description: 'Support informatique, installation réseau et dépannage à domicile.',
                iban: 'LU88 1111 2222 3333',
            },
            services: [
                { id: 'ComputerRepair', price: 90, unit: 'fix' }
            ],
            jobTitle: 'Technicien IT',
            languages: ['EN', 'DE', 'LB', 'FR'],
            isVerified: true,
            rating: 5.0,
            reviewsCount: 12,
            avatar: 'https://images.unsplash.com/photo-1531427186611-ecfd6d936c79?ixlib=rb-1.2.1&auto=format&fit=crop&w=256&q=80',
            followers: [],
            following: []
        };

        console.log("Seeding Users...");
        await setDoc(doc(db, 'users', clientSophie.id), clientSophie);
        await setDoc(doc(db, 'users', clientMarc.id), clientMarc);
        await setDoc(doc(db, 'users', clientElena.id), clientElena);
        await setDoc(doc(db, 'users', proJPS.id), proJPS);
        await setDoc(doc(db, 'users', proClean.id), proClean);
        await setDoc(doc(db, 'users', proTech.id), proTech);

        console.log("Database Reset Complete.");
        alert(`✅ Base de données réinitialisée ! (Senha padrão para todos: 123456)

--- CLIENTS ---
1. Sophie: sophie.martin@email.lu
2. Marc: marc.weber@email.lu
3. Elena: elena.costa@email.lu

--- PROS ---
4. JPS Rénovation: jps@renovation.lu
5. CleanHome: contact@cleanhome.lu
6. TechSolutions: support@techsolutions.lu`);
    }
};
