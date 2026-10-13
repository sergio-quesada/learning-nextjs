import { Card } from '@/app/dashboard/cards';
import RevenueChart from '@/app/dashboard/revenue-chart';
import LatestInvoices from '@/app/dashboard/latest-invoices';
import { lusitana } from '@/app/ui/fonts';
import { getDashboardData } from '@/src/services/dashboard';

export default async function Page() {
    const data = await getDashboardData();
    return (
        <main>
            <h1 className={`${lusitana.className} mb-4 text-xl md:text-2xl`}>
                Dashboard
            </h1>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                <Card title="Collected" value={data.totalPaidInvoices} type="collected" />
                <Card title="Pending" value={data.totalPendingInvoices} type="pending" />
                <Card title="Total Invoices" value={data.numberOfInvoices} type="invoices" />
                <Card
                    title="Total Customers"
                    value={data.numberOfCustomers}
                    type="customers"
                />
            </div>
            <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-4 lg:grid-cols-8">
                <RevenueChart revenue={data.revenue} />
                <LatestInvoices latestInvoices={data.latestInvoices} />
            </div>
        </main>
    );
}