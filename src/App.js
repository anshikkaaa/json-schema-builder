import React, { useState } from 'react';
import { Button, Divider, Typography } from 'antd';
import SchemaField from './components/SchemaField';
import { generateSchema } from './utils/generateSchema';

const { Title } = Typography;

function App() {
  const [fields, setFields] = useState([]);

  const updateFields = (newFields) => {
    setFields([...newFields]);
  };

  return (
    <div style={{ padding: 30 }}>
      <Title level={2}>JSON Schema Builder</Title>

      {fields.map((field, idx) => (
        <SchemaField
          key={field.id || idx}
          field={field}
          path={[idx]}
          updateFields={updateFields}
          fields={fields}
        />
      ))}

      <Button
        type="primary"
        onClick={() =>
          setFields([...fields, { name: '', type: 'String', children: [] }])
        }
        style={{ marginTop: 20 }}
      >
        Add Root Field
      </Button>

      <Divider />

      <Title level={4}>Live JSON Schema:</Title>
      <pre>{JSON.stringify(generateSchema(fields), null, 2)}</pre>
    </div>
  );
}

export default App;
