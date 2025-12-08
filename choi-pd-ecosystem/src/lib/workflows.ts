/**
 * Workflow Automation Utilities for Epic 22
 * - Workflow execution engine
 * - External service integrations
 * - Webhook management
 * - Automation templates
 */

import { db } from './db';
import {
  workflows,
  workflowExecutions,
  integrations,
  webhooks,
  webhookLogs,
  automationTemplates,
  type NewWorkflow,
  type NewWorkflowExecution,
  type NewIntegration,
  type NewWebhook,
  type NewWebhookLog
} from './db/schema';
import { eq, desc, and, sql } from 'drizzle-orm';
import crypto from 'crypto';

// ============================================================
// Configuration
// ============================================================

const WORKFLOW_CONFIG = {
  MAX_EXECUTION_TIME: 300000, // 5 minutes
  MAX_RETRIES: 3,
  WEBHOOK_TIMEOUT: 10000, // 10 seconds
  HMAC_ALGORITHM: 'sha256'
};

// ============================================================
// 1. Workflow Execution Engine
// ============================================================

/**
 * Execute a workflow
 */
export async function executeWorkflow(params: {
  workflowId: number;
  trigger: 'manual' | 'schedule' | 'event' | 'webhook';
  triggerData?: Record<string, any>;
  executedBy?: string;
}): Promise<any> {
  const { workflowId, trigger, triggerData = {}, executedBy } = params;

  // Get workflow
  const [workflow] = await db
    .select()
    .from(workflows)
    .where(eq(workflows.id, workflowId));

  if (!workflow) {
    throw new Error('Workflow not found');
  }

  if (!workflow.isActive) {
    throw new Error('Workflow is not active');
  }

  // Create execution record
  const [execution] = await db.insert(workflowExecutions).values({
    workflowId,
    trigger,
    triggerData: JSON.stringify(triggerData),
    status: 'pending',
    startedAt: new Date()
  }).returning();

  try {
    // Update status to running
    await db.update(workflowExecutions)
      .set({ status: 'running' })
      .where(eq(workflowExecutions.id, execution.id));

    // Parse and execute actions
    const actions = JSON.parse(workflow.actions);
    const executedSteps: any[] = [];

    for (const action of actions) {
      const stepResult = await executeAction(action, triggerData, executedSteps);
      executedSteps.push({
        step: action.type,
        status: 'completed',
        output: stepResult
      });
    }

    // Mark as completed
    const completedAt = new Date();
    const duration = completedAt.getTime() - execution.startedAt!.getTime();

    await db.update(workflowExecutions)
      .set({
        status: 'completed',
        completedAt,
        duration,
        steps: JSON.stringify(executedSteps)
      })
      .where(eq(workflowExecutions.id, execution.id));

    // Update workflow stats
    await db.update(workflows)
      .set({
        lastExecutedAt: completedAt,
        executionCount: sql`${workflows.executionCount} + 1`,
        successCount: sql`${workflows.successCount} + 1`
      })
      .where(eq(workflows.id, workflowId));

    return {
      executionId: execution.id,
      status: 'completed',
      duration,
      steps: executedSteps
    };
  } catch (error: any) {
    // Mark as failed
    await db.update(workflowExecutions)
      .set({
        status: 'failed',
        completedAt: new Date(),
        error: error.message
      })
      .where(eq(workflowExecutions.id, execution.id));

    // Update workflow stats
    await db.update(workflows)
      .set({
        failureCount: sql`${workflows.failureCount} + 1`
      })
      .where(eq(workflows.id, workflowId));

    throw error;
  }
}

/**
 * Execute a single action
 */
