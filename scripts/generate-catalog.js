#!/usr/bin/env node

/**
 * CDCR Backstage Catalog Generator
 * 
 * Generates static catalog-info.yaml files for CDCR projects that don't have them.
 * Supports generating:
 * - Individual component files
 * - System-level catalog files (multiple components per system)
 * - Team and user definitions
 */

const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

// CDCR Project Configuration
const CDCR_PROJECTS = {
  // Example systems - replace with your actual projects
  coast: {
    name: 'coast',
    title: 'COAST System',
    description: 'Comprehensive Offender Accountability System Technology',
    owner: 'cdcr-ams',
    components: [
      {
        name: 'coast-ui',
        title: 'COAST UI',
        type: 'frontend',
        description: 'PWA frontend for COAST system',
        repo: 'CDCR-OMS-COAST/coast-ui',
        kubernetes: {
          namespace: 'coast',
          labelSelector: 'app=coast-ui'
        },
        tags: ['pwa', 'frontend', 'coast']
      },
      {
        name: 'coast-server',
        title: 'COAST Server',
        type: 'service',
        description: 'Backend server for COAST system',
        repo: 'CDCR-OMS-COAST/coast-server',
        kubernetes: {
          namespace: 'coast',
          labelSelector: 'app=coast-server'
        },
        tags: ['backend', 'api', 'coast'],
        providesApis: ['coast-api']
      }
    ],
    apis: [
      {
        name: 'coast-api',
        title: 'COAST API',
        type: 'rest',
        description: 'API for COAST system',
        owner: 'cdcr-ams'
      }
    ]
  },
  
  discharge: {
    name: 'discharge',
    title: 'Discharge Custody Check System',
    description: 'System for processing discharge custody checks',
    owner: 'cdcr-dev-team',
    components: [
      {
        name: 'discharge-service',
        title: 'Discharge Service',
        type: 'service',
        description: 'Service for processing discharge custody checks',
        repo: 'CDCR/discharge-service',
        kubernetes: {
          namespace: 'discharge',
          labelSelector: 'app=discharge-service'
        },
        tags: ['discharge', 'custody', 'processing']
      }
    ]
  }
};

// CDCR Teams Configuration
const CDCR_TEAMS = {
  'cdcr-platform-team': {
    name: 'cdcr-platform-team',
    displayName: 'CDCR Platform Team',
    description: 'Platform Engineering Team',
    type: 'team',
    members: [
      {
        name: 'lijo.madassery',
        displayName: 'Lijo Madassery',
        email: 'lijo.madassery@cdcr.ca.gov'
      }
    ]
  },
  'cdcr-ams': {
    name: 'cdcr-ams',
    displayName: 'CDCR Application Management Services',
    description: 'Application Management Services Team',
    type: 'team',
    members: []
  },
  'cdcr-dev-team': {
    name: 'cdcr-dev-team',
    displayName: 'CDCR Development Team',
    description: 'Main development team',
    type: 'team',
    members: []
  }
};

/**
 * Generate a component definition
 */
function generateComponent(component, systemName) {
  return {
    apiVersion: 'backstage.io/v1alpha1',
    kind: 'Component',
    metadata: {
      name: component.name,
      title: component.title,
      description: component.description,
      annotations: {
        'github.com/project-slug': component.repo,
        'backstage.io/source-location': `url:https://github.com/${component.repo}`,
        'backstage.io/techdocs-ref': 'dir:.',
        ...(component.kubernetes && {
          'backstage.io/kubernetes-id': component.name,
          'backstage.io/kubernetes-namespace': component.kubernetes.namespace,
          'backstage.io/kubernetes-label-selector': component.kubernetes.labelSelector
        })
      },
      tags: component.tags || [],
      links: [
        {
          url: `https://github.com/${component.repo}`,
          title: 'Source Code',
          icon: 'github'
        }
      ]
    },
    spec: {
      type: component.type,
      lifecycle: 'production', // or 'development'
      owner: CDCR_PROJECTS[systemName].owner,
      system: systemName,
      ...(component.providesApis && { providesApis: component.providesApis })
    }
  };
}

/**
 * Generate an API definition
 */
function generateAPI(api, systemName) {
  return {
    apiVersion: 'backstage.io/v1alpha1',
    kind: 'API',
    metadata: {
      name: api.name,
      title: api.title,
      description: api.description,
      tags: ['api']
    },
    spec: {
      type: api.type,
      lifecycle: 'production',
      owner: api.owner,
      system: systemName,
      definition: `
openapi: 3.0.0
info:
  title: ${api.title}
  description: ${api.description}
  version: 1.0.0
paths:
  /health:
    get:
      summary: Health check endpoint
      responses:
        '200':
          description: Service is healthy
      `.trim()
    }
  };
}

/**
 * Generate a system definition
 */
