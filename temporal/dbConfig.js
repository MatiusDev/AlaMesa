import { DB_POOL } from './appConfig.js';

export const loadTables = async () => {
    const tables = {
        'clients': `
            CREATE TABLE IF NOT EXISTS clients (
                id VARCHAR(50) PRIMARY KEY,
                name VARCHAR(100) NOT NULL,
                email VARCHAR(150) UNIQUE NOT NULL,
                phone VARCHAR(150) NOT NULL,
                address TEXT
            );
        `,
        'platforms': `
            CREATE TABLE IF NOT EXISTS platforms (
                id SERIAL PRIMARY KEY,
                name VARCHAR(100) UNIQUE NOT NULL
            );
        `,
        'invoices': `
            CREATE TABLE IF NOT EXISTS invoices (
                id VARCHAR(50) PRIMARY KEY,
                client_id VARCHAR(50) REFERENCES clients(id),
                period DATE NOT NULL,
                total_billed DECIMAL(10, 2) NOT NULL,
                total_paid DECIMAL(10, 2) NOT NULL
            );
        `,
        'transactions': `
            CREATE TABLE IF NOT EXISTS transactions (
                id VARCHAR(50) PRIMARY KEY,
                invoice_id VARCHAR(50) REFERENCES invoices(id),
                platform_id INT REFERENCES platforms(id),
                type VARCHAR(150) NOT NULL,
                transaction_date TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
                amount DECIMAL(10, 2) NOT NULL,
                status VARCHAR(150) NOT NULL DEFAULT 'Pendiente'
            );
        `,
    };

    try {
        for (const table in tables) {
            const { rows } = await DB_POOL.query(
                `SELECT to_regclass('${table}') AS table_exists`
            );
            if (rows[0].table_exists) continue;

            const createTableQuery = tables[table];
            await DB_POOL.query(createTableQuery);
            console.log(`Table ${table} created successfully.`);
        }
        console.log('All tables are already set up.');
    } catch (error) {
        console.error('Error creating tables:', error);
    }
}

export const loadData = async (data) => {
    if (!data || typeof data !== 'object'
        || Object.keys(data).length > 1) {
        throw new Error('Invalid data provided for loading into the database.');
    }

    try {
        const table = Object.keys(data)[0];
        const records = data[table];
        if (!Array.isArray(records) || records.length === 0) {
            throw new Error('No records to load into the database.');
        }

        for (const record of records) {
            await create(table, record);
        }
        console.log(`Data loaded into table ${table} successfully.`);
    } catch (error) {
        console.log(error);
        throw new Error(`Error loading data into database: ${error.message}`);
    }
}

export const query = async (text, params) => await DB_POOL.query(text, params);

export const getAll = async (table) => {
    if (!table) throw new Error('Table name is required.');
    const { rows } = await query(`SELECT * FROM ${table}`);
    return rows;
};

export const getById = async (table, id) => {
    if (!table || !id) throw new Error('Table name and ID are required.');
    const { rows } = await query(`SELECT * FROM ${table} WHERE id = $1`, [id]);
    return rows[0];
};

export const create = async (table, data) => {
    if (!table || !data) throw new Error('Table name and data are required.');
    const columns = Object.keys(data).join(', ');
    const values = Object.values(data);
    const placeholders = values.map((_, i) => `$${i + 1}`).join(', ');
    const { rows } = await query(
        `INSERT INTO ${table} (${columns}) VALUES (${placeholders}) RETURNING *`,
        values
    );
    return rows[0];
};

export const update = async (table, id, data) => {
    if (!table || !id || !data) throw new Error('Table, id and data are required.');
    const setString = Object.keys(data).map((key, i) => `${key} = $${i + 2}`).join(', ');
    const values = Object.values(data);
    const { rows } = await query(
        `UPDATE ${table} SET ${setString} WHERE id = $1 RETURNING *`,
        [id, ...values]
    );
    return rows[0];
};

export const remove = async (table, id) => {
    if (!table || !id) throw new Error('Table and id are required.');
    const { rows } = await query(`DELETE FROM ${table} WHERE id = $1 RETURNING *`, [id]);
    return rows[0];
};
