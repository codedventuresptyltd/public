# Environment Variables Template

Copy these to your `.env` file and fill in your values:

```bash
# CommerceBridge Configuration
BRIDGE_URL=http://localhost:3000
WORKER_BRIDGE_URL=http://localhost:3000

# Tenant & Identity
TENANT_ID=your-tenant-id
WORKER_ID=worker-001
COMMUNITY_ID=default

# MongoDB
MONGODB_URI=mongodb://localhost:27017
MONGODB_DATABASE=commercebridge

# Kafka/Redpanda
KAFKA_BROKERS=localhost:9092
KAFKA_CLIENT_ID=commercebridge-client
KAFKA_GROUP_ID=worker-group-1

# RabbitMQ
RABBITMQ_URL=amqp://localhost:5672
RABBITMQ_USERNAME=guest
RABBITMQ_PASSWORD=guest

# OpenSearch
OPENSEARCH_HOST=localhost
OPENSEARCH_PORT=9200
OPENSEARCH_PROTOCOL=https

# Email (Mailgun)
MAILGUN_API_KEY=your-mailgun-api-key
MAILGUN_DOMAIN=mg.yourdomain.com

# SMS (Twilio)
TWILIO_ACCOUNT_SID=your-twilio-account-sid
TWILIO_AUTH_TOKEN=your-twilio-auth-token
TWILIO_PHONE_NUMBER=+1234567890

# SendGrid
SENDGRID_API_KEY=your-sendgrid-api-key

# OpenAI
OPENAI_API_KEY=your-openai-api-key
OPENAI_MODEL=gpt-4

# Custom Integrations
ERP_API_KEY=your-erp-api-key
WAREHOUSE_API_KEY=your-warehouse-api-key
```

