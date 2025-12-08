# imPD API Documentation

**Version**: 1.0.0
**Base URL**: `https://impd.com/api`
**Updated**: 2025-12-02

---

## Table of Contents

1. [Authentication](#authentication)
2. [Admin APIs](#admin-apis)
3. [PD APIs](#pd-apis)
4. [Public APIs](#public-apis)
5. [Error Handling](#error-handling)

---

## Authentication

All admin and PD routes require authentication.

### Development Mode
In development, authentication is bypassed for testing.

### Production Mode
Production uses Clerk authentication with JWT tokens.

**Headers**:
```
Authorization: Bearer <token>
Cookie: session=<session-token>
```

---

## Admin APIs

### Distributors

#### GET `/api/admin/distributors`
Get list of distributors

**Query Parameters**:
- `status` (optional): Filter by status (pending, active, inactive, rejected)

**Response**:
```json
{
  "success": true,
  "distributors": [
    {
      "id": 1,
      "name": "분양자 이름",
      "email": "email@example.com",
      "status": "active",
      "businessType": "individual",
      "region": "Seoul",
      "subscriptionPlan": "premium",
      "createdAt": "2025-12-02T00:00:00.000Z"
    }
  ]
}
```

#### POST `/api/admin/distributors`
Create new distributor

**Request Body**:
```json
{
  "name": "분양자 이름",
  "email": "email@example.com",
  "phone": "010-1234-5678",
  "businessType": "individual|corporation|nonprofit",
  "region": "Seoul",
  "notes": "Optional notes"
}
```

**Response**: 201 Created

#### POST `/api/admin/distributors/[id]/approve`
Approve pending distributor

**Response**:
```json
{
  "success": true,
  "distributor": { "id": 1, "status": "active" }
}
```

#### POST `/api/admin/distributors/[id]/reject`
Reject pending distributor

**Request Body**:
```json
{
  "reason": "Rejection reason"
}
```

### Subscription Plans

#### GET `/api/admin/subscription-plans`
Get subscription plans

**Query Parameters**:
- `activeOnly` (optional): boolean

**Response**:
```json
{
  "success": true,
  "plans": [
    {
      "id": 1,
      "name": "basic",
      "displayName": "Basic Plan",
      "price": 50000,
      "features": ["feature1", "feature2"],
      "maxDistributors": 10,
      "isActive": true
    }
  ]
}
```

#### POST `/api/admin/subscription-plans`
Create subscription plan

**Request Body**:
```json
{
  "name": "premium",
  "displayName": "Premium Plan",
  "description": "Plan description",
  "price": 100000,
  "features": ["feature1", "feature2", "feature3"],
  "maxDistributors": 50,
  "maxResources": 100
}
```

### Payments

#### GET `/api/admin/payments`
Get payment history

**Query Parameters**:
- `distributorId` (optional): Filter by distributor
- `status` (optional): Filter by status

**Response**:
```json
{
  "success": true,
  "payments": [
    {
      "id": 1,
      "distributorId": 1,
      "planId": 1,
      "amount": 100000,
      "currency": "KRW",
      "status": "completed",
      "paymentMethod": "card",
      "createdAt": "2025-12-02T00:00:00.000Z"
    }
  ]
}
```

#### POST `/api/admin/payments`
Create payment

**Request Body**:
```json
{
  "distributorId": 1,
  "planId": 1,
  "amount": 100000,
  "currency": "KRW",
  "paymentMethod": "card",
  "metadata": {}
}
```

### Resources

#### GET `/api/admin/resources`
Get resources

**Query Parameters**:
- `category` (optional): Filter by category
- `requiredPlan` (optional): Filter by required plan

#### POST `/api/admin/resources`
Upload new resource

**Request Body** (multipart/form-data):
```
title: Resource Title
description: Resource description
category: marketing|education|contracts|promotion|technical
requiredPlan: basic|premium|enterprise
file: [file upload]
```

### Analytics

#### GET `/api/admin/analytics`
Get analytics data

**Query Parameters**:
- `startDate` (optional): Start date (ISO string)
- `endDate` (optional): End date (ISO string)
- `groupBy` (optional): day|week|month

**Response**:
```json
{
  "success": true,
  "analytics": {
    "totalDistributors": 50,
    "activeDistributors": 45,
    "pendingDistributors": 5,
    "totalRevenue": 5000000,
    "newDistributorsThisMonth": 10,
    "topResources": [...]
  }
}
```

### System Tools

#### GET `/api/admin/health`
System health check

**Response**:
```json
{
  "success": true,
  "health": {
    "status": "healthy|degraded|unhealthy",
    "checks": {
      "memory": true,
      "uptime": true
    },
    "message": "All systems operational"
  },
  "metrics": {
    "uptime": 3600,
    "memory": { "used": 1024, "total": 2048, "percentage": 50 }
  }
}
```

#### GET `/api/admin/logs`
Get system logs

**Query Parameters**:
- `level` (optional): info|warn|error|debug
- `category` (optional): auth|api|database|payment|system
- `limit` (optional): Number of logs (default: 100)
- `since` (optional): ISO date string
- `format` (optional): json|text

#### POST `/api/admin/backup`
Create database backup

**Request Body**:
```json
{
  "filename": "optional-filename.json",
  "cleanup": true,
  "keepCount": 10
}
```

**Response**:
```json
{
  "success": true,
  "filepath": "/path/to/backup.json",
  "metadata": {
    "version": "1.0.0",
    "timestamp": "2025-12-02T00:00:00.000Z",
    "tables": [...],
    "recordCounts": {...}
  }
}
```

---

## PD APIs

### Courses

#### GET `/api/pd/courses`
Get courses

**Query Parameters**:
- `type` (optional): online|offline|b2b
- `publishedOnly` (optional): boolean

#### POST `/api/pd/courses`
Create course

**Request Body**:
```json
{
  "title": "Course Title",
  "description": "Course description",
  "type": "online",
  "price": 50000,
  "thumbnailUrl": "/images/course.jpg",
  "externalLink": "https://payment-link.com",
  "published": true
}
```

#### PUT `/api/pd/courses/[id]`
Update course

#### DELETE `/api/pd/courses/[id]`
Delete course

### Newsletter

#### GET `/api/pd/newsletter`
Get newsletter subscribers

#### POST `/api/pd/newsletter`
Send newsletter

**Request Body**:
```json
{
  "subject": "Newsletter Subject",
  "content": "Newsletter content",
  "recipientIds": [1, 2, 3]
}
```

### Inquiries

#### GET `/api/pd/inquiries`
Get inquiries

**Query Parameters**:
- `type` (optional): b2b|contact
- `status` (optional): pending|contacted|closed

#### PUT `/api/pd/inquiries/[id]`
Update inquiry status

**Request Body**:
```json
{
  "status": "contacted",
  "notes": "Called customer"
}
```

### SNS Accounts

#### GET `/api/pd/sns-accounts`
Get SNS accounts

#### POST `/api/pd/sns-accounts`
Add SNS account

**Request Body**:
```json
{
  "platform": "instagram|facebook|youtube|twitter",
  "accountName": "account_name",
  "accessToken": "encrypted_token",
  "refreshToken": "encrypted_refresh_token"
}
```

### Scheduled Posts

#### GET `/api/pd/scheduled-posts`
Get scheduled posts

**Query Parameters**:
- `status` (optional): pending|published|failed

#### POST `/api/pd/scheduled-posts`
Schedule new post

**Request Body**:
```json
{
  "platform": "instagram",
  "message": "Post content",
  "mediaUrls": ["https://image.com/1.jpg"],
  "scheduledAt": "2025-12-03T10:00:00.000Z"
}
```

---

## Public APIs

### Courses

#### GET `/api/courses`
Get published courses

**Query Parameters**:
- `type` (optional): online|offline|b2b

### Leads

#### POST `/api/leads`
Subscribe to newsletter

**Request Body**:
```json
{
  "email": "subscriber@example.com"
}
```

### Inquiries

#### POST `/api/inquiries`
Submit inquiry

**Request Body**:
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "010-1234-5678",
  "message": "Inquiry message",
  "type": "b2b|contact"
}
```

---

## Error Handling

### Standard Error Response

```json
{
  "success": false,
  "error": "Error message",
  "code": "ERROR_CODE"
}
```

### Common HTTP Status Codes

- `200 OK`: Success
- `201 Created`: Resource created
- `400 Bad Request`: Invalid request
- `401 Unauthorized`: Authentication required
- `403 Forbidden`: Insufficient permissions
- `404 Not Found`: Resource not found
- `500 Internal Server Error`: Server error

### Common Error Codes

- `MISSING_FIELDS`: Required fields missing
- `INVALID_EMAIL`: Invalid email format
- `DUPLICATE_EMAIL`: Email already exists
- `NOT_FOUND`: Resource not found
- `UNAUTHORIZED`: Not authenticated
- `FORBIDDEN`: Insufficient permissions
- `INTERNAL_ERROR`: Server error

---

## Rate Limiting

- **Development**: No rate limiting
- **Production**:
  - General: 100 requests/minute
  - Authentication: 10 requests/minute
  - File upload: 10 requests/hour

---

## Versioning

API version is included in the base URL: `/api/v1/...`

Current version: v1 (default, no prefix required)

---

## Support

For API support, contact: api@impd.com
