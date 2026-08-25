import PaymentTable from '../components/PaymentTable';
export default function StudentFinance({ payments = [] }) { return <section className="finance-page"><div className="finance-panel"><h3>Payment history</h3><PaymentTable payments={payments}/></div></section>; }
