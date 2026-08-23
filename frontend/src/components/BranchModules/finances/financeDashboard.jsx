import { useState } from "react";
import { GraduationCap, Bus, FileEdit, BookOpen, Home } from "lucide-react";
import FeePaymentSidebar from "./FeePaymentSidebar";

const FEE_TYPES = {
  TUI: { label: "Tuition fee", icon: GraduationCap, color: "emerald" }
};

const COLOR_CLASSES = {
  emerald: { text: "text-emerald-700", bg: "bg-emerald-700", bgHover: "hover:bg-emerald-800", ring: "focus:ring-emerald-600 focus:border-emerald-600", dot: "text-emerald-600" },
  blue: { text: "text-blue-700", bg: "bg-blue-700", bgHover: "hover:bg-blue-800", ring: "focus:ring-blue-600 focus:border-blue-600", dot: "text-blue-600" },
  amber: { text: "text-amber-700", bg: "bg-amber-600", bgHover: "hover:bg-amber-700", ring: "focus:ring-amber-500 focus:border-amber-500", dot: "text-amber-600" },
  purple: { text: "text-purple-700", bg: "bg-purple-700", bgHover: "hover:bg-purple-800", ring: "focus:ring-purple-600 focus:border-purple-600", dot: "text-purple-600" },
  rose: { text: "text-rose-700", bg: "bg-rose-700", bgHover: "hover:bg-rose-800", ring: "focus:ring-rose-600 focus:border-rose-600", dot: "text-rose-600" },
};

export default function FinanceDashboard({ students, branchName }) {
  const feeCodes = Object.keys(FEE_TYPES);
  const [feeCode, setFeeCode] = useState(feeCodes[0]);
  const feeType = FEE_TYPES[feeCode] ?? FEE_TYPES.TUI;
  const colors = COLOR_CLASSES[feeType.color];
  const Icon = feeType.icon;

  return (
    <div className="flex flex-col h-full flex-1 w-full bg-white">
      <div className="border-b border-gray-200 bg-white px-6 flex items-center gap-1 shrink-0">
        {feeCodes.map((code) => {
          const type = FEE_TYPES[code];
          const itemColors = COLOR_CLASSES[type.color];
          const ItemIcon = type.icon;
          const active = feeCode === code;
          return (
            <button key={code} onClick={() => setFeeCode(code)}
              className={`flex items-center gap-2 px-4 py-3 text-sm border-b-2 transition-colors ${active ? `${itemColors.text} border-current font-medium` : "text-gray-500 border-transparent hover:text-gray-800"}`}>
              <ItemIcon className="w-4 h-4" />
              {type.label}
            </button>
          );
        })}
      </div>
      <div className="flex-1 overflow-hidden h-full">
        <FeePaymentSidebar feeCode={feeCode} feeType={feeType} colors={colors} Icon={Icon} students={students} branchName={branchName} />
      </div>
    </div>
  );
}