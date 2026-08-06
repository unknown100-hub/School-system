export default function StudentSearch({ search, setSearch }) {
  return (
    <input
      type="text"
      placeholder="Search students..."
      value={search}
      onChange={(event) => setSearch(event.target.value)}
      style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #d7dce5' }}
      aria-label="Search students"
    />
  );
}