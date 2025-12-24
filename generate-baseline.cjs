const schema = require('./temp_schema.json');

const pgTypeMap = {
  'integer': 'INTEGER',
  'bigint': 'BIGINT',
  'number': 'NUMERIC',
  'string': 'TEXT',
  'boolean': 'BOOLEAN',
  'object': 'JSONB',
  'array': 'JSONB'
};

function getPgType(prop) {
  if (prop.format === 'uuid') return 'UUID';
  if (prop.format === 'timestamp with time zone' || prop.format === 'date-time') return 'TIMESTAMPTZ';
  if (prop.format === 'date') return 'DATE';
  if (prop.format === 'time') return 'TIME';
  if (prop.format === 'bigint') return 'BIGINT';
  if (prop.type === 'array') return 'JSONB';
  if (prop.type === 'object') return 'JSONB';
  return pgTypeMap[prop.type] || 'TEXT';
}

const output = [];
output.push('-- Baseline migration generated from production schema');
output.push('-- Generated: ' + new Date().toISOString());
output.push('-- Tables: ' + Object.keys(schema.definitions).length);
output.push('');

const definitions = schema.definitions || {};
const tableNames = Object.keys(definitions).sort();

for (const tableName of tableNames) {
  const def = definitions[tableName];
  const props = def.properties || {};
  const required = def.required || [];

  const columns = [];
  const propNames = Object.keys(props);

  for (const propName of propNames) {
    const prop = props[propName];
    const pgType = getPgType(prop);
    const notNull = required.includes(propName) ? ' NOT NULL' : '';
    const defaultVal = prop.default !== undefined ? ` DEFAULT ${JSON.stringify(prop.default)}` : '';

    // Special handling for id columns
    let colDef = `  "${propName}" ${pgType}`;
    if (propName === 'id' && pgType === 'UUID') {
      colDef += ' DEFAULT gen_random_uuid() PRIMARY KEY';
    } else {
      colDef += notNull;
    }

    columns.push(colDef);
  }

  if (columns.length > 0) {
    output.push(`CREATE TABLE IF NOT EXISTS public."${tableName}" (`);
    output.push(columns.join(',\n'));
    output.push(');');
    output.push('');
  }
}

// Add RLS enable for all tables
output.push('-- Enable RLS on all tables');
for (const tableName of tableNames) {
  output.push(`ALTER TABLE IF EXISTS public."${tableName}" ENABLE ROW LEVEL SECURITY;`);
}

console.log(output.join('\n'));
