# Enterprise Features Guide

## Overview

Loopi Enterprise Edition extends the platform beyond browser automation to support a complete automation ecosystem. This guide covers all enterprise-exclusive features and how to use them.

## Activation

### Environment Variables

Enable Enterprise Edition by setting one of these environment variables:

```bash
# Linux/macOS
export LOOPI_EDITION=enterprise
# or
export LOOPI_LICENSE_KEY=your-license-key-here

# Windows
set LOOPI_EDITION=enterprise
# or
set LOOPI_LICENSE_KEY=your-license-key-here
```

### Verifying Edition

In the application, enterprise features will be available in the step picker with an "Enterprise" badge.

---

## File System Automation

Automate file operations without writing code.

### Read File
```json
{
  "type": "fileSystem",
  "operation": "read",
  "sourcePath": "/path/to/file.txt",
  "storeKey": "fileContent",
  "encoding": "utf-8"
}
```

### Write File
```json
{
  "type": "fileSystem",
  "operation": "write",
  "sourcePath": "/path/to/output.txt",
  "content": "{{processedData}}",
  "encoding": "utf-8"
}
```

### Copy File
```json
{
  "type": "fileSystem",
  "operation": "copy",
  "sourcePath": "/path/to/source.txt",
  "destinationPath": "/path/to/destination.txt"
}
```

### Move File
```json
{
  "type": "fileSystem",
  "operation": "move",
  "sourcePath": "/path/to/source.txt",
  "destinationPath": "/path/to/new-location.txt"
}
```

### Delete File
```json
{
  "type": "fileSystem",
  "operation": "delete",
  "sourcePath": "/path/to/file.txt"
}
```

### Check File Exists
```json
{
  "type": "fileSystem",
  "operation": "exists",
  "sourcePath": "/path/to/file.txt",
  "storeKey": "fileExists"
}
```

**Use Cases:**
- Process CSV/JSON files
- Generate reports
- Manage log files
- Backup data
- File-based ETL workflows

---

## System Automation

Execute system commands and manage environment variables.

### Run Shell Command
```json
{
  "type": "systemCommand",
  "command": "ls",
  "args": ["-la", "/home"],
  "workingDirectory": "/home",
  "storeKey": "commandOutput",
  "storeExitCode": "exitCode"
}
```

### Get Environment Variable
```json
{
  "type": "environmentVariable",
  "operation": "get",
  "variableName": "PATH",
  "storeKey": "systemPath"
}
```

### Set Environment Variable
```json
{
  "type": "environmentVariable",
  "operation": "set",
  "variableName": "MY_VAR",
  "value": "{{dynamicValue}}"
}
```

**Use Cases:**
- Run build scripts
- System health checks
- Deployment automation
- Configuration management
- DevOps workflows

---

## Database Integration

Connect to and query databases directly.

### PostgreSQL Query
```json
{
  "type": "databaseQuery",
  "databaseType": "postgresql",
  "connectionString": "postgresql://user:password@localhost:5432/mydb",
  "query": "SELECT * FROM users WHERE active = $1",
  "parameters": { "1": true },
  "storeKey": "users"
}
```

### MySQL Query
```json
{
  "type": "databaseQuery",
  "databaseType": "mysql",
  "connectionString": "mysql://user:password@localhost:3306/mydb",
  "query": "INSERT INTO logs (message, timestamp) VALUES (?, ?)",
  "parameters": { "1": "{{message}}", "2": "{{timestamp}}" }
}
```

### MongoDB Query
```json
{
  "type": "databaseQuery",
  "databaseType": "mongodb",
  "connectionString": "mongodb://localhost:27017/mydb",
  "query": "{ collection: 'users', operation: 'find', filter: { active: true } }",
  "storeKey": "activeUsers"
}
```

**Supported Databases:**
- PostgreSQL
- MySQL
- MongoDB
- SQLite
- Microsoft SQL Server

**Use Cases:**
- Data migration
- Report generation
- Data validation
- ETL processes
- Database backups

---

## Email Automation

Send and receive emails programmatically.

### Send Email
```json
{
  "type": "sendEmail",
  "smtpHost": "smtp.gmail.com",
  "smtpPort": 587,
  "username": "your-email@gmail.com",
  "password": "{{emailPassword}}",
  "from": "your-email@gmail.com",
  "to": "{{recipientEmail}}",
  "subject": "Automation Report - {{timestamp}}",
  "body": "The automation completed successfully. Results: {{results}}",
  "html": false,
  "attachments": ["/path/to/report.pdf"]
}
```

### Read Emails
```json
{
  "type": "readEmail",
  "imapHost": "imap.gmail.com",
  "imapPort": 993,
  "username": "your-email@gmail.com",
  "password": "{{emailPassword}}",
  "mailbox": "INBOX",
  "filters": {
    "from": "sender@example.com",
    "subject": "Order Confirmation",
    "unreadOnly": true
  },
  "storeKey": "emails",
  "markAsRead": true
}
```

**Use Cases:**
- Automated notifications
- Email-based workflows
- Order processing
- Support ticket automation
- Newsletter management

---

## Cloud Services

Integrate with cloud storage providers.

### AWS S3 Upload
```json
{
  "type": "cloudStorage",
  "provider": "aws",
  "operation": "upload",
  "credentials": {
    "accessKey": "{{awsAccessKey}}",
    "secretKey": "{{awsSecretKey}}",
    "region": "us-east-1"
  },
  "bucket": "my-bucket",
  "key": "reports/{{filename}}",
  "localPath": "/path/to/local/file.txt"
}
```

