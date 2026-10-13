import { headers } from 'next/headers';
import { fetchRevenuePostgresSQL, fetchLatestInvoicesPostgresSQL, fetchCardDataPostgresSQL, fetchRevenueMySQL, fetchLatestInvoicesMySQL, fetchCardDataMySQL } from '@/app/lib/data';

export async function getDashboardData() {
    const headersList = await headers();
    console.log(headersList.get('x-pathname'));
    const pathname = headersList.get('host') || '';
    // Corrección de la condición (ejemplo usando el header o una variable de entorno)
    const isLocal = pathname.startsWith('localhost');

    if (isLocal) {
        // Ejecutamos en paralelo para máxima velocidad
        const [revenue, latestInvoices, cardData] = await Promise.all([
            fetchRevenueMySQL() as Promise<Revenue[]>,
            fetchLatestInvoicesMySQL(),
            fetchCardDataMySQL()
        ]);

        return {
            revenue,
            latestInvoices,
            ...cardData // Extrae automáticamente totalPaidInvoices, numberOfCustomers, etc.
        };
    } else {
        const [revenue, latestInvoicesRaw, cardData] = await Promise.all([
            fetchRevenuePostgresSQL(),
            fetchLatestInvoicesPostgresSQL(),
            fetchCardDataPostgresSQL()
        ]);

        const latestInvoices = latestInvoicesRaw.map((invoice) => ({
            ...invoice,
            amount: Number(invoice.amount),
        }));

        return {
            revenue,
            latestInvoices,
            ...cardData
        };
    }
}