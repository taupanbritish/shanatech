import { cacheLife, cacheTag } from "next/cache";
import { query } from "@/lib/db";

export const ACADEMY_CATALOG_TAG = "academy-catalog";

export type CourseCategory = "Komputer" | "Bahasa Inggris";
export type CourseMode = "Offline" | "Online" | "Hybrid";

export type Schedule = {
  id: number;
  batch: string;
  startDate: string;
  endDate: string;
  label: string;
  instructor: string;
  room: string;
  mode: CourseMode;
  quota: number;
  enrolled: number;
  status: "Dibuka" | "Ditutup" | "Selesai";
};

export type Course = {
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
  schedules: Schedule[];
};

type CourseRow = {
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
  schedule_id: number | null;
  batch: string | null;
  start_date: string | null;
  end_date: string | null;
  schedule_label: string | null;
  instructor: string | null;
  room: string | null;
  schedule_mode: CourseMode | null;
  quota: number | null;
  enrolled: number | null;
  status: Schedule["status"] | null;
};

export async function getAcademyCatalog(): Promise<Course[]> {
  "use cache";
  cacheLife("minutes");
  cacheTag(ACADEMY_CATALOG_TAG);

  const { rows } = await query<CourseRow>(`
    SELECT
      c.id, c.slug, c.name, c.category, c.level, c.summary, c.description,
      c.highlights, c.duration_label, c.sessions, c.price, c.mode, c.is_featured,
      s.id AS schedule_id, s.batch,
      to_char(s.start_date, 'YYYY-MM-DD') AS start_date,
      to_char(s.end_date, 'YYYY-MM-DD') AS end_date,
      s.schedule_label, s.instructor, s.room, s.mode AS schedule_mode,
      s.quota, s.status,
      COALESCE(r.enrolled, 0) AS enrolled
    FROM courses c
    LEFT JOIN schedules s ON s.course_id = c.id AND s.status <> 'Selesai'
    LEFT JOIN (
      SELECT schedule_id, COUNT(*)::int AS enrolled
      FROM registrations
      WHERE status <> 'Batal'
      GROUP BY schedule_id
    ) r ON r.schedule_id = s.id
    WHERE c.is_active = TRUE
    ORDER BY c.sort_order ASC, s.start_date ASC
  `);

  const courses = new Map<number, Course>();

  for (const row of rows) {
    let course = courses.get(row.id);
    if (!course) {
      course = {
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
        schedules: [],
      };
      courses.set(row.id, course);
    }

    if (row.schedule_id !== null) {
      course.schedules.push({
        id: row.schedule_id,
        batch: row.batch ?? "",
        startDate: row.start_date ?? "",
        endDate: row.end_date ?? "",
        label: row.schedule_label ?? "",
        instructor: row.instructor ?? "",
        room: row.room ?? "",
        mode: row.schedule_mode ?? row.mode,
        quota: row.quota ?? 0,
        enrolled: row.enrolled ?? 0,
        status: row.status ?? "Dibuka",
      });
    }
  }

  return Array.from(courses.values());
}