async function executeAction(
  action: any,
  context: Record<string, any>,
  previousSteps: any[]
): Promise<any> {
  const { type, config } = action;

  switch (type) {
    case 'send_email':
      return await sendEmailAction(config, context);

    case 'send_slack_message':
      return await sendSlackMessage(config, context);

    case 'create_notification':
      return await createNotificationAction(config, context);

    case 'update_database':
      return await updateDatabaseAction(config, context);

    case 'call_webhook':
      return await callWebhookAction(config, context);

    case 'delay':
      return await delayAction(config);

    case 'condition':
      return await evaluateCondition(config, context, previousSteps);

    default:
      throw new Error(`Unknown action type: ${type}`);
  }
}

/**
 * Action implementations
 */
async function sendEmailAction(config: any, context: any): Promise<any> {
  // Placeholder - integrate with actual email service
  console.log('Sending email:', config);
  return { sent: true, to: config.to, subject: config.subject };
}

async function sendSlackMessage(config: any, context: any): Promise<any> {
  // Get Slack integration
  const [slackIntegration] = await db
    .select()
    .from(integrations)
    .where(and(
      eq(integrations.provider, 'slack'),
      eq(integrations.isEnabled, true)
    ));

  if (!slackIntegration) {
    throw new Error('Slack integration not configured');
  }

  const credentials = JSON.parse(slackIntegration.credentials);

  // Placeholder - integrate with Slack API
  console.log('Sending Slack message:', config.message);
  return { sent: true, channel: config.channel };
}

async function createNotificationAction(config: any, context: any): Promise<any> {
  // Create in-app notification
  const { notifications } = await import('./db/schema');

  await db.insert(notifications).values({
    userId: config.userId,
    userType: config.userType,
    type: config.type,
    title: config.title,
    message: config.message,
    isRead: false
  });

  return { created: true };
}

async function updateDatabaseAction(config: any, context: any): Promise<any> {
  // Generic database update
  const { table, id, data } = config;

  // Placeholder - implement table-specific updates
  console.log('Updating database:', { table, id, data });
  return { updated: true };
}

async function callWebhookAction(config: any, context: any): Promise<any> {
  const response = await fetch(config.url, {
    method: config.method || 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(config.headers || {})
    },
    body: JSON.stringify(config.payload || context)
  });

  return {
    status: response.status,
    data: await response.json()
  };
}

async function delayAction(config: any): Promise<any> {
  const ms = config.duration || 1000;
  await new Promise(resolve => setTimeout(resolve, ms));
  return { delayed: ms };
}

async function evaluateCondition(config: any, context: any, previousSteps: any[]): Promise<any> {
  const { condition, ifTrue, ifFalse } = config;

  // Simple condition evaluation
  const result = eval(condition.replace(/\{(\w+)\}/g, (_, key) => JSON.stringify(context[key])));

  return { conditionMet: result, branch: result ? 'true' : 'false' };
}

// ============================================================
// 2. Integration Management
// ============================================================

/**
 * Add integration
 */
export async function addIntegration(params: {
  name: string;
  type: 'messaging' | 'crm' | 'storage' | 'analytics' | 'automation';
  provider: string;
  credentials: Record<string, any>;
  config?: Record<string, any>;
  createdBy: string;
}): Promise<any> {
  const { name, type, provider, credentials, config = {}, createdBy } = params;

  // Encrypt credentials
  const encryptedCredentials = encryptData(JSON.stringify(credentials));

  const [integration] = await db.insert(integrations).values({
    name,
    type,
    provider,
    credentials: encryptedCredentials,
    config: JSON.stringify(config),
    isEnabled: true,
    syncStatus: 'active',
    createdBy
  }).returning();

  return integration;
}

/**
 * Test integration connection
 */
export async function testIntegration(integrationId: number): Promise<boolean> {
  const [integration] = await db
    .select()
    .from(integrations)
    .where(eq(integrations.id, integrationId));

  if (!integration) {
    throw new Error('Integration not found');
  }

  try {
    const credentials = JSON.parse(decryptData(integration.credentials));

    // Provider-specific test
    switch (integration.provider) {
      case 'slack':
        return await testSlackConnection(credentials);
      case 'discord':
        return await testDiscordConnection(credentials);
      case 'google':
        return await testGoogleConnection(credentials);
      default:
        return true;
    }
  } catch (error) {
    await db.update(integrations)
      .set({
        syncStatus: 'error',
        errorMessage: error instanceof Error ? error.message : 'Unknown error'
      })
      .where(eq(integrations.id, integrationId));

    return false;
  }
}

