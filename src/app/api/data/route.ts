export async function GET() {
  const dataPath = path.join(process.cwd(), 'public', 'data.json');
  const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
  return NextResponse.json(data);
}

export async function POST(request: Request) {
  const newData = await request.json();
  const dataPath = path.join(process.cwd(), 'public', 'data.json');
  
  // قراءة البيانات الحالية
  const currentData = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
  
  // إضافة معرف فريد
  const newId = Math.max(...Object.keys(currentData).map(Number)) + 1;
  currentData[newId] = { ...newData, id: newId.toString() };
  
  // حفظ التغييرات
  fs.writeFileSync(dataPath, JSON.stringify(currentData, null, 2));
  return NextResponse.json({ success: true });
}