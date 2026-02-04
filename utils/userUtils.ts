import { db } from '../src/lib/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';

export const slugify = (text: string): string => {
    return text.toString().toLowerCase()
        .replace(/\s+/g, '-')           // Replace spaces with -
        .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
        .replace(/\-\-+/g, '-')         // Replace multiple - with single -
        .replace(/^-+/, '')             // Trim - from start
        .replace(/-+$/, '');            // Trim - from end
};

export const generateBaseHandle = async (name: string): Promise<string> => {
    let baseHandle = slugify(name);
    if (!baseHandle) baseHandle = 'user';

    let handle = baseHandle;
    let isUnique = false;
    let counter = 1;

    // Safety limit to prevent infinite loops (though highly unlikely with Firestore)
    while (!isUnique && counter < 100) {
        const q = query(collection(db, 'users'), where('username', '==', handle));
        const snapshot = await getDocs(q);

        if (snapshot.empty) {
            isUnique = true;
        } else {
            handle = `${baseHandle}${counter}`;
            counter++;
        }
    }
    return handle;
};

export const isValidHandle = (handle: string): boolean => {
    // 3-30 chars, alphanumeric, underscores, no dot at start/end
    const regex = /^[a-zA-Z0-9_](?:[a-zA-Z0-9_.]*[a-zA-Z0-9_])?$/;
    return handle.length >= 3 && handle.length <= 30 && regex.test(handle);
};
