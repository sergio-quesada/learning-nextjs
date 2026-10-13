import { Card } from '@/app/dashboard/cards';
import RevenueChart from '@/app/dashboard/revenue-chart';
import LatestInvoices from '@/app/dashboard/latest-invoices';
import { lusitana } from '@/app/ui/fonts';
import { fetchRevenuePostgresSQL, fetchLatestInvoicesPostgresSQL, fetchCardDataPostgresSQL, fetchRevenueMySQL, fetchLatestInvoicesMySQL, fetchCardDataMySQL } from '@/app/lib/data';
import { headers } from 'next/headers';

export default async function Page() {
    const headersList = await headers();
    let revenue: any[] = [];
    let latestInvoices: any[] = [];
    let totalPaidInvoices = "";
    let totalPendingInvoices = "";
    let numberOfInvoices = 0;
    let numberOfCustomers = 0;
    console.log(headersList.get('x-pathname'));
    if (headersList.get('x-pathname') || "".startsWith('http://localhost')) {
        revenue = await fetchRevenueMySQL();
        latestInvoices = await fetchLatestInvoicesMySQL();
        totalPaidInvoices = (await fetchCardDataMySQL()).totalPaidInvoices;
        totalPendingInvoices = (await fetchCardDataMySQL()).totalPendingInvoices;
        numberOfInvoices = (await fetchCardDataMySQL()).numberOfInvoices;
        numberOfCustomers = (await fetchCardDataMySQL()).numberOfCustomers;
    } else {
        revenue = await fetchRevenuePostgresSQL();
        latestInvoices = await fetchLatestInvoicesPostgresSQL();
        totalPaidInvoices = (await fetchCardDataPostgresSQL()).totalPaidInvoices;
        totalPendingInvoices = (await fetchCardDataPostgresSQL()).totalPendingInvoices;
        numberOfInvoices = (await fetchCardDataPostgresSQL()).numberOfInvoices;
        numberOfCustomers = (await fetchCardDataPostgresSQL()).numberOfCustomers;
    }
    return (
        <main>
            <h1 className={`${lusitana.className} mb-4 text-xl md:text-2xl`}>
                Dashboard
            </h1>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                <Card title="Collected" value={totalPaidInvoices} type="collected" />
                <Card title="Pending" value={totalPendingInvoices} type="pending" />
                <Card title="Total Invoices" value={numberOfInvoices} type="invoices" />
                <Card
                    title="Total Customers"
                    value={numberOfCustomers}
                    type="customers"
                />
            </div>
            <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-4 lg:grid-cols-8">
                <RevenueChart revenue={revenue} />
                <LatestInvoices latestInvoices={latestInvoices} />
            </div>
        </main>
    );
}