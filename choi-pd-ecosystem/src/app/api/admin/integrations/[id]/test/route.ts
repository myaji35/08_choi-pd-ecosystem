import { NextRequest, NextResponse } from 'next/server';
import { testIntegrationConnection } from '@/lib/workflows';

/**
 * POST /api/admin/integrations/[id]/test
 * Test integration connection
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const integrationId = parseInt(params.id);

    const result = await testIntegrationConnection(integrationId);

    return NextResponse.json({
      success: true,
      ...result
    });
  } catch (error) {
    console.error('Error testing integration:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to test integration' },
      { status: 500 }
    );
  }
}
