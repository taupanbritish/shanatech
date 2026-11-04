import { query } from "@/lib/db";
import type { CourseCategory, CourseMode } from "@/lib/queries";

export type RegistrationStatus = "Baru" | "Dihubungi" | "Terdaftar" | "Batal";
export type MessageStatus = "Baru" | "Diproses" | "Selesai";
export type ScheduleStatus = "Dibuka" | "Ditutup" | "Selesai";

export type RegistrationRow = {
  id: number;
  fullName: string;
  email: string;
  phone: string;
  education: string | null;
  note: string | null;
  status: RegistrationStatus;
  createdAt: Date;
  courseId: number;
  courseName: string;
  batch: string | null;
  scheduleLabel: string | null;
};

export type MessageRow = {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  company: string | null;
  service: string;
  message: string;
  status: MessageStatus;
  emailSent: boolean;
  createdAt: Date;
};

export type AdminCourse = {
  id: number;
  slug: string;
  name: string;
  category: CourseCategory;
  level: string;
  summary: string;
  description: string;
  highlights: string[];
  durationLabel: string;
  sessions: number;
  price: number;
  mode: CourseMode;
  featured: boolean;
  active: boolean;
  sortOrder: number;
  scheduleCount: number;
  registrationCount: number;
};

export type AdminSchedule = {
  id: number;
  courseId: number;
  courseName: string;
  category: CourseCategory;
  batch: string;
  startDate: string;
  endDate: string;
  label: string;
  instructor: string;
  room: string;
  mode: CourseMode;
  quota: number;
  enrolled: number;
  status: ScheduleStatus;
};

export type DashboardData = {
  stats: {
    newRegistrations: number;
    newMessages: number;
    activeCourses: number;
    openSchedules: number;
    totalRegistrations: number;
    enrolledStudents: number;
  };
  recent: RegistrationRow[];
  upcoming: AdminSchedule[];
};

type RegistrationQueryRow = {
  id: number;
  full_name: string;
  email: string;
  phone: string;
  education: string | null;
  note: string | null;
  status: RegistrationStatus;
  created_at: Date;
  course_id: number;
  course_name: string;
  batch: string | null;
  schedule_label: string | null;
};

const registrationColumns = `
  r.id, r.full_name, r.email, r.phone, r.education, r.note, r.status, r.created_at,
  c.id AS course_id, c.name AS course_name, s.batch, s.schedule_label
`;

function mapRegistration(row: RegistrationQueryRow): RegistrationRow {
  return {
    id: row.id,
    fullName: row.full_name,
    email: row.email,
    phone: row.phone,
    education: row.education,
    note: row.note,
    status: row.status,
    createdAt: row.created_at,
    courseId: row.course_id,
    courseName: row.course_name,
    batch: row.batch,
    scheduleLabel: row.schedule_label,
  };
}

export async function getDashboardData(): Promise<DashboardData> {
  const [statsResult, recentResult, upcomingResult] = await Promise.all([
    query<{
      new_registrations: number;
      new_messages: number;
      active_courses: number;
      open_schedules: number;
      total_registrations: number;
      enrolled_students: number;
    }>(`
      SELECT
        (SELECT COUNT(*) FROM registrations WHERE status = 'Baru')::int AS new_registrations,
        (SELECT COUNT(*) FROM contact_messages WHERE status = 'Baru')::int AS new_messages,
        (SELECT COUNT(*) FROM courses WHERE is_active = TRUE)::int AS active_courses,
        (SELECT COUNT(*) FROM schedules WHERE status = 'Dibuka')::int AS open_schedules,
        (SELECT COUNT(*) FROM registrations WHERE status <> 'Batal')::int AS total_registrations,
        (SELECT COUNT(*) FROM registrations WHERE status = 'Terdaftar')::int AS enrolled_students
    `),
    query<RegistrationQueryRow>(
      `SELECT ${registrationColumns}
       FROM registrations r
       JOIN courses c ON c.id = r.course_id
       LEFT JOIN schedules s ON s.id = r.schedule_id
       ORDER BY r.created_at DESC
       LIMIT 6`,
    ),
    query<ScheduleQueryRow>(
      `SELECT ${scheduleColumns}
       FROM schedules s
       JOIN courses c ON c.id = s.course_id
       WHERE s.status = 'Dibuka' AND s.end_date >= CURRENT_DATE
       ORDER BY s.start_date ASC, s.batch ASC
       LIMIT 5`,
    ),
  ]);

  const stats = statsResult.rows[0];

  return {
    stats: {
      newRegistrations: stats.new_registrations,
      newMessages: stats.new_messages,
      activeCourses: stats.active_courses,
      openSchedules: stats.open_schedules,
      totalRegistrations: stats.total_registrations,
      enrolledStudents: stats.enrolled_students,
    },
    recent: recentResult.rows.map(mapRegistration),
    upcoming: upcomingResult.rows.map(mapSchedule),
  };
}

