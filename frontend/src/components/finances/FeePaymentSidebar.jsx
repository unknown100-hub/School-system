import { useState, useEffect } from "react";
import { WalletIcon, Calendar, Receipt, CheckCircle2, AlertCircle, X } from "lucide-react";
import StudentSelect from "./StudentSelect";
import api from "../api";

const PAYMENT_METHODS = ["Cash", "Bank Transfer", "Mpesa", "Cheque", "Card"];
const TERMS = ["T1-2026", "T2-2026", "T3-2026"];

function generateReceiptNo(feeCode, term, sequence) {
  const padded = String(sequence).padStart(4, "0");
  return `${feeCode}-${term.split("-")[1]}-${term.split("-")[0]}-${padded}`;
}

export default function FeePaymentSidebar({ feeCode, feeType, colors, Icon, students = [] }) {
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
        const response = await api.get(`/api/finance/fees?feeCode=${feeCode}`);
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
  }, [feeCode, students]);

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
      remarks 
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

      <main className="flex-1 overflow-y-auto px-8 py-6">
        <h2 className="text-lg font-medium text-gray-900 mb-1">Recent {feeType.label.toLowerCase()} payments</h2>
        <p className="text-sm text-gray-500 mb-5">Recorded in this session — this prototype uses in-memory data, not a live database.</p>

        {records.length === 0 ? (
          <div className="border border-dashed border-gray-300 rounded-lg py-16 text-center text-sm text-gray-400">
            No payments recorded yet. Use the form to add one.
          </div>
        ) : (
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">
                  <th className="px-4 py-2.5">Receipt</th>
                  <th className="px-4 py-2.5">Student</th>
                  <th className="px-4 py-2.5">Term</th>
                  <th className="px-4 py-2.5">Method</th>
                  <th className="px-4 py-2.5">Date</th>
                  <th className="px-4 py-2.5 text-right">Amount</th>
                </tr>
              </thead>
              <tbody>
                {records.map((r) => (
                  <tr key={r.receipt_no} className="border-t border-gray-100">
                    <td className={`px-4 py-2.5 font-medium ${colors.text}`}>{r.receipt_no}</td>
                    <td className="px-4 py-2.5 text-gray-900">{r.student_name}</td>
                    <td className="px-4 py-2.5 text-gray-600">{r.term}</td>
                    <td className="px-4 py-2.5 text-gray-600">{r.payment_method}</td>
                    <td className="px-4 py-2.5 text-gray-600">{new Date(r.payment_date).toISOString().slice(0, 10)}</td>
                    <td className="px-4 py-2.5 text-right text-gray-900 font-medium">KES {Number(r.amount).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
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
