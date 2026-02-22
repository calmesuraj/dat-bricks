import React, { useState } from 'react';
import SQLTable from '../components/SQLTable';
import { APP_PROVIDER, TABLE_QUERIES } from '../provider';
import '../styles/TablesPage.css';

const TablesPage: React.FC = () => {
  const [selectedTable, setSelectedTable] = useState<string | null>(null);

  const tables = TABLE_QUERIES[APP_PROVIDER];

  return (
    <div className="tables-page">
      <h1>Database Tables</h1>
      
      <div className="table-buttons">
        {tables.map((table) => (
          <button
            key={table.name}
            onClick={() => setSelectedTable(table.name)}
            className={`table-button ${selectedTable === table.name ? 'active' : ''}`}
          >
            {table.name}
          </button>
        ))}
      </div>

      {selectedTable && (
        <div className="table-container">
          <h2>{selectedTable}</h2>
          <SQLTable
            query={tables.find(t => t.name === selectedTable)?.query || ''}
            title={selectedTable?.charAt(0).toUpperCase() + selectedTable?.slice(1)}
            pageSize={10}
            autoExecute={true}
          />
        </div>
      )}
    </div>
  );
};

export default TablesPage;
