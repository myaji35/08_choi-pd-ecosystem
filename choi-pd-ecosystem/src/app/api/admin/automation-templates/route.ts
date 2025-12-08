import { NextRequest, NextResponse } from 'next/server';
import { getAutomationTemplates, createWorkflowFromTemplate } from '@/lib/workflows';

/**
 * GET /api/admin/automation-templates
 * List automation templates
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category') || undefined;
    const difficulty = searchParams.get('difficulty') as 'beginner' | 'intermediate' | 'advanced' | undefined;
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : undefined;

    const templates = await getAutomationTemplates({
      category,
      difficulty,
      limit
    });

    return NextResponse.json({
      success: true,
      templates
    });
  } catch (error) {
    console.error('Error fetching automation templates:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch templates' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/automation-templates/instantiate
 * Create a workflow from a template
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { templateId, name, customConfig, createdBy } = body;

    if (!templateId || !name || !createdBy) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const workflow = await createWorkflowFromTemplate({
      templateId: parseInt(templateId),
      name,
      customConfig,
      createdBy
    });

    return NextResponse.json({
      success: true,
      workflow
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating workflow from template:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create workflow from template' },
      { status: 500 }
    );
  }
}
