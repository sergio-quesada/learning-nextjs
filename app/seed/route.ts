import bcrypt from 'bcrypt';
import postgres from 'postgres';
import { pool } from '@/db/db';
import { invoices, customers, revenue, users } from '../lib/placeholder-data';

const sql = postgres(process.env.POSTGRES_URL!, { ssl: 'require', prepare: false });

async function seedUsersPostgresSQL() {
  await sql`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`;
  await sql`
    CREATE TABLE IF NOT EXISTS users (
      id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL
    );
  `;

  const insertedUsers = await Promise.all(
    users.map(async (user) => {
      const hashedPassword = await bcrypt.hash(user.password, 10);
      return sql`
        INSERT INTO users (id, name, email, password)
        VALUES (${user.id}, ${user.name}, ${user.email}, ${hashedPassword})
        ON CONFLICT (id) DO NOTHING;
      `;
    }),
  );

  return insertedUsers;
}

async function seedInvoicesPostgresSQL() {
  await sql`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`;

  await sql`
    CREATE TABLE IF NOT EXISTS invoices (
      id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
      customer_id UUID NOT NULL,
      amount INT NOT NULL,
      status VARCHAR(255) NOT NULL,
      date DATE NOT NULL
    );
  `;

  const insertedInvoices = await Promise.all(
    invoices.map(
      (invoice) => sql`
        INSERT INTO invoices (customer_id, amount, status, date)
        VALUES (${invoice.customer_id}, ${invoice.amount}, ${invoice.status}, ${invoice.date})
        ON CONFLICT (id) DO NOTHING;
      `,
    ),
  );

  return insertedInvoices;
}

async function seedCustomersPostgresSQL() {
  await sql`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`;

  await sql`
    CREATE TABLE IF NOT EXISTS customers (
      id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) NOT NULL,
      image_url VARCHAR(255) NOT NULL
    );
  `;

  const insertedCustomers = await Promise.all(
    customers.map(
      (customer) => sql`
        INSERT INTO customers (id, name, email, image_url)
        VALUES (${customer.id}, ${customer.name}, ${customer.email}, ${customer.image_url})
        ON CONFLICT (id) DO NOTHING;
      `,
    ),
  );

  return insertedCustomers;
}

async function seedRevenuePostgresSQL() {
  await sql`
    CREATE TABLE IF NOT EXISTS revenue (
      month VARCHAR(4) NOT NULL UNIQUE,
      revenue INT NOT NULL
    );
  `;

  const insertedRevenue = await Promise.all(
    revenue.map(
      (rev) => sql`
        INSERT INTO revenue (month, revenue)
        VALUES (${rev.month}, ${rev.revenue})
        ON CONFLICT (month) DO NOTHING;
      `,
    ),
  );

  return insertedRevenue;
}

const connection = await pool.getConnection();

async function seedUsersMySQL() {
  await connection.query(`
    CREATE TABLE IF NOT EXISTS users (
      id CHAR(36) PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) NOT NULL UNIQUE,
      password TEXT NOT NULL
    );
  `);

  const insertedUsers = await Promise.all(
    users.map(async (user) => {
      const hashedPassword = await bcrypt.hash(user.password, 10);

      return connection.query(
        `
        INSERT INTO users (id, name, email, password)
        VALUES (?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE id = id;
        `,
        [
          user.id,
          user.name,
          user.email,
          hashedPassword,
        ],
      );
    }),
  );

  return insertedUsers;
}

async function seedInvoicesMySQL() {
  await connection.query(`
    CREATE TABLE IF NOT EXISTS invoices (
      id int auto_increment PRIMARY KEY,
      customer_id CHAR(36) NOT NULL,
      amount INT NOT NULL,
      status VARCHAR(255) NOT NULL,
      date DATE NOT NULL
    );
  `);

  const insertedInvoices = await Promise.all(
    invoices.map(
      (invoice) => connection.query(
        `
        INSERT INTO invoices (customer_id, amount, status, date)
        VALUES (?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE id = id;
        `,
        [
          invoice.customer_id,
          invoice.amount,
          invoice.status,
          invoice.date,
        ],
      ),
    ),
  );

  return insertedInvoices;
}

async function seedCustomersMySQL() {
  await connection.query(`
    CREATE TABLE IF NOT EXISTS customers (
      id CHAR(36) PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) NOT NULL,
      image_url VARCHAR(255) NOT NULL
    );
  `);

  const insertedCustomers = await Promise.all(
    customers.map(
      (customer) => connection.query(
        `
        INSERT INTO customers (id, name, email, image_url)
        VALUES (?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE id = id;
        `,
        [
          customer.id,
          customer.name,
          customer.email,
          customer.image_url,
        ],
      ),
    ),
  );

  return insertedCustomers;
}

async function seedRevenueMySQL() {
  await connection.query(`
    CREATE TABLE IF NOT EXISTS revenue (
      month VARCHAR(4) NOT NULL UNIQUE,
      revenue INT NOT NULL
    );
  `);

  const insertedRevenue = await Promise.all(
    revenue.map(
      (rev) => connection.query(
        `
        INSERT INTO revenue (month, revenue)
        VALUES (?, ?)
        ON DUPLICATE KEY UPDATE month = month;
        `,
        [
          rev.month,
          rev.revenue,
        ],
      ),
    ),
  );

  return insertedRevenue;
}

export async function GET(request: Request) {
  try {
    if (request.url.startsWith('http://localhost')) {
      await connection.beginTransaction();
      await seedUsersMySQL();
      await seedCustomersMySQL();
      await seedInvoicesMySQL();
      await seedRevenueMySQL();
      await connection.commit();
      return Response.json({ message: 'Database seeded successfully' });
    }
    else {
      const result = await sql.begin((sql) => [
        seedUsersPostgresSQL(),
        seedCustomersPostgresSQL(),
        seedInvoicesPostgresSQL(),
        seedRevenuePostgresSQL(),
      ]);
    }
    return Response.json({ message: 'Database seeded successfully' });
  } catch (error) {
    return Response.json({ error }, { status: 500 });
  }
}