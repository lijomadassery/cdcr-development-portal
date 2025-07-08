# CDCR Catalog Generation Scripts

## Overview

These scripts help generate static catalog files for CDCR projects that don't have `catalog-info.yaml` files in their repositories.

## Usage

### 1. Generate Catalog Files

```bash
# Install dependencies (one time)
npm install js-yaml

# Generate catalog files
node scripts/generate-catalog.js
```

### 2. Customize for Your Projects

Edit `scripts/generate-catalog.js` and update the `CDCR_PROJECTS` configuration:

```javascript
const CDCR_PROJECTS = {
  'your-system': {
    name: 'your-system',
    title: 'Your System Name',
    description: 'Description of your system',
    owner: 'your-team',
    components: [
      {
        name: 'your-frontend',
        title: 'Your Frontend',
        type: 'frontend',
        description: 'Frontend application',
        repo: 'your-org/your-frontend-repo',
        kubernetes: {
          namespace: 'your-namespace',
          labelSelector: 'app=your-frontend'
        },
        tags: ['frontend', 'react']
      }
    ]
  }
};
```

### 3. What Gets Generated

The script creates:
- `catalog/system-name-system.yaml` - One file per system containing all components, APIs, and system definition
- `catalog/cdcr-teams.yaml` - Teams and users
- Updates `app-config.yaml` with references to generated files

### 4. Example Generated File

```yaml
apiVersion: backstage.io/v1alpha1
kind: System
metadata:
  name: coast
  title: COAST System
  description: Comprehensive Offender Accountability System Technology
spec:
  owner: cdcr-ams
---
apiVersion: backstage.io/v1alpha1
kind: Component
metadata:
  name: coast-ui
  title: COAST UI
  description: PWA frontend for COAST system
  annotations:
    github.com/project-slug: CDCR-OMS-COAST/coast-ui
    backstage.io/source-location: url:https://github.com/CDCR-OMS-COAST/coast-ui
spec:
  type: frontend
  lifecycle: production
  owner: cdcr-ams
  system: coast
```

## Database Storage in Production

When Backstage starts in production:

1. **Reads catalog files** from the locations defined in `app-config.yaml`
2. **Parses YAML** and extracts entities (Components, Systems, APIs, Users, Groups)
3. **Stores in PostgreSQL** in the `backstage_plugin_catalog` database
4. **Creates relationships** between entities (e.g., Component belongs to System, owned by Team)
5. **Refreshes periodically** by re-reading the source files

### Database Tables (examples):
- `catalog_entities` - Main entity storage
- `catalog_entity_ancestors` - System/Component relationships  
- `catalog_entity_relations` - API dependencies, ownership
- `catalog_location_updates` - Refresh tracking

### What's Stored:
- Entity metadata (name, description, annotations)
- Relationships (Component → System, Component → API)
- Ownership (Team owns Component)
- Kubernetes annotations for monitoring
- Links to source repositories

The static files are the **source of truth**, the database is just a **cache** for fast queries.