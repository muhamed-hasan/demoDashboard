import fs from 'fs';
import path from 'path';
import { NextResponse } from 'next/server';

export async function GET() {
  const dataPath = path.join(process.cwd(), 'public', 'data.json');
  const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
  return NextResponse.json(data);
}

export async function POST(request: Request) {
  const newData = await request.json();
  const dataPath = path.join(process.cwd(), 'public', 'data.json');
  const currentData = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

  // تحقق من id المدخل
  const userId = newData.id;
  if (!userId || isNaN(Number(userId))) {
    return NextResponse.json({ error: 'ID must be a valid number.' }, { status: 400 });
  }
  if (currentData[userId]) {
    return NextResponse.json({ error: 'ID already exists.' }, { status: 400 });
  }

  // أضف البيانات الجديدة
  currentData[userId] = { ...newData, id: userId };
  fs.writeFileSync(dataPath, JSON.stringify(currentData, null, 2));
  return NextResponse.json({ success: true });
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  const dataPath = path.join(process.cwd(), 'public', 'data.json');
  const currentData = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

  if (!id || !currentData[id]) {
    return NextResponse.json({ error: 'ID not found.' }, { status: 404 });
  }

  delete currentData[id];
  fs.writeFileSync(dataPath, JSON.stringify(currentData, null, 2));
  return NextResponse.json({ success: true });
}