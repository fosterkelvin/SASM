type Props = {
  query: string;
  onQueryChange: (q: string) => void;
};

const Toolbar: React.FC<Props> = ({ query, onQueryChange }) => {
  return (
    <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center mb-4">
      <div className="flex-1">
        <input
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          placeholder="Search submissions or student name..."
          className="w-full p-2 border rounded"
        />
      </div>
    </div>
  );
};

export default Toolbar;
