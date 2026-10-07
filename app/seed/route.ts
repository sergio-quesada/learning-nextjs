import bcrypt from 'bcrypt';
import { pool } from '@/db/db';
import { invoices, customers, revenue, users } from '../lib/placeholder-data';

const connection = await pool.getConnection();

async function seedUsers() {
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

async function seedInvoices() {
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

async function seedCustomers() {
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

async function seedRevenue() {
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

export async function GET() {
  try {
    await connection.beginTransaction();
    await seedUsers();
    await seedCustomers();
    await seedInvoices();
    await seedRevenue();
    await connection.commit();
    return Response.json({ message: 'Database seeded successfully' });
  } catch (error) {
    return Response.json({ error }, { status: 500 });
  } finally {
    connection.release();
  }
}
