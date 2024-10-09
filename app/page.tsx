import AccountingLineComponent from '@/components/AccountingLineComponent';

export default function Home() {
  return (
    <div className="max-w-7xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">Web Accounting Line</h1>
      <AccountingLineComponent />
    </div>
  );
}