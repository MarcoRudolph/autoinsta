import { NextRequest, NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import { join } from 'path';
import { existsSync, mkdirSync } from 'fs';

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

    // Convert data to formatted JSON
    const jsonContent = JSON.stringify(data, null, 2);

    // Get the public folder path
    const publicPath = join(process.cwd(), 'public');
    const filePath = join(publicPath, filename);

    // Ensure the public folder exists
    if (!existsSync(publicPath)) {
      mkdirSync(publicPath, { recursive: true });
    }

    // Write the file to the public folder
    await writeFile(filePath, jsonContent, 'utf8');

    console.log(`Template saved successfully as: ${filePath}`);

    // Return success response
    return NextResponse.json({ 
      success: true, 
      message: `Template ${filename} saved successfully to public folder`,
      filename: filename,
      path: filePath
    });

  } catch (error) {
    console.error('Error saving template:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
