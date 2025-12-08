import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { integrations } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { updateIntegration } from '@/lib/workflows';

/**
 * GET /api/admin/integrations/[id]
 * Get integration details
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const integrationId = parseInt(params.id);

    const [integration] = await db
      .select()
      .from(integrations)
      .where(eq(integrations.id, integrationId));

    if (!integration) {
      return NextResponse.json(
        { success: false, error: 'Integration not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      integration: {
        ...integration,
        credentials: '***encrypted***'
      }
    });
  } catch (error) {
    console.error('Error fetching integration:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch integration' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/admin/integrations/[id]
 * Update integration
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const integrationId = parseInt(params.id);
    const body = await request.json();

    // Use utility function to handle credential encryption
    const updatedIntegration = await updateIntegration(integrationId, body);

    return NextResponse.json({
      success: true,
      integration: {
        ...updatedIntegration,
        credentials: '***encrypted***'
      }
    });
  } catch (error) {
    console.error('Error updating integration:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update integration' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/integrations/[id]
 * Delete integration
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const integrationId = parseInt(params.id);

    await db.delete(integrations).where(eq(integrations.id, integrationId));

    return NextResponse.json({
      success: true,
      message: 'Integration deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting integration:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete integration' },
      { status: 500 }
    );
  }
}
