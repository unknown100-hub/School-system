function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>'"]/g, (character) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;'
  }[character]));
}

function printReceipt(payment) {
  const receiptWindow = window.open('', '_blank', 'noopener,noreferrer,width=720,height=720');
  if (!receiptWindow) return window.alert('Please allow pop-ups to print the receipt.');
  const amount = `KES ${Number(payment.amount).toLocaleString()}`;
  receiptWindow.document.write(`<!doctype html><html><head><title>Receipt ${escapeHtml(payment.receipt_no)}</title><style>body{margin:0;padding:32px;color:#173c3d;font:16px Arial,sans-serif}.receipt{max-width:620px;margin:0 auto;border:1px solid #d9d3c6;padding:30px}h1{margin:0;font-size:25px}p{color:#5f6e69}table{width:100%;border-collapse:collapse;margin-top:25px}th,td{padding:12px 0;border-bottom:1px solid #e8e2d6;text-align:left}th{width:42%;color:#5f6e69;font-size:13px;text-transform:uppercase}.amount{font-size:22px;font-weight:700}.status{color:#216044;font-weight:700}@media print{body{padding:0}.receipt{border:0}}</style></head><body><main class="receipt"><h1>School System</h1><p>Fee payment receipt</p><table><tr><th>Receipt number</th><td>${escapeHtml(payment.receipt_no)}</td></tr><tr><th>Learner</th><td>${escapeHtml(payment.student_name)}</td></tr><tr><th>Admission number</th><td>${escapeHtml(payment.admission_number)}</td></tr><tr><th>Branch</th><td>${escapeHtml(payment.branch)}</td></tr><tr><th>Payment date</th><td>${escapeHtml(payment.payment_date)}</td></tr><tr><th>Payment method</th><td>${escapeHtml(payment.payment_method)}</td></tr><tr><th>Amount paid</th><td class="amount">${escapeHtml(amount)}</td></tr><tr><th>Status</th><td class="status">${escapeHtml(payment.status)}</td></tr></table></main><script>window.onload=()=>window.print();<\/script></body></html>`);
  receiptWindow.document.close();
}

export default function PaymentTable({ payments, loading }) {
  if (loading) return <p>Loading payments…</p>;
  if (!payments.length) return <p>No payments recorded yet.</p>;
  return <table className="finance-table"><thead><tr><th>Receipt</th><th>Learner</th><th>Date</th><th>Method</th><th>Amount</th><th>Status</th><th>Receipt</th></tr></thead><tbody>{payments.map((payment) => <tr key={payment.id}><td>{payment.receipt_no}</td><td>{payment.student_name}<small>{payment.admission_number}</small></td><td>{payment.payment_date}</td><td>{payment.payment_method}</td><td>KES {Number(payment.amount).toLocaleString()}</td><td>{payment.status}</td><td><button type="button" className="receipt-print-button" onClick={() => printReceipt(payment)}>Print receipt</button></td></tr>)}</tbody></table>;
}
