import Dexie, { EntityTable } from 'dexie';

interface Count {
    id: number,
    value: number
}

const db = new Dexie('countDatabase') as Dexie & {
    count: EntityTable<Count, 'id'>
};

db.version(1).stores({
    count: '++id, value'
});

export type { Count };
export { db };