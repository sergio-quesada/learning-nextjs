import { fetchFilteredInvoicesMySQL, fetchFilteredInvoicesPostgresSQL } from '@/app/lib/data';

const isLocal = process.env.VERCEL !== '1';
export async function getTableData(query: string, currentPage: number) {

    if (isLocal) {
        // Ejecutamos en paralelo para máxima velocidad
        const [filteredInvoices] = await Promise.all([
            fetchFilteredInvoicesMySQL(query, currentPage),
        ]);

        return {
            filteredInvoices,
        };
    } else {
        const [filteredInvoices] = await Promise.all([
            fetchFilteredInvoicesPostgresSQL(query, currentPage),
        ]);

        return {
            filteredInvoices,
        };
    }
}