### Download from Cloud
```json
{
  "type": "cloudStorage",
  "provider": "azure",
  "operation": "download",
  "credentials": {
    "accessKey": "{{azureAccessKey}}",
    "secretKey": "{{azureSecretKey}}"
  },
  "bucket": "my-container",
  "key": "data/input.csv",
  "localPath": "/path/to/save/input.csv"
}
```

### List Cloud Files
```json
{
  "type": "cloudStorage",
  "provider": "gcp",
  "operation": "list",
  "credentials": {
    "accessKey": "{{gcpAccessKey}}",
    "secretKey": "{{gcpSecretKey}}"
  },
  "bucket": "my-bucket",
  "key": "folder/",
  "storeKey": "fileList"
}
```

**Supported Providers:**
- AWS S3
- Azure Blob Storage
- Google Cloud Storage

**Use Cases:**
- Backup automation
- Data synchronization
- File distribution
- Cloud-based ETL
- Multi-cloud workflows

---

## Advanced API Workflows

Enhanced HTTP capabilities with authentication and retry logic.

### Webhook with Bearer Auth
```json
{
  "type": "webhook",
  "url": "https://api.example.com/webhook",
  "method": "POST",
  "headers": {
    "Content-Type": "application/json"
  },
  "body": "{\"event\": \"{{eventType}}\", \"data\": {{eventData}}}",
  "authentication": {
    "type": "bearer",
    "token": "{{apiToken}}"
  },
  "retryPolicy": {
    "maxRetries": 3,
    "retryDelay": 1000
  },
  "storeKey": "webhookResponse"
}
```

### Basic Authentication
```json
{
  "type": "webhook",
  "url": "https://api.example.com/data",
  "method": "GET",
  "authentication": {
    "type": "basic",
    "username": "{{apiUser}}",
    "password": "{{apiPassword}}"
  }
}
```

### API Key Authentication
```json
{
  "type": "webhook",
  "url": "https://api.example.com/endpoint",
  "method": "POST",
  "authentication": {
    "type": "apiKey",
    "apiKey": "{{apiKey}}",
    "apiKeyHeader": "X-API-Key"
  }
}
```

**Use Cases:**
- Third-party API integration
- Webhook handlers
- Microservices communication
- Event-driven workflows
- API chaining

---

## Data Transformation

Convert data between formats seamlessly.

### JSON to CSV
```json
{
  "type": "dataTransform",
  "operation": "convert",
  "inputFormat": "json",
  "outputFormat": "csv",
  "input": "{{jsonData}}",
  "storeKey": "csvData"
}
```

### Parse XML
```json
{
  "type": "dataTransform",
  "operation": "parse",
  "inputFormat": "xml",
  "outputFormat": "json",
  "input": "{{xmlString}}",
  "storeKey": "parsedData"
}
```

### YAML to JSON
```json
{
  "type": "dataTransform",
  "operation": "convert",
  "inputFormat": "yaml",
  "outputFormat": "json",
  "input": "{{yamlConfig}}",
  "storeKey": "jsonConfig"
}
```

**Supported Formats:**
- JSON
- XML
- CSV
- YAML

**Use Cases:**
- Data format conversion
- Config file processing
- Report generation
- Data normalization
- API response transformation

---

## Complete Workflow Example

Here's an enterprise workflow combining multiple features:

1. **Read CSV file** with product data
2. **Transform CSV to JSON**
3. **Query database** for inventory
4. **Call webhook** to update prices
5. **Send email** with summary
6. **Upload results to cloud**

```json
{
  "name": "Daily Inventory Update",
  "steps": [
    {
      "type": "fileSystem",
      "operation": "read",
      "sourcePath": "/data/products.csv",
      "storeKey": "productsCSV"
    },
    {
      "type": "dataTransform",
      "operation": "convert",
      "inputFormat": "csv",
      "outputFormat": "json",
      "input": "{{productsCSV}}",
      "storeKey": "products"
    },
    {
      "type": "databaseQuery",
      "databaseType": "postgresql",
      "connectionString": "{{dbConnection}}",
      "query": "SELECT * FROM inventory",
      "storeKey": "inventory"
    },
    {
      "type": "webhook",
      "url": "https://api.store.com/update-prices",
      "method": "POST",
      "body": "{{products}}",
      "authentication": {
        "type": "bearer",
        "token": "{{apiToken}}"
      }
    },
    {
      "type": "sendEmail",
      "smtpHost": "smtp.gmail.com",
      "smtpPort": 587,
      "username": "{{emailUser}}",
      "password": "{{emailPass}}",
      "from": "automation@company.com",
      "to": "team@company.com",
      "subject": "Daily Inventory Update Complete",
      "body": "Updated {{products.length}} products"
    },
    {
      "type": "cloudStorage",
      "provider": "aws",
      "operation": "upload",
      "credentials": {
        "accessKey": "{{awsKey}}",
        "secretKey": "{{awsSecret}}",
        "region": "us-east-1"
      },
      "bucket": "reports",
      "key": "inventory/{{date}}.json",
      "localPath": "/tmp/results.json"
    }
  ]
}
```

---

## Best Practices

### Security
- Store credentials in variables, never hardcode
- Use environment variables for sensitive data
- Implement least-privilege access
- Enable audit logging

### Performance
- Use conditional logic to skip unnecessary steps
- Batch operations when possible
- Implement retry logic for external services
- Monitor execution times

### Maintenance
- Document your workflows
- Version control automation files
- Test changes in development first
- Monitor and alert on failures

---

## Support

For enterprise support:
- **Email**: enterprise@dyan.live
- **Documentation**: https://loopi.dyan.live/docs/enterprise
- **Priority Support**: Available with Enterprise license

---

## License

Enterprise features require a valid Enterprise Edition license. Contact sales@dyan.live for licensing information.
