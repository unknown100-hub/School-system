import { Search } from 'lucide-react';
export default function SearchBar({ value, onChange }) { return <label className="finance-search"><Search size={17}/><input value={value} onChange={(e) => onChange(e.target.value)} placeholder="Search receipt, learner or admission number" /></label>; }
