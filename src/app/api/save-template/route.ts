import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

export async function POST(request: NextRequest) {
  try {
    const { filename, data } = await request.json();

    if (!filename || !data) {
      return NextResponse.json({ error: 'Missing filename or data' }, { status: 400 });
    }

    // Validate filename to prevent directory traversal
    if (!/^[a-z0-9-]+\.json$/.test(filename)) {
      return NextResponse.json({ error: 'Invalid filename format' }, { status: 400 });
    }

    // Cloudflare Pages requires Edge runtime; writing to local filesystem is not supported.
    // Keep endpoint stable but return a clear actionable error.
    return NextResponse.json(
      {
        error:
          'Template file writes are not supported in Edge runtime. Persist templates in database/storage instead.',
        filename,
        received: Boolean(data),
      },
      { status: 501 }
    );

  } catch (error) {
    console.error('Error saving template:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