async function testSlackConnection(credentials: any): Promise<boolean> {
  // Placeholder - implement Slack API test
  return true;
}

async function testDiscordConnection(credentials: any): Promise<boolean> {
  // Placeholder - implement Discord API test
  return true;
}

async function testGoogleConnection(credentials: any): Promise<boolean> {
  // Placeholder - implement Google API test
  return true;
}

// ============================================================
// 3. Webhook Management
// ============================================================

/**
 * Create webhook
 */
export async function createWebhook(params: {
  name: string;
  url: string;
  events: string[];
  headers?: Record<string, string>;
  createdBy: string;
}): Promise<any> {
  const { name, url, events, headers = {}, createdBy } = params;

  // Generate secret
  const secret = crypto.randomBytes(32).toString('hex');

  const [webhook] = await db.insert(webhooks).values({
    name,
    url,
    events: JSON.stringify(events),
    secret,
    headers: JSON.stringify(headers),
    retryConfig: JSON.stringify({ max_retries: 3, backoff: 'exponential' }),
    isActive: true,
    createdBy
  }).returning();

  return webhook;
}

/**
 * Trigger webhook
 */
export async function triggerWebhook(params: {
  event: string;
  payload: Record<string, any>;
}): Promise<void> {
  const { event, payload } = params;

  // Find all webhooks subscribed to this event
  const allWebhooks = await db.select().from(webhooks).where(eq(webhooks.isActive, true));

  const matchingWebhooks = allWebhooks.filter(webhook => {
    const events = JSON.parse(webhook.events);
    return events.includes(event) || events.includes('*');
  });

  // Trigger each webhook
  for (const webhook of matchingWebhooks) {
    await sendWebhook(webhook, event, payload);
  }
}

/**
 * Send webhook with retry logic
 */
async function sendWebhook(webhook: any, event: string, payload: Record<string, any>, attempt: number = 1): Promise<void> {
  const retryConfig = JSON.parse(webhook.retryConfig || '{"max_retries":3}');
  const maxRetries = retryConfig.max_retries || 3;

  try {
    // Generate HMAC signature
    const signature = crypto
      .createHmac(WORKFLOW_CONFIG.HMAC_ALGORITHM, webhook.secret)
      .update(JSON.stringify(payload))
      .digest('hex');

    const headers = {
      'Content-Type': 'application/json',
      'X-Webhook-Signature': signature,
      'X-Webhook-Event': event,
      ...(webhook.headers ? JSON.parse(webhook.headers) : {})
    };

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), WORKFLOW_CONFIG.WEBHOOK_TIMEOUT);

    const response = await fetch(webhook.url, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    const responseBody = await response.text();

    // Log success
    await db.insert(webhookLogs).values({
      webhookId: webhook.id,
      event,
      payload: JSON.stringify(payload),
      status: 'success',
      responseCode: response.status,
      responseBody: responseBody.substring(0, 1000),
      attemptNumber: attempt
    });

    // Update webhook stats
    await db.update(webhooks)
      .set({
        lastTriggeredAt: new Date(),
        successCount: sql`${webhooks.successCount} + 1`
      })
      .where(eq(webhooks.id, webhook.id));

  } catch (error: any) {
    const errorMessage = error.message || 'Unknown error';

    // Log failure
    await db.insert(webhookLogs).values({
      webhookId: webhook.id,
      event,
      payload: JSON.stringify(payload),
      status: attempt < maxRetries ? 'retrying' : 'failed',
      attemptNumber: attempt,
      error: errorMessage
    });

    // Retry if attempts remain
    if (attempt < maxRetries) {
      const backoffDelay = retryConfig.backoff === 'exponential'
        ? Math.pow(2, attempt) * 1000
        : 1000;

      await new Promise(resolve => setTimeout(resolve, backoffDelay));
      return await sendWebhook(webhook, event, payload, attempt + 1);
    }

    // Update failure count
    await db.update(webhooks)
      .set({
        failureCount: sql`${webhooks.failureCount} + 1`
      })
      .where(eq(webhooks.id, webhook.id));
  }
}

