import React, { useState } from 'react';
import { Input, Select, Button, Card, Space } from 'antd';
import { PlusOutlined, DeleteOutlined, DownloadOutlined, ReloadOutlined } from '@ant-design/icons';

const { Option } = Select;

const FIELD_TYPES = ['String', 'Number', 'Nested'];

const SchemaBuilder = () => {
  const [fields, setFields] = useState([
    {
      id: Date.now(),
      name: '',
      type: 'String',
      children: [],
    },
  ]);

  const updateField = (id, key, value, parentFields = fields, setParentFields = setFields) => {
    const updatedFields = parentFields.map((field) => {
      if (field.id === id) {
        return { ...field, [key]: value, children: key === 'type' && value !== 'Nested' ? [] : field.children };
      }
      if (field.children && field.children.length) {
        return {
          ...field,
          children: updateField(id, key, value, field.children, (children) => {
            field.children = children;
          }),
        };
      }
      return field;
    });

    setParentFields(updatedFields);
    return updatedFields;
  };

  const addField = (parentId = null) => {
    const newField = {
      id: Date.now() + Math.random(),
      name: '',
      type: 'String',
      children: [],
    };

    if (parentId === null) {
      setFields([...fields, newField]);
    } else {
      const addToNested = (flds) =>
        flds.map((f) => {
          if (f.id === parentId) {
            return { ...f, children: [...(f.children || []), newField] };
          } else if (f.children) {
            return { ...f, children: addToNested(f.children) };
          }
          return f;
        });
      setFields(addToNested(fields));
    }
  };

  const deleteField = (id, currentFields = fields, setCurrentFields = setFields) => {
    const filteredFields = currentFields.filter((f) => f.id !== id).map((f) => {
      if (f.children) {
        return { ...f, children: deleteField(id, f.children, (children) => (f.children = children)) };
      }
      return f;
    });

    setCurrentFields(filteredFields);
    return filteredFields;
  };

  const renderFields = (flds, parentId = null) => {
    return flds.map((field) => (
      <Card
        key={field.id}
        size="small"
        style={{ marginBottom: 8, marginLeft: parentId ? 20 : 0 }}
        title={
          <Space>
            <Input
              placeholder="Field Name"
              value={field.name}
              onChange={(e) => updateField(field.id, 'name', e.target.value)}
              style={{ width: 150 }}
            />
            <Select
              value={field.type}
              onChange={(val) => updateField(field.id, 'type', val)}
              style={{ width: 120 }}
            >
              {FIELD_TYPES.map((t) => (
                <Option key={t} value={t}>{t}</Option>
              ))}
            </Select>
            <Button icon={<DeleteOutlined />} danger onClick={() => deleteField(field.id)} />
            {field.type === 'Nested' && (
              <Button icon={<PlusOutlined />} onClick={() => addField(field.id)} />
            )}
          </Space>
        }
      >
        {field.type === 'Nested' && renderFields(field.children, field.id)}
      </Card>
    ));
  };

  const buildSchema = (flds) => {
    const obj = {};
    flds.forEach((field) => {
      if (!field.name) return;
      if (field.type === 'Nested') {
        obj[field.name] = buildSchema(field.children);
      } else if (field.type === 'String') {
        obj[field.name] = 'string';
      } else if (field.type === 'Number') {
        obj[field.name] = 0;
      }
    });
    return obj;
  };

  const handleGenerateJSON = () => {
    const blob = new Blob([JSON.stringify(buildSchema(fields), null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'schema.json';
    link.click();
  };

  const handleNewJSON = () => {
    setFields([
      {
        id: Date.now(),
        name: '',
        type: 'String',
        children: [],
      },
    ]);
  };

  return (
    <div style={{ padding: 24, maxWidth: 800, margin: '0 auto' }}>
      <h2>JSON Schema Builder</h2>
      {renderFields(fields)}

      <Button
        type="dashed"
        icon={<PlusOutlined />}
        onClick={() => addField()}
        style={{ width: '100%', marginTop: 16 }}
      >
        Add Field
      </Button>

      <div style={{ marginTop: 24, display: 'flex', gap: '12px' }}>
        <Button type="primary" icon={<DownloadOutlined />} onClick={handleGenerateJSON}>
          Generate JSON
        </Button>
        <Button danger icon={<ReloadOutlined />} onClick={handleNewJSON}>
          New JSON
        </Button>
      </div>

      <Card title="JSON Preview" style={{ marginTop: 32 }}>
        <pre>{JSON.stringify(buildSchema(fields), null, 2)}</pre>
      </Card>
    </div>
  );
};

export default SchemaBuilder;