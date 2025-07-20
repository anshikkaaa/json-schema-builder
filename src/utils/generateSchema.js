export const generateSchema = (fields) => {
  const schema = {};
  fields.forEach((field) => {
    if (field.type === 'Nested') {
      schema[field.name || ''] = generateSchema(field.children || []);
    } else {
      schema[field.name || ''] = field.type.toLowerCase();
    }
  });
  return schema;
};