/**
 * Verify webhook signature
 */
export function verifyWebhookSignature(
  payload: string,
  signature: string,
  secret: string
): boolean {
  const expectedSignature = crypto
    .createHmac(WORKFLOW_CONFIG.HMAC_ALGORITHM, secret)
    .update(payload)
    .digest('hex');

  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  );
}

// ============================================================
// 4. Automation Templates
// ============================================================

/**
 * Get popular automation templates
 */
export async function getAutomationTemplates(params?: {
  category?: string;
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  limit?: number;
}): Promise<any[]> {
  const { category, difficulty, limit = 20 } = params || {};

  let query = db.select().from(automationTemplates).where(eq(automationTemplates.isPublic, true));

  if (category) {
    query = query.where(eq(automationTemplates.category, category as any)) as any;
  }

  if (difficulty) {
    query = query.where(eq(automationTemplates.difficulty, difficulty)) as any;
  }

  const templates = await query
    .orderBy(desc(automationTemplates.popularity))
    .limit(limit);

  return templates.map(template => ({
    ...template,
    workflowTemplate: JSON.parse(template.workflowTemplate),
    requiredIntegrations: template.requiredIntegrations ? JSON.parse(template.requiredIntegrations) : []
  }));
}

/**
 * Create workflow from template
 */
export async function createWorkflowFromTemplate(params: {
  templateId: number;
  name: string;
  customConfig?: Record<string, any>;
  createdBy: string;
}): Promise<any> {
  const { templateId, name, customConfig = {}, createdBy } = params;

  const [template] = await db
    .select()
    .from(automationTemplates)
    .where(eq(automationTemplates.id, templateId));

  if (!template) {
    throw new Error('Template not found');
  }

  const workflowTemplate = JSON.parse(template.workflowTemplate);

  // Merge custom config
  const finalWorkflow = {
    ...workflowTemplate,
    ...customConfig
  };

  const [workflow] = await db.insert(workflows).values({
    name,
    description: template.description,
    trigger: finalWorkflow.trigger,
    triggerConfig: JSON.stringify(finalWorkflow.triggerConfig),
    actions: JSON.stringify(finalWorkflow.actions),
    isActive: false, // Start inactive for user configuration
    createdBy
  }).returning();

  // Update template popularity
  await db.update(automationTemplates)
    .set({ popularity: sql`${automationTemplates.popularity} + 1` })
    .where(eq(automationTemplates.id, templateId));

  return workflow;
}

// ============================================================
// Utility Functions
// ============================================================

function encryptData(data: string): string {
  const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'default-key-please-change';
  const key = Buffer.from(ENCRYPTION_KEY.padEnd(32, '0').slice(0, 32));
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);

  let encrypted = cipher.update(data, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const authTag = cipher.getAuthTag();

  return iv.toString('hex') + ':' + authTag.toString('hex') + ':' + encrypted;
}

function decryptData(encryptedData: string): string {
  const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'default-key-please-change';
  const key = Buffer.from(ENCRYPTION_KEY.padEnd(32, '0').slice(0, 32));
  const parts = encryptedData.split(':');
  const iv = Buffer.from(parts[0], 'hex');
  const authTag = Buffer.from(parts[1], 'hex');
  const encrypted = parts[2];

  const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
  decipher.setAuthTag(authTag);

  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');

  return decrypted;
}

export default {
  executeWorkflow,
  addIntegration,
  testIntegration,
  createWebhook,
  triggerWebhook,
  verifyWebhookSignature,
  getAutomationTemplates,
  createWorkflowFromTemplate
};
