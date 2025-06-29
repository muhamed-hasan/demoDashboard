This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## 📚 توثيق قاعدة البيانات وجدول الحضور (table3)

### اسم الجدول:
`table3`

### أعمدة الجدول:

| العمود         | النوع                        | الوصف                                                                 |
|----------------|-----------------------------|-----------------------------------------------------------------------|
| id             | character varying           | رقم الموظف (معرّف فريد لكل موظف)                                     |
| time           | timestamp without time zone | التاريخ والوقت الكامل للتسجيل (مثال: 2025-04-14 17:00:32)             |
| date           | date                        | التاريخ فقط (مثال: 2025-04-14)                                       |
| time2          | time without time zone      | الوقت فقط (مثال: 17:00:32)                                           |
| fname          | character varying           | الاسم الأول للموظف                                                    |
| lname          | character varying           | اسم العائلة للموظف                                                    |
| name           | character varying           | الاسم الكامل للموظف (fname + lname)                                   |
| rname          | character varying           | اسم الجهاز أو القارئ الذي تم التسجيل منه                              |
| group          | character varying           | القسم أو المجموعة (مثال: All Departments)                             |
| card_number    | character varying           | رقم الكارت أو البطاقة الذكية                                          |
| pic            | character varying           | رابط أو اسم صورة الموظف (إن وجد)                                      |
| dev            | character varying           | نوع الجهاز أو مصدر التسجيل (مثال: Att)                                |

### مثال على البيانات:

| id | time                | date       | time2    | fname | lname | name        | rname          | group           | card_number           | pic | dev |
|----|---------------------|------------|----------|-------|-------|-------------|----------------|------------------|-----------------------|-----|-----|
| 5  | 2025-04-14 17:00:32 | 2025-04-14 | 17:00:32 | Ahmed | Hosny | Ahmed Hosny | Cardreader 01  | All Departments  | 18446744073609551917  |     | Att |
| 5  | 2025-04-14 17:00:40 | 2025-04-14 | 17:00:40 | Ahmed | Hosny | Ahmed Hosny | Cardreader 01  | All Departments  | 18446744073609551917  |     | Att |

### طريقة التواصل مع قاعدة البيانات

#### 1. جلب كل السجلات لموظف في يوم معين:
```sql
SELECT * FROM table3
WHERE id = '5' AND DATE(time) = '2025-04-14'
ORDER BY time ASC;
```

#### 2. جلب أول دخول وآخر خروج لموظف في يوم معين:
```sql
SELECT 
  id,
  MIN(time) as first_login,
  MAX(time) as last_logout
FROM table3
WHERE id = '5' AND DATE(time) = '2025-04-14'
GROUP BY id;
```

#### 3. جلب السجلات في فترة زمنية معينة خلال اليوم (مثلاً بين 08:00 و 17:00):
```sql
SELECT * FROM table3
WHERE id = '5'
  AND DATE(time) = '2025-04-14'
  AND time2 BETWEEN '08:00:00' AND '17:00:00'
ORDER BY time ASC;
```

#### 4. جلب كل السجلات لمجموعة أو قسم معين:
```sql
SELECT * FROM table3
WHERE "group" = 'All Departments'
  AND DATE(time) = '2025-04-14';
```

### ملاحظات مهمة:
- يفضل دائمًا استخدام حقل `time` (timestamp) في العمليات الحسابية (أول دخول، آخر خروج، حساب الساعات).
- يمكن استخدام `time2` لفلترة السجلات حسب وقت معين خلال اليوم (مثلاً: دوام صباحي أو مسائي).
- الأعمدة `fname`, `lname`, `name`, `group`, `rname` مفيدة لعرض معلومات الموظف أو القسم أو الجهاز.
- الأعمدة `card_number`, `pic`, `dev` تستخدم لمعلومات إضافية أو تكامل مع أنظمة أخرى.

### مثال على استخدام الكود في Node.js (pg):
```js
const { Pool } = require('pg');
const pool = new Pool({ /* إعدادات الاتصال */ });

const employeeId = '5';
const date = '2025-04-14';

const result = await pool.query(
  'SELECT MIN(time) as first_login, MAX(time) as last_logout FROM table3 WHERE id = $1 AND DATE(time) = $2',
  [employeeId, date]
);
console.log(result.rows[0]);
```

---
