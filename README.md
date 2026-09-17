# Flash Sale System

## System Diagram

![Flash Sale System Diagram](/figures/flash-sale-system-diagram.png)

### Components

**Client**: Request Initiator

**Edge/CDN**: Absorbs traffic load when the sale starts

**Load Balancer**: Traffic Distribution for API service cluster

**API Service + Redis Cluster**: Handles Rate Limiting, Authentication, Sales Status, Purchasing, and Admin Controls.

**Message Queue**: Publishes successful order events

**DLQ**: Dead Letter Queue for retrying failed order events

**Order Worker Service**: Consumes and processes successful order events and persists it to the Database.
If an order event cannot be processed entirely even after retries: we rollback the redis cluster value 
for the stock.

**Database**: Persistence

## Technology Used

### Frontend

- **NextJS**

### Backend

- **Nginx**: CDN Proxy + Load balancer to distribute traffic
- **ExpressJS**: Defines the API endpoints and middlewares
- **Redis**: In-memory database for fast access and concurrency control.
- **RabbitMQ**: Message Queue service
- **PostgreSQL**: Database
