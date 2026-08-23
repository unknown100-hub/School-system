import { useState, useEffect } from "react";
import { WalletIcon, Calendar, Receipt, CheckCircle2, AlertCircle, X, Printer } from "lucide-react";
import StudentSelect from "./StudentSelect";
import api from "../../api";

const PAYMENT_METHODS = ["Cash", "Bank Transfer", "Mpesa", "Cheque", "Card"];
const TERMS = ["T1-2026", "T2-2026", "T3-2026"];

function generateReceiptNo(feeCode, term, sequence) {
  const padded = String(sequence).padStart(4, "0");
  return `${feeCode}-${term.split("-")[1]}-${term.split("-")[0]}-${padded}`;
}

export default function FeePaymentSidebar({ feeCode, feeType, colors, Icon, students = [], branchName }) {
  const [studentId, setStudentId] = useState("");
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState(PAYMENT_METHODS[0]);
  const [term, setTerm] = useState(TERMS[0]);
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [remarks, setRemarks] = useState("");
  const [records, setRecords] = useState([]);
  const [toast, setToast] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const student = students.find((s) => String(s.Admission_Number) === String(studentId));
  const canSubmit = studentId && amount && Number(amount) > 0 && date;

  useEffect(() => {
    async function fetchFees() {
      try {
        const response = await api.get(`/api/finance/fees?feeCode=${feeCode}&branch=${encodeURIComponent(branchName || 'Githurai Branch')}`);
        const fetchedRecords = (response.data.fees || []).map(f => {
          const s = students.find(st => String(st.Admission_Number) === String(f.student_id));
          return {
            ...f,
            student_name: s ? `${s.First_Name || ''} ${s.Last_Name || ''}`.trim() : f.parent_name
          };
        });
        setRecords(fetchedRecords);
      } catch (err) {
        console.error("Failed to fetch fees:", err);
      }
    }
    fetchFees();
  }, [feeCode, students, branchName]);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!canSubmit || !student || isLoading) return;

    setIsLoading(true);
    const receipt_no = generateReceiptNo(feeCode, term, records.length + 1);
    const payload = {
      receipt_no,
      student_id: student.Admission_Number,
      parent_name: student.parent_guardian,
      fee_code: feeCode,
      amount: Number(amount),
      payment_method: method,
      payment_date: date,
      term,
      remarks,
      branch: branchName || 'Githurai Branch'
    };

    try {
      const response = await api.post("/api/finance/fees", payload);
      const student_name = `${student.First_Name || ''} ${student.Last_Name || ''}`.trim();
      setRecords([{ ...response.data.fee, student_name }, ...records]);
      setToast({ type: "success", text: `Payment recorded: ${receipt_no}` });
      setAmount("");
      setRemarks("");
    } catch (err) {
      setToast({ type: "error", text: err.response?.data?.message || "Failed to record payment" });
    } finally {
      setIsLoading(false);
      setTimeout(() => setToast(null), 3000);
    }
  }

  const printReport = () => {
    const printContent = document.getElementById('report-table').outerHTML;
    const printWindow = window.open('', '_blank', 'width=800,height=600');
    printWindow.document.write(`
      <html>
        <head>
          <title>${feeType.label} Report</title>
          <style>
            body { font-family: sans-serif; padding: 20px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; }
            .no-print { display: none !important; }
          </style>
        </head>
        <body>
          ${printContent}
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 250);
  };

  const printReceipt = (record) => {
    const printWindow = window.open('', '_blank', 'width=600,height=400');
    printWindow.document.write(`
      <html>
        <head>
          <title>Receipt - ${record.receipt_no}</title>
          <style>
            body { font-family: sans-serif; padding: 40px; line-height: 1.6; }
            .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 20px; margin-bottom: 20px; }
            .header h1 { margin: 0; font-size: 24px; text-transform: uppercase; }
            .header p { margin: 5px 0 0; color: #555; }
            .row { display: flex; justify-content: space-between; margin-bottom: 10px; }
            .label { font-weight: bold; color: #333; }
            .value { text-align: right; }
            .total { font-size: 20px; font-weight: bold; border-top: 2px solid #333; padding-top: 15px; margin-top: 20px; text-align: right; }
            .footer { text-align: center; margin-top: 40px; font-size: 12px; color: #777; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Green Angels Academy</h1>
            <p>${branchName || 'Githurai Branch'}</p>
            <p>Official Receipt</p>
          </div>
          <div class="row"><span class="label">Receipt No:</span> <span class="value">${record.receipt_no}</span></div>
          <div class="row"><span class="label">Date:</span> <span class="value">${new Date(record.payment_date).toISOString().slice(0, 10)}</span></div>
          <div class="row"><span class="label">Student Name:</span> <span class="value">${record.student_name}</span></div>
          <div class="row"><span class="label">Term:</span> <span class="value">${record.term}</span></div>
          <div class="row"><span class="label">Fee Type:</span> <span class="value">${feeType.label}</span></div>
          <div class="row"><span class="label">Payment Method:</span> <span class="value">${record.payment_method}</span></div>
          ${record.remarks ? `<div class="row"><span class="label">Remarks:</span> <span class="value">${record.remarks}</span></div>` : ''}
          <div class="total">Amount Paid: KES ${Number(record.amount).toLocaleString()}</div>
          <div class="footer">Thank you for your payment.</div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 250);
  };

  return (
    <div className="flex h-full bg-gray-50 font-sans">
      <aside className="w-80 bg-white border-r border-gray-200 flex flex-col shrink-0">
        <div className="px-5 py-4 border-b border-gray-200 flex items-center gap-2">
          <Icon className={`w-5 h-5 ${colors.text}`} />
          <h1 className="text-base font-medium text-gray-900">{feeType.label} entry</h1>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          <StudentSelect students={students} value={studentId} onChange={setStudentId} colors={colors} />

          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Amount (KES)</label>
            <div className="relative">
              <WalletIcon className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input type="number" min="1" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="12000"
                className={`w-full border border-gray-300 rounded-md pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 ${colors.ring}`} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Term</label>
              <select value={term} onChange={(e) => setTerm(e.target.value)} className={`w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 ${colors.ring}`}>
                {TERMS.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Method</label>
              <select value={method} onChange={(e) => setMethod(e.target.value)} className={`w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 ${colors.ring}`}>
                {PAYMENT_METHODS.map((m) => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Date paid</label>
            <div className="relative">
              <Calendar className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className={`w-full border border-gray-300 rounded-md pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 ${colors.ring}`} />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Remarks (optional)</label>
            <textarea value={remarks} onChange={(e) => setRemarks(e.target.value)} rows={2} placeholder="Partial payment, balance follows next month"
              className={`w-full border border-gray-300 rounded-md px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 ${colors.ring}`} />
          </div>

          <button type="submit" disabled={!canSubmit}
            className={`w-full flex items-center justify-center gap-2 ${colors.bg} disabled:bg-gray-300 disabled:cursor-not-allowed text-white text-sm font-medium py-2.5 rounded-md ${colors.bgHover} transition-colors`}>
            <Receipt className="w-4 h-4" />
            Record payment
          </button>
        </form>
      </aside>

      <main className="flex-1 flex flex-col px-8 py-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-medium text-gray-900 text-center">Recent {feeType.label.toLowerCase()} payments</h2>
          {records.length > 0 && (
            <button onClick={printReport} className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors">
              <Printer className="w-4 h-4" />
              Print Report
            </button>
          )}
        </div>
        {records.length === 0 ? (
          <div className="flex-1 border border-dashed border-gray-300 rounded-lg flex items-center justify-center text-sm text-gray-400">
            No payments recorded yet. Use the form to add one.
          </div>
        ) : (
          <div className="flex-1 bg-white rounded-lg overflow-hidden flex flex-col">
            <div className="flex-1 overflow-y-auto">
              <table id="report-table" className="w-full text-sm table-fixed finance-table">
                <thead className="sticky top-0 bg-gray-50 z-10 shadow-sm">
                  <tr className="text-left text-xs font-medium text-gray-500 uppercase tracking-wide">
                    <th className="px-6 py-4">Receipt</th>
                    <th className="px-6 py-4">Student</th>
                    <th className="px-6 py-4">Branch</th>
                    <th className="px-6 py-4">Term</th>
                    <th className="px-6 py-4">Method</th>
                    <th className="px-6 py-4">Date</th>
                    <th className="px-6 py-4 text-right">Amount</th>
                    <th className="px-6 py-4 text-center no-print" style={{ width: '80px' }}>Print</th>
                  </tr>
                </thead>
                <tbody>
                  {records.map((r) => (
                    <tr key={r.receipt_no} className="border-t border-gray-100 hover:bg-gray-50 transition-colors">
                      <td className={`px-6 py-4 font-medium ${colors.text} truncate`}>{r.receipt_no}</td>
                      <td className="px-6 py-4 text-gray-900 truncate">{r.student_name}</td>
                      <td className="px-6 py-4 text-gray-600 truncate">{r.branch || 'Githurai Branch'}</td>
                      <td className="px-6 py-4 text-gray-600 truncate">{r.term}</td>
                      <td className="px-6 py-4 text-gray-600 truncate">{r.payment_method}</td>
                      <td className="px-6 py-4 text-gray-600 truncate">{new Date(r.payment_date).toISOString().slice(0, 10)}</td>
                      <td className="px-6 py-4 text-right text-gray-900 font-medium truncate">KES {Number(r.amount).toLocaleString()}</td>
                      <td className="px-6 py-4 text-center no-print">
                        <button onClick={() => printReceipt(r)} className="text-gray-500 hover:text-gray-700" title="Print Receipt">
                          <Printer className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {toast && (
        <div className="fixed bottom-6 right-6 bg-white border border-gray-200 shadow-lg rounded-md px-4 py-3 flex items-center gap-2 text-sm">
          <CheckCircle2 className={`w-4 h-4 ${colors.dot}`} />
          <span className="text-gray-800">{toast.text}</span>
          <button onClick={() => setToast(null)} className="ml-2 text-gray-400 hover:text-gray-600">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}
