# TAP to CDCR Development Portal Migration Guide

## Overview
This guide helps migrate from TAP (Tanzu Application Platform) to the new CDCR Development Portal while reusing existing PostgreSQL infrastructure.

## Migration Strategy

### Phase 1: Side-by-Side Deployment (Recommended)
Deploy CDCR portal alongside TAP to enable gradual migration.

### Phase 2: Data Migration (Optional)
Migrate catalog data from TAP to CDCR portal.

### Phase 3: Cutover
Switch teams from TAP to CDCR portal.

## Database Reuse Options

### Option 1: Separate Database (Recommended)
Create a new database in your existing TAP PostgreSQL instance.

#### Steps:
1. **Connect to TAP PostgreSQL**
   ```bash
   # Find TAP PostgreSQL pod
   kubectl get pods -n tap-system | grep postgres
   
   # Connect to PostgreSQL
   kubectl exec -it <tap-postgres-pod> -n tap-system -- psql -U postgres
   ```

2. **Create CDCR Database**
   ```sql
   -- Create new database for CDCR portal
   CREATE DATABASE cdcr_development_portal;
   
   -- Create dedicated user
   CREATE USER backstage_cdcr WITH PASSWORD 'your-secure-password';
   
   -- Grant permissions
   GRANT ALL PRIVILEGES ON DATABASE cdcr_development_portal TO backstage_cdcr;
   GRANT CREATE ON DATABASE cdcr_development_portal TO backstage_cdcr;
   
   -- Exit psql
   \q
   ```

3. **Configure CDCR Portal**
   ```yaml
   # In kubernetes/backstage-secrets.yaml
   POSTGRES_HOST: <tap-postgres-service>
   POSTGRES_PORT: "5432"
   POSTGRES_USER: backstage_cdcr
   POSTGRES_PASSWORD: your-secure-password
   POSTGRES_DATABASE: cdcr_development_portal
   ```

### Option 2: Schema Isolation
Use the same database but with table prefixes or schemas.

#### Steps:
1. **Configure Table Prefix**
   ```yaml
   # In app-config.production.yaml
   backend:
     database:
       client: pg
       connection:
         host: ${POSTGRES_HOST}
         database: backstage_plugin_catalog
         schema: cdcr_portal  # Separate schema
   ```

### Option 3: Database Migration
Migrate existing TAP catalog data to CDCR portal.

## Network Configuration

### Service Discovery
```bash
# Find TAP PostgreSQL service
kubectl get services -n tap-system | grep postgres

# Example service name: tap-postgres-service
```

### Configure CDCR Portal
```yaml
# In secrets
POSTGRES_HOST: tap-postgres-service.tap-system.svc.cluster.local
POSTGRES_PORT: "5432"
```

## Migration Checklist

### Pre-Migration
- [ ] Identify TAP PostgreSQL service and credentials
- [ ] Test connectivity from CDCR namespace to TAP PostgreSQL
- [ ] Backup existing TAP database
- [ ] Plan rollback strategy

### Database Setup
- [ ] Create separate database for CDCR portal
- [ ] Create dedicated user with appropriate permissions
- [ ] Test database connectivity
- [ ] Configure CDCR portal secrets

### Application Migration
- [ ] Deploy CDCR portal in separate namespace
- [ ] Import applications to CDCR catalog
- [ ] Configure team access and permissions
- [ ] Test all functionality

### Team Migration
- [ ] Train teams on CDCR portal interface
- [ ] Migrate team workflows gradually
- [ ] Update documentation and runbooks
- [ ] Disable TAP access for migrated teams

### Post-Migration
- [ ] Monitor performance and stability
- [ ] Clean up unused TAP resources
- [ ] Update monitoring and alerting
- [ ] Document lessons learned

## Rollback Strategy

### If Issues Arise
1. **Keep TAP running** during transition period
2. **Switch DNS/ingress** back to TAP if needed
3. **Restore database** from backup if corrupted
4. **Gradual rollback** team by team

## Benefits of Database Reuse

### Cost Savings
- **No additional PostgreSQL** infrastructure needed
- **Shared maintenance** and backup procedures
- **Consistent monitoring** and alerting

### Operational Efficiency
- **Same DBA team** manages both systems
- **Unified backup strategy**
- **Shared disaster recovery** procedures

## Risks and Mitigation

### Risk: Database Contention
- **Mitigation**: Use separate databases with resource limits
- **Monitor**: Database performance and connection counts

### Risk: Schema Conflicts
- **Mitigation**: Use database/schema isolation
- **Test**: Thoroughly test both systems together

### Risk: Operational Complexity
- **Mitigation**: Gradual migration with clear rollback plan
- **Training**: Ensure teams understand both systems

## Performance Considerations

### Database Sizing
```sql
-- Check current TAP database size
SELECT 
    pg_database.datname,
    pg_size_pretty(pg_database_size(pg_database.datname)) AS size
FROM pg_database
WHERE datname = 'backstage_plugin_catalog';
```

### Connection Limits
```sql
-- Check current connections
SELECT count(*) as active_connections 
FROM pg_stat_activity 
WHERE state = 'active';

-- Increase if needed
ALTER SYSTEM SET max_connections = 200;
```

## Monitoring Integration

### Metrics to Track
- **Database connections** from both TAP and CDCR
- **Query performance** for both systems
- **Storage growth** over time
- **Backup success rate**

### Alerts to Configure
- **High connection count** across both systems
- **Long-running queries** impacting performance
- **Database disk space** approaching limits
- **Failed backups** or replication issues

## Support and Troubleshooting

### Common Issues
1. **Connection refused**: Check network policies between namespaces
2. **Permission denied**: Verify user grants and database permissions
3. **Schema conflicts**: Use separate databases or schemas
4. **Performance degradation**: Monitor and tune PostgreSQL settings

### Getting Help
- **Platform Team**: For infrastructure and database issues
- **Backstage Community**: For application-specific problems
- **TAP Documentation**: For TAP-specific migration questions