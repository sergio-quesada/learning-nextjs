import postgres from 'postgres';
import { pool } from '@/db/db';


async function listInvoicesMySQL() {

  const connection = await pool.getConnection();
  const [data] = await pool.query(`
    SELECT invoices.amount, customers.name
    FROM invoices
    JOIN customers ON invoices.customer_id = customers.id
    WHERE invoices.amount = 666;
    `);

  return data;
}

async function listInvoicesPostgresSQL() {
  const sql = postgres(process.env.POSTGRES_URL!, { ssl: 'require' });
  const data = await sql`
    SELECT invoices.amount, customers.name
    FROM invoices
    JOIN customers ON invoices.customer_id = customers.id
    WHERE invoices.amount = 666;
  `;

  return data;
}

export async function GET(request: Request) {
  try {
    if (request.url.startsWith('http://localhost')) {
      return Response.json(await listInvoicesMySQL());
    }
    else {
      return Response.json(await listInvoicesPostgresSQL());
    }
  } catch (error) {
    return Response.json({ error }, { status: 500 });
  }
}