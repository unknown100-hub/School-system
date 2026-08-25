import { useState, useEffect } from "react";
import { WalletIcon, Calendar, Receipt, CheckCircle2, X } from "lucide-react";
import StudentSelect from "./StudentSelect";
import api from "../../api";

const PAYMENT_METHODS = ["Cash", "Bank Transfer", "Mpesa", "Cheque", "Card"];
const TERMS = ["T1-2026", "T2-2026", "T3-2026"];

function generateReceiptNo(feeCode, term) {
  const uniqueSuffix = String(Date.now()).slice(-6);
  return `${feeCode}-${term.split("-")[1]}-${term.split("-")[0]}-${uniqueSuffix}`;
}


export default function FeePaymentSidebar({ feeCode, feeType, colors, Icon, students = [], branchName }) {
  const [studentId, setStudentId] = useState("");
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState(PAYMENT_METHODS[0]);
  const [term, setTerm] = useState(TERMS[0]);
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [remarks, setRemarks] = useState("");
  const [balance, setBalance] = useState(null);
  const [balanceError, setBalanceError] = useState("");
  const [balanceVersion, setBalanceVersion] = useState(0);
  const [toast, setToast] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setAmount(feeType.defaultAmount ? String(feeType.defaultAmount) : '');
  }, [feeCode, feeType.defaultAmount]);

  const student = students.find((s) => String(s.Admission_Number) === String(studentId));
  const canSubmit = studentId && amount && Number(amount) > 0 && date;

  useEffect(() => {
    if (!student) {
      setBalance(null);
      setBalanceError("");
      return;
    }
    let active = true;
    setBalanceError("");
    api.get('/api/finance/balance', { params: { admissionNumber: student.Admission_Number, term } })
      .then((response) => {
        if (!active) return;
        setBalance(response.data);
        setAmount(String(response.data.balance));
      })
      .catch((error) => {
        if (!active) return;
        setBalance(null);
        setBalanceError(error.response?.data?.message || 'Unable to load the learner balance.');
      });
    return () => { active = false; };
  }, [studentId, term, balanceVersion]);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!canSubmit || !student || isLoading) return;

    setIsLoading(true);
    const receipt_no = generateReceiptNo(feeCode, term);
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
      branch: branchName || 'Githurai Branch',
    };

    try {
      await api.post("/api/finance/fees", payload);

      setToast({ type: "success", text: `Payment recorded: ${receipt_no}` });
      setAmount("");
      setRemarks("");
      setBalanceVersion((version) => version + 1);
    } catch (err) {
      setToast({ type: "error", text: err.response?.data?.message || "Failed to record payment" });
    } finally {
      setIsLoading(false);
      setTimeout(() => setToast(null), 5000);
    }
  }

  return (
    <div className="fee-payment-layout">
      <aside className="fee-payment-form">
        <div className="px-5 py-4 border-b border-gray-200 flex items-center gap-2">
          <Icon className={`w-5 h-5 ${colors.text}`} />
          <h1 className="text-base font-medium text-gray-900">{feeType.label} entry</h1>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          <StudentSelect students={students} value={studentId} onChange={setStudentId} colors={colors} />

          {balance && (
            <section className="fee-balance-card">
              <strong>{balance.class_group} · {balance.term}</strong>
              <div><span>Term fee</span><b>KES {Number(balance.fee_amount).toLocaleString()}</b></div>
              <div><span>Paid</span><b>KES {Number(balance.paid).toLocaleString()}</b></div>
              <div className="fee-balance-total"><span>Balance</span><b>KES {Number(balance.balance).toLocaleString()}</b></div>
              {Number(balance.credit) > 0 && <small>Credit: KES {Number(balance.credit).toLocaleString()}</small>}
            </section>
          )}
          {balanceError && <p className="fee-balance-error">{balanceError}</p>}

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

          <button type="submit" disabled={!canSubmit || isLoading}
            className={`w-full flex items-center justify-center gap-2 ${colors.bg} disabled:bg-gray-300 disabled:cursor-not-allowed text-white text-sm font-medium py-2.5 rounded-md ${colors.bgHover} transition-colors`}>
            {isLoading ? <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span> : <Receipt className="w-4 h-4" />}
            Record payment
          </button>
        </form>
      </aside>

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
