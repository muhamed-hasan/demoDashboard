export default function DataManagementPage() {
  const [data, setData] = useState<EmployeeData[]>([]);
  const [editItem, setEditItem] = useState<EmployeeData | null>(null);

  // جلب البيانات الأولية
  useEffect(() => {
    fetch('/api/data')
      .then(res => res.json())
      .then(setData);
  }, []);

  // معالجة عمليات الحذف
  const handleDelete = (id: string) => {
    fetch(`/api/data?id=${id}`, { method: 'DELETE' })
      .then(() => setData(data.filter(item => item.id !== id)));
  };

  return (
    <div className="p-6">
      <Table>
        {/* عرض البيانات */}
        <TableBody>
          {data.map(item => (
            <TableRow key={item.id}>
              <TableCell>{item.id}</TableCell>
              <TableCell>{item['First Name']}</TableCell>
              <TableCell>{item['Last Name']}</TableCell>
              <TableCell>{item.Department}</TableCell>
              <TableCell>
                <Button onClick={() => setEditItem(item)}>تعديل</Button>
                <Button onClick={() => handleDelete(item.id)}>حذف</Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* نموذج الإضافة/التعديل */}
      <DataForm 
        initialData={editItem}
        onSubmit={(values) => {
          const method = editItem ? 'PUT' : 'POST';
          fetch('/api/data', {
            method,
            body: JSON.stringify(values)
          }).then(() => {
            // تحديث الحالة المحلية
            if (editItem) {
              setData(data.map(d => d.id === values.id ? values : d));
            } else {
              setData([...data, values]);
            }
            setEditItem(null);
          });
        }}
      />
    </div>
  );
}