export type RegistrationFilters = {
  status?: RegistrationStatus;
  q?: string;
  page?: number;
};

export type RegistrationList = {
  rows: RegistrationRow[];
  total: number;
  counts: Record<RegistrationStatus, number>;
  page: number;
  pageCount: number;
};

const REGISTRATION_PAGE_SIZE = 15;

export async function listRegistrations({
  status,
  q,
  page = 1,
}: RegistrationFilters): Promise<RegistrationList> {
  const search = q?.trim() ? `%${q.trim()}%` : null;
  const offset = (Math.max(1, page) - 1) * REGISTRATION_PAGE_SIZE;

  const [rowsResult, countsResult] = await Promise.all([
    query<RegistrationQueryRow & { total: number }>(
      `SELECT ${registrationColumns}, COUNT(*) OVER()::int AS total
       FROM registrations r
       JOIN courses c ON c.id = r.course_id
       LEFT JOIN schedules s ON s.id = r.schedule_id
       WHERE ($1::text IS NULL OR r.status = $1)
         AND ($2::text IS NULL OR r.full_name ILIKE $2 OR r.email ILIKE $2 OR r.phone ILIKE $2)
       ORDER BY r.created_at DESC
       LIMIT $3 OFFSET $4`,
      [status ?? null, search, REGISTRATION_PAGE_SIZE, offset],
    ),
    query<{ status: RegistrationStatus; count: number }>(
      `SELECT status, COUNT(*)::int AS count FROM registrations GROUP BY status`,
    ),
  ]);

  const counts: Record<RegistrationStatus, number> = {
    Baru: 0,
    Dihubungi: 0,
    Terdaftar: 0,
    Batal: 0,
  };
  for (const row of countsResult.rows) counts[row.status] = row.count;

  const total = rowsResult.rows[0]?.total ?? 0;

  return {
    rows: rowsResult.rows.map(mapRegistration),
    total,
    counts,
    page: Math.max(1, page),
    pageCount: Math.max(1, Math.ceil(total / REGISTRATION_PAGE_SIZE)),
  };
}

export type MessageFilters = {
  status?: MessageStatus;
  q?: string;
  page?: number;
};

export type MessageList = {
  rows: MessageRow[];
  total: number;
  counts: Record<MessageStatus, number>;
  page: number;
  pageCount: number;
};

const MESSAGE_PAGE_SIZE = 12;

type MessageQueryRow = {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  company: string | null;
  service: string;
  message: string;
  status: MessageStatus;
  email_sent: boolean;
  created_at: Date;
};

function mapMessage(row: MessageQueryRow): MessageRow {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    phone: row.phone,
    company: row.company,
    service: row.service,
    message: row.message,
    status: row.status,
    emailSent: row.email_sent,
    createdAt: row.created_at,
  };
}

export async function listMessages({
  status,
  q,
  page = 1,
}: MessageFilters): Promise<MessageList> {
  const search = q?.trim() ? `%${q.trim()}%` : null;
  const offset = (Math.max(1, page) - 1) * MESSAGE_PAGE_SIZE;

  const [rowsResult, countsResult] = await Promise.all([
    query<MessageQueryRow & { total: number }>(
      `SELECT id, name, email, phone, company, service, message, status, email_sent, created_at,
              COUNT(*) OVER()::int AS total
       FROM contact_messages
       WHERE ($1::text IS NULL OR status = $1)
         AND ($2::text IS NULL OR name ILIKE $2 OR email ILIKE $2 OR company ILIKE $2 OR service ILIKE $2)
       ORDER BY created_at DESC
       LIMIT $3 OFFSET $4`,
      [status ?? null, search, MESSAGE_PAGE_SIZE, offset],
    ),
    query<{ status: MessageStatus; count: number }>(
      `SELECT status, COUNT(*)::int AS count FROM contact_messages GROUP BY status`,
    ),
  ]);

  const counts: Record<MessageStatus, number> = { Baru: 0, Diproses: 0, Selesai: 0 };
  for (const row of countsResult.rows) counts[row.status] = row.count;

  const total = rowsResult.rows[0]?.total ?? 0;

  return {
    rows: rowsResult.rows.map(mapMessage),
    total,
    counts,
    page: Math.max(1, page),
    pageCount: Math.max(1, Math.ceil(total / MESSAGE_PAGE_SIZE)),
  };
}