function generateSystem(systemName, systemConfig) {
  return {
    apiVersion: 'backstage.io/v1alpha1',
    kind: 'System',
    metadata: {
      name: systemName,
      title: systemConfig.title,
      description: systemConfig.description,
      tags: [systemName]
    },
    spec: {
      owner: systemConfig.owner
    }
  };
}

/**
 * Generate team definitions
 */
function generateTeams() {
  const entities = [];
  
  // Generate Groups (teams)
  Object.values(CDCR_TEAMS).forEach(team => {
    entities.push({
      apiVersion: 'backstage.io/v1alpha1',
      kind: 'Group',
      metadata: {
        name: team.name,
        description: team.description
      },
      spec: {
        type: team.type,
        children: []
      }
    });
    
    // Generate Users for this team
    team.members.forEach(member => {
      entities.push({
        apiVersion: 'backstage.io/v1alpha1',
        kind: 'User',
        metadata: {
          name: member.name,
          description: `Member of ${team.displayName}`
        },
        spec: {
          profile: {
            displayName: member.displayName,
            email: member.email
          },
          memberOf: [team.name]
        }
      });
    });
  });
  
  return entities;
}

/**
 * Generate catalog file for a system
 */
function generateSystemCatalog(systemName, systemConfig) {
  const entities = [];
  
  // Add system definition
  entities.push(generateSystem(systemName, systemConfig));
  
  // Add components
  systemConfig.components.forEach(component => {
    entities.push(generateComponent(component, systemName));
  });
  
  // Add APIs
  if (systemConfig.apis) {
    systemConfig.apis.forEach(api => {
      entities.push(generateAPI(api, systemName));
    });
  }
  
  return entities;
}

/**
 * Write YAML file
 */
function writeYamlFile(filePath, entities) {
  const yamlContent = entities.map(entity => yaml.dump(entity)).join('---\n');
  fs.writeFileSync(filePath, yamlContent);
  console.log(`✅ Generated: ${filePath}`);
}

/**
 * Update app-config.yaml to include generated catalog files
 */
function updateAppConfig(generatedFiles) {
  const configPath = path.join(__dirname, '../app-config.yaml');
  let configContent = fs.readFileSync(configPath, 'utf8');
  
  // Find the catalog section and add new locations
  const newLocations = generatedFiles.map(file => `
    - type: file
      target: ../../${file}
      rules:
        - allow: [Component, System, API, Group, User]`).join('');
  
  // Replace the placeholder comment
  configContent = configContent.replace(
    '    # CDCR Applications - placeholder for future static catalog files\n    # Use scripts/generate-catalog.js to create catalog files for production',
    `    # CDCR Applications - Generated by scripts/generate-catalog.js${newLocations}`
  );
  
  fs.writeFileSync(configPath, configContent);
  console.log('✅ Updated app-config.yaml');
}

/**
 * Update kustomization.yaml to include ConfigMaps for generated files
 */
function updateKustomization(generatedFiles) {
  // This would generate ConfigMaps for the catalog files
  // For now, just log what would be needed
  console.log('\n📝 Next steps for Kubernetes deployment:');
  generatedFiles.forEach(file => {
    const filename = path.basename(file, '.yaml');
    console.log(`   - Create ConfigMap: kubernetes/catalog/${filename}-configmap.yaml`);
  });
}

/**
 * Main function
 */
function main() {
  const catalogDir = path.join(__dirname, '../catalog');
  
  // Ensure catalog directory exists
  if (!fs.existsSync(catalogDir)) {
    fs.mkdirSync(catalogDir, { recursive: true });
  }
  
  const generatedFiles = [];
  
  console.log('🚀 Generating CDCR Backstage Catalog Files...\n');
  
  // Generate teams file
  const teamsFile = 'catalog/cdcr-teams.yaml';
  const teamEntities = generateTeams();
  writeYamlFile(path.join(__dirname, '..', teamsFile), teamEntities);
  
  // Generate system catalog files
  Object.entries(CDCR_PROJECTS).forEach(([systemName, systemConfig]) => {
    const fileName = `catalog/${systemName}-system.yaml`;
    const entities = generateSystemCatalog(systemName, systemConfig);
    writeYamlFile(path.join(__dirname, '..', fileName), entities);
    generatedFiles.push(fileName);
  });
  
  console.log('\n📋 Summary:');
  console.log(`   Generated ${generatedFiles.length} system catalog files`);
  console.log(`   Generated 1 teams file`);
  
  // Update configuration files
  updateAppConfig(generatedFiles);
  updateKustomization(generatedFiles);
  
  console.log('\n✨ Catalog generation complete!');
  console.log('\nTo customize for your projects:');
  console.log('1. Edit the CDCR_PROJECTS configuration in this script');
  console.log('2. Update team members in CDCR_TEAMS');
  console.log('3. Run the script again: node scripts/generate-catalog.js');
}

if (require.main === module) {
  main();
}

module.exports = {
  generateComponent,
  generateAPI,
  generateSystem,
  generateTeams,
  CDCR_PROJECTS,
  CDCR_TEAMS
};