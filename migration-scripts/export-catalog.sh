#!/bin/bash
# Export catalog from existing Backstage deployment

# Set your existing Backstage API URL
EXISTING_BACKSTAGE_URL="https://your-existing-backstage.cdcr.ca.gov"

echo "Exporting catalog from existing Backstage deployment..."

# Export all entities
curl -X GET "${EXISTING_BACKSTAGE_URL}/api/catalog/entities" \
  -H "Accept: application/json" \
  -o existing-catalog-export.json

echo "Catalog exported to: existing-catalog-export.json"

# Optional: Export by kind
echo "Exporting by entity kinds..."

# Export Components
curl -X GET "${EXISTING_BACKSTAGE_URL}/api/catalog/entities?filter=kind=component" \
  -H "Accept: application/json" \
  -o components-export.json

# Export Systems  
curl -X GET "${EXISTING_BACKSTAGE_URL}/api/catalog/entities?filter=kind=system" \
  -H "Accept: application/json" \
  -o systems-export.json

# Export APIs
curl -X GET "${EXISTING_BACKSTAGE_URL}/api/catalog/entities?filter=kind=api" \
  -H "Accept: application/json" \
  -o apis-export.json

# Export Users
curl -X GET "${EXISTING_BACKSTAGE_URL}/api/catalog/entities?filter=kind=user" \
  -H "Accept: application/json" \
  -o users-export.json

# Export Groups
curl -X GET "${EXISTING_BACKSTAGE_URL}/api/catalog/entities?filter=kind=group" \
  -H "Accept: application/json" \
  -o groups-export.json

echo "Export complete!"
echo "Files created:"
ls -la *-export.json