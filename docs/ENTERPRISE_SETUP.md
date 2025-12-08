# Enterprise Edition Setup Guide

## Quick Start

### 1. Activate Enterprise Edition

Set one of these environment variables before starting Loopi:

**Linux/macOS:**
```bash
export LOOPI_EDITION=enterprise
# or
export LOOPI_LICENSE_KEY=your-enterprise-license-key

npm start
```

**Windows (Command Prompt):**
```cmd
set LOOPI_EDITION=enterprise
REM or
set LOOPI_LICENSE_KEY=your-enterprise-license-key

npm start
```

**Windows (PowerShell):**
```powershell
$env:LOOPI_EDITION = "enterprise"
# or
$env:LOOPI_LICENSE_KEY = "your-enterprise-license-key"

npm start
```

### 2. Verify Activation

Once the app starts, you should see:
- "Enterprise" badge in the top header
- Enterprise step types available in the step picker (marked with Enterprise badge)
- All enterprise features unlocked

### 3. Available Enterprise Features

Once activated, you have access to:

#### File System Automation
- Read, write, copy, move, delete files
- Check file existence
- Full path support with variable substitution

#### System Automation
- Execute shell commands
- Get/set environment variables
- Capture command output and exit codes

#### Database Integration
- PostgreSQL, MySQL, MongoDB, SQLite, SQL Server
- Parameterized queries
- Store results in variables

#### Email Automation
- Send emails via SMTP
- Read emails via IMAP
- Support for attachments
- Filter by sender, subject, read status

#### Cloud Services
- AWS S3, Azure Blob Storage, Google Cloud Storage
- Upload, download, delete, list operations
- Full credential support

#### Advanced API Workflows
- Enhanced HTTP requests (webhooks)
- Multiple authentication types (Basic, Bearer, API Key)
- Automatic retry with configurable policy
- Advanced error handling

#### Data Transformation
- Convert between JSON, XML, CSV, YAML
- Parse and stringify operations
- Format-specific options

## Example Workflows

Check the `docs/examples/` folder for complete enterprise workflow examples:

- `enterprise_data_pipeline.json` - Complete data pipeline with file I/O, database, API, and email
- `enterprise_file_processing.json` - Log file processing and analysis workflow

## Dependencies for Advanced Features

Some enterprise features require additional npm packages:

### Database Support
```bash
# PostgreSQL
npm install pg

# MySQL
npm install mysql2

# MongoDB
npm install mongodb

# SQLite
npm install better-sqlite3

# SQL Server
npm install mssql
```

### Email Support
```bash
npm install nodemailer imap
```

### Cloud Services
```bash
# AWS
npm install aws-sdk

# Azure
npm install @azure/storage-blob

# Google Cloud
npm install @google-cloud/storage
```

### Data Transformation
```bash
# XML support
npm install xml2js

# CSV support
npm install papaparse

# YAML support
npm install js-yaml
```

**Note:** These dependencies are optional. The application will work without them, but specific step types will show helpful error messages if dependencies are missing.

## Licensing

Enterprise Edition requires a valid license. Options:

1. **Trial Mode**: Set `LOOPI_EDITION=enterprise` for evaluation
2. **Licensed**: Set `LOOPI_LICENSE_KEY=your-key` for production use

Contact enterprise@dyan.live for licensing information.

## Feature Comparison

| Feature | Community | Enterprise |
|---------|-----------|------------|
| Browser Automation | ✅ | ✅ |
| Visual Workflow Builder | ✅ | ✅ |
| Variable System | ✅ | ✅ |
| Conditional Logic | ✅ | ✅ |
| Basic API Calls | ✅ | ✅ |
| File System Operations | ❌ | ✅ |
| System Commands | ❌ | ✅ |
| Database Integration | ❌ | ✅ |
| Email Automation | ❌ | ✅ |
| Cloud Services | ❌ | ✅ |
| Advanced API/Webhooks | ❌ | ✅ |
| Data Transformation | ❌ | ✅ |
| Audit Logging | ❌ | ✅ |
| Priority Support | ❌ | ✅ |

## Support

Enterprise customers receive priority support:

- **Email**: enterprise@dyan.live
- **Documentation**: https://loopi.dyan.live/docs/enterprise
- **Response Time**: 24-hour SLA for critical issues

## Security Notes

- Store sensitive credentials in environment variables
- Use the credential management system for passwords
- Enable audit logging for compliance
- Follow principle of least privilege
- Regularly update dependencies

## Troubleshooting

### Enterprise Features Not Showing

1. Verify environment variable is set:
   ```bash
   echo $LOOPI_EDITION  # Linux/macOS
   echo %LOOPI_EDITION%  # Windows CMD
   $env:LOOPI_EDITION   # Windows PowerShell
   ```

2. Restart the application completely

3. Check the console for any errors

### Step Execution Fails

1. Check if required dependencies are installed
2. Verify credentials and connection strings
3. Check file paths and permissions
4. Review error messages in console

For additional help, contact enterprise@dyan.live
