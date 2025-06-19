# CDCR Backstage Migration Guide

## Importing Components from Existing Backstage Deployment

This guide shows how to export all components, systems, APIs, users, and groups from your existing Backstage deployment and import them into the new deployment.

### Prerequisites

- Access to your existing Backstage deployment URL
- Node.js installed on your local machine
- `curl` command available

### Step 1: Prepare Migration Scripts

The migration scripts are already created in the `migration-scripts/` directory:
- `export-catalog.sh` - Exports data from existing deployment
- `convert-to-yaml.js` - Converts JSON to YAML catalog files

### Step 2: Configure Existing Backstage URL

Edit the export script with your existing Backstage URL:

```bash
# Edit migration-scripts/export-catalog.sh
# Change this line to your actual URL:
EXISTING_BACKSTAGE_URL="https://your-existing-backstage.cdcr.ca.gov"
```

### Step 3: Export Catalog Data

```bash
cd migration-scripts
chmod +x export-catalog.sh
./export-catalog.sh
```

This will create these files:
- `existing-catalog-export.json` - All entities
- `components-export.json` - Just components
- `systems-export.json` - Just systems
- `apis-export.json` - Just APIs
- `users-export.json` - Just users
- `groups-export.json` - Just groups

### Step 4: Convert to YAML Files

Install required dependency and convert:

```bash
npm install js-yaml
node convert-to-yaml.js
```

This creates migration YAML files:
- `migrated-components.yaml`
- `migrated-systems.yaml` 
- `migrated-apis.yaml`
- `migrated-users.yaml`
- `migrated-groups.yaml`

### Step 5: Move Files to Catalog Directory

```bash
# Move generated files to catalog directory
mv migrated-*.yaml ../catalog/
```

### Step 6: Update App Configuration

Add the migrated files to your `app-config.yaml`:

```yaml
catalog:
  locations:
    # Existing locations...
    - type: file
      target: ../../catalog/cdcr-teams.yaml
      rules:
        - allow: [User, Group]
    
    # ADD THESE NEW MIGRATED LOCATIONS:
    - type: file
      target: ../../catalog/migrated-components.yaml
      rules:
        - allow: [Component]
    
    - type: file
      target: ../../catalog/migrated-systems.yaml
      rules:
        - allow: [System]
        
    - type: file
      target: ../../catalog/migrated-apis.yaml
      rules:
        - allow: [API]
        
    - type: file
      target: ../../catalog/migrated-users.yaml
      rules:
        - allow: [User]
        
    - type: file
      target: ../../catalog/migrated-groups.yaml
      rules:
        - allow: [Group]
```

### Step 7: Deploy and Verify

1. **Commit the changes:**
   ```bash
   git add catalog/migrated-*.yaml app-config.yaml
   git commit -m "feat: Import entities from existing Backstage deployment"
   git push origin master
   ```

2. **Deploy the new Backstage instance** (platform engineer handles this)

3. **Verify migration:**
   - Check that all expected components appear in the catalog
   - Verify users and groups are imported
   - Test that systems and APIs are visible

### Troubleshooting

**If entities don't appear:**
- Check the Backstage logs for catalog processing errors
- Verify YAML syntax in migrated files
- Ensure app-config.yaml has correct file paths

**If authentication fails on export:**
- Your existing Backstage might require authentication
- Contact your existing Backstage admin for API access

**If conversion fails:**
- Check that `existing-catalog-export.json` contains valid JSON
- Install js-yaml: `npm install js-yaml`

### Post-Migration Cleanup

After successful migration:
1. Review imported entities for accuracy
2. Clean up any duplicate or outdated entries
3. Update entity relationships if needed
4. Consider decommissioning the old deployment

---

**Security Note**: The export contains all catalog metadata. Handle exported files securely and delete them after successful migration.