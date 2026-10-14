import { headers } from 'next/headers';
import { fetchFilteredInvoicesMySQL, fetchFilteredInvoicesPostgresSQL } from '@/app/lib/data';

export async function getTableData(query: string, currentPage: number) {
    const headersList = await headers();
    console.log(headersList.get('x-pathname'));
    const pathname = headersList.get('host') || '';
    // Corrección de la condición (ejemplo usando el header o una variable de entorno)
    const isLocal = pathname.startsWith('localhost');

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