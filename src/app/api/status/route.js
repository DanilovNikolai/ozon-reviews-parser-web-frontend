// // app/api/status/route.js
// import { NextResponse } from 'next/server';

// export async function GET(req) {
//   try {
//     const { searchParams } = new URL(req.url);
//     const jobId = searchParams.get('jobId');

//     if (!jobId) {
//       return NextResponse.json(
//         {
//           success: false,
//           error: 'Не передан jobId',
//         },
//         { status: 400 }
//       );
//     }

//     const backendRes = await fetch(`${process.env.SERVER_API_URL}/parse/${jobId}/status`, {
//       method: 'GET',
//     });

//     let data;
//     try {
//       data = await backendRes.json();
//     } catch (e) {
//       console.error('Ошибка парсинга JSON от backend /parse/:jobId/status:', e);
//       return NextResponse.json(
//         {
//           success: false,
//           error: 'Ошибка получения статуса задачи',
//         },
//         { status: 500 }
//       );
//     }

//     return NextResponse.json(data, { status: 200 });
//   } catch (err) {
//     console.error('Ошибка /api/status:', err);
//     return NextResponse.json(
//       {
//         success: false,
//         error: err.message || 'Неизвестная ошибка /api/status',
//       },
//       { status: 500 }
//     );
//   }
// }
