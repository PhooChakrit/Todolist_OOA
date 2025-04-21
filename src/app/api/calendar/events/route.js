// src/app/api/calendar/events/route.js
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";

// สำหรับดึงรายการกิจกรรม
export async function GET(req) {
  const session = await getServerSession(authOptions);
  
  if (!session || !session.accessToken) {
    return new Response(JSON.stringify({ error: "ยังไม่ได้เข้าสู่ระบบหรือไม่มีสิทธิ์เข้าถึง" }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' }
    });
  }
  
  try {
    const response = await fetch(
      'https://www.googleapis.com/calendar/v3/calendars/primary/events',
      {
        headers: {
          'Authorization': `Bearer ${session.accessToken}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    const data = await response.json();
    return new Response(JSON.stringify(data), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// สำหรับเพิ่มกิจกรรมใหม่
export async function POST(req) {
  const session = await getServerSession(authOptions);
  
  if (!session || !session.accessToken) {
    return new Response(JSON.stringify({ error: "ยังไม่ได้เข้าสู่ระบบหรือไม่มีสิทธิ์เข้าถึง" }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' }
    });
  }
  
  try {
    // รับข้อมูลจาก request body
    const eventData = await req.json();
    
    // ตรวจสอบข้อมูลที่จำเป็น
    if (!eventData.summary || !eventData.start || !eventData.end) {
      return new Response(JSON.stringify({ 
        error: "ข้อมูลไม่ครบถ้วน กรุณาระบุ summary, start และ end" 
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // สร้างข้อมูลที่จะส่งไปยัง Google Calendar API
    const calendarEvent = {
      summary: eventData.summary,
      description: eventData.description || '',
      start: {
        dateTime: eventData.start, // เช่น "2025-04-25T09:00:00+07:00"
        timeZone: eventData.timeZone || 'Asia/Bangkok'
      },
      end: {
        dateTime: eventData.end, // เช่น "2025-04-25T10:00:00+07:00"
        timeZone: eventData.timeZone || 'Asia/Bangkok'
      },
      location: eventData.location || '',
      colorId: eventData.colorId || '1',
      // เพิ่มข้อมูลอื่นๆ ตามต้องการ
    };
    
    // ส่งข้อมูลไปยัง Google Calendar API
    const response = await fetch(
      'https://www.googleapis.com/calendar/v3/calendars/primary/events',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(calendarEvent)
      }
    );
    
    const data = await response.json();
    
    if (!response.ok) {
      return new Response(JSON.stringify({ 
        error: "ไม่สามารถสร้างกิจกรรมได้", 
        details: data 
      }), {
        status: response.status,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    return new Response(JSON.stringify({ 
      message: "สร้างกิจกรรมสำเร็จ", 
      event: data 
    }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' }
    });
    
  } catch (error) {
    console.error("Calendar API error:", error);
    return new Response(JSON.stringify({ 
      error: "เกิดข้อผิดพลาดในการสร้างกิจกรรม", 
      details: error.message 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}


// {
//     "summary": "ประชุมทีม",
//     "description": "ประชุมวางแผนโปรเจคใหม่",
//     "start": "2025-04-25T09:00:00+07:00",
//     "end": "2025-04-25T10:00:00+07:00",
//     "location": "ห้องประชุมชั้น 3",
//     "timeZone": "Asia/Bangkok",
//     "colorId": "6"
//   }