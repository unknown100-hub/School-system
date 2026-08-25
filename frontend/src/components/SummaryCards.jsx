const cash = (n) => `KES ${Number(n || 0).toLocaleString()}`;
export default function SummaryCards({ data }) { return <div className="finance-summary"><article><small>Collected</small><strong>{cash(data?.collected)}</strong></article><article><small>Receipts</small><strong>{data?.payment_count || 0}</strong></article></div>; }
