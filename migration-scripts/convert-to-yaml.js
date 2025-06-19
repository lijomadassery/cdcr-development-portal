#!/usr/bin/env node
// Convert exported JSON to YAML catalog files

const fs = require('fs');
// Simple YAML conversion without external dependencies
function toYAML(obj, indent = 0) {
  const spaces = '  '.repeat(indent);
  let result = '';
  
  for (const [key, value] of Object.entries(obj)) {
    if (value === null || value === undefined) continue;
    
    result += `${spaces}${key}:`;
    
    if (typeof value === 'object' && !Array.isArray(value)) {
      result += '\n' + toYAML(value, indent + 1);
    } else if (Array.isArray(value)) {
      result += '\n';
      value.forEach(item => {
        if (typeof item === 'object') {
          result += `${spaces}  -\n${toYAML(item, indent + 2)}`;
        } else {
          result += `${spaces}  - ${item}\n`;
        }
      });
    } else if (typeof value === 'string') {
      result += ` "${value}"\n`;
    } else {
      result += ` ${value}\n`;
    }
  }
  
  return result;
}

// Read the exported catalog
const catalogData = JSON.parse(fs.readFileSync('existing-catalog-export.json', 'utf8'));

// Group entities by kind
const entitiesByKind = {};

catalogData.forEach(entity => {
  const kind = entity.kind.toLowerCase();
  if (!entitiesByKind[kind]) {
    entitiesByKind[kind] = [];
  }
  
  // Clean up the entity (remove Backstage-specific fields)
  const cleanEntity = {
    apiVersion: entity.apiVersion,
    kind: entity.kind,
    metadata: {
      name: entity.metadata.name,
      namespace: entity.metadata.namespace || 'default',
      title: entity.metadata.title,
      description: entity.metadata.description,
      labels: entity.metadata.labels,
      annotations: entity.metadata.annotations,
      tags: entity.metadata.tags
    },
    spec: entity.spec,
    relations: entity.relations
  };
  
  // Remove undefined/null fields
  Object.keys(cleanEntity.metadata).forEach(key => {
    if (cleanEntity.metadata[key] === undefined || cleanEntity.metadata[key] === null) {
      delete cleanEntity.metadata[key];
    }
  });
  
  entitiesByKind[kind].push(cleanEntity);
});

// Create YAML files for each kind
Object.keys(entitiesByKind).forEach(kind => {
  const entities = entitiesByKind[kind];
  
  // Create multi-document YAML
  const yamlContent = entities.map(entity => 
    `---\n${toYAML(entity)}`
  ).join('\n');
  
  fs.writeFileSync(`migrated-${kind}s.yaml`, yamlContent);
  console.log(`Created migrated-${kind}s.yaml with ${entities.length} entities`);
});

console.log('Migration YAML files created successfully!');
console.log('Next steps:');
console.log('1. Review the generated YAML files');
console.log('2. Add them to your catalog/ directory');
console.log('3. Update app-config.yaml to include the new catalog locations');