export async function listAdminCourses(): Promise<AdminCourse[]> {
  const { rows } = await query<{
    id: number;
    slug: string;
    name: string;
    category: CourseCategory;
    level: string;
    summary: string;
    description: string;
    highlights: string[];
    duration_label: string;
    sessions: number;
    price: number;
    mode: CourseMode;
    is_featured: boolean;
    is_active: boolean;
    sort_order: number;
    schedule_count: number;
    registration_count: number;
  }>(`
    SELECT c.id, c.slug, c.name, c.category, c.level, c.summary, c.description, c.highlights,
           c.duration_label, c.sessions, c.price, c.mode, c.is_featured, c.is_active, c.sort_order,
           (SELECT COUNT(*) FROM schedules s WHERE s.course_id = c.id)::int AS schedule_count,
           (SELECT COUNT(*) FROM registrations r
             WHERE r.course_id = c.id AND r.status <> 'Batal')::int AS registration_count
    FROM courses c
    ORDER BY c.sort_order ASC, c.name ASC
  `);

  return rows.map((row) => ({
    id: row.id,
    slug: row.slug,
    name: row.name,
    category: row.category,
    level: row.level,
    summary: row.summary,
    description: row.description,
    highlights: row.highlights,
    durationLabel: row.duration_label,
    sessions: row.sessions,
    price: row.price,
    mode: row.mode,
    featured: row.is_featured,
    active: row.is_active,
    sortOrder: row.sort_order,
    scheduleCount: row.schedule_count,
    registrationCount: row.registration_count,
  }));
}

export async function getAdminCourse(id: number): Promise<AdminCourse | null> {
  const { rows } = await query<{
    id: number;
    slug: string;
    name: string;
    category: CourseCategory;
    level: string;
    summary: string;
    description: string;
    highlights: string[];
    duration_label: string;
    sessions: number;
    price: number;
    mode: CourseMode;
    is_featured: boolean;
    is_active: boolean;
    sort_order: number;
  }>(
    `SELECT id, slug, name, category, level, summary, description, highlights,
            duration_label, sessions, price, mode, is_featured, is_active, sort_order
     FROM courses WHERE id = $1`,
    [id],
  );

  const row = rows[0];
  if (!row) return null;

  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    category: row.category,
    level: row.level,
    summary: row.summary,
    description: row.description,
    highlights: row.highlights,
    durationLabel: row.duration_label,
    sessions: row.sessions,
    price: row.price,
    mode: row.mode,
    featured: row.is_featured,
    active: row.is_active,
    sortOrder: row.sort_order,
    scheduleCount: 0,
    registrationCount: 0,
  };
}

export type CourseOption = {
  id: number;
  name: string;
  category: CourseCategory;
  active: boolean;
};

export async function listCourseOptions(): Promise<CourseOption[]> {
  const { rows } = await query<{
    id: number;
    name: string;
    category: CourseCategory;
    is_active: boolean;
  }>(`SELECT id, name, category, is_active FROM courses ORDER BY sort_order ASC, name ASC`);

  return rows.map((row) => ({
    id: row.id,
    name: row.name,
    category: row.category,
    active: row.is_active,
  }));
}

type ScheduleQueryRow = {
  id: number;
  course_id: number;
  course_name: string;
  category: CourseCategory;
  batch: string;
  start_date: string;
  end_date: string;
  schedule_label: string;
  instructor: string;
  room: string;
  mode: CourseMode;
  quota: number;
  enrolled: number;
  status: ScheduleStatus;
};

const scheduleColumns = `
  s.id, s.course_id, c.name AS course_name, c.category, s.batch,
  to_char(s.start_date, 'YYYY-MM-DD') AS start_date,
  to_char(s.end_date, 'YYYY-MM-DD') AS end_date,
  s.schedule_label, s.instructor, s.room, s.mode, s.quota, s.status,
  (SELECT COUNT(*) FROM registrations r
    WHERE r.schedule_id = s.id AND r.status <> 'Batal')::int AS enrolled
`;

function mapSchedule(row: ScheduleQueryRow): AdminSchedule {
  return {
    id: row.id,
    courseId: row.course_id,
    courseName: row.course_name,
    category: row.category,
    batch: row.batch,
    startDate: row.start_date,
    endDate: row.end_date,
    label: row.schedule_label,
    instructor: row.instructor,
    room: row.room,
    mode: row.mode,
    quota: row.quota,
    enrolled: row.enrolled,
    status: row.status,
  };
}

export async function listAdminSchedules(): Promise<AdminSchedule[]> {
  const { rows } = await query<ScheduleQueryRow>(
    `SELECT ${scheduleColumns}
     FROM schedules s
     JOIN courses c ON c.id = s.course_id
     ORDER BY s.start_date ASC, c.name ASC, s.batch ASC`,
  );
  return rows.map(mapSchedule);
}

export async function getAdminSchedule(id: number): Promise<AdminSchedule | null> {
  const { rows } = await query<ScheduleQueryRow>(
    `SELECT ${scheduleColumns}
     FROM schedules s
     JOIN courses c ON c.id = s.course_id
     WHERE s.id = $1`,
    [id],
  );
  return rows[0] ? mapSchedule(rows[0]) : null;
}

export async function getRegistrationCountForSchedule(id: number): Promise<number> {
  const { rows } = await query<{ count: number }>(
    `SELECT COUNT(*)::int AS count FROM registrations
     WHERE schedule_id = $1 AND status <> 'Batal'`,
    [id],
  );
  return rows[0]?.count ?? 0;
}
