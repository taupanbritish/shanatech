import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import { Readable } from "node:stream";
import { NextResponse, type NextRequest } from "next/server";
import { getAdminSession } from "@/lib/auth";
import { backupPath, isBackupName } from "@/lib/backups";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ file: string }> },
) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.redirect(new URL("/admin/login", request.url), 303);
  }

  const { file } = await params;
  if (!isBackupName(file)) {
    return new NextResponse("Berkas tidak ditemukan.", { status: 404 });
  }

  let filePath: string;
  let size: number;
  try {
    filePath = backupPath(file);
    size = (await stat(filePath)).size;
  } catch {
    return new NextResponse("Berkas tidak ditemukan.", { status: 404 });
  }

  const stream = Readable.toWeb(createReadStream(filePath)) as ReadableStream<Uint8Array>;

  return new Response(stream, {
    headers: {
      "Content-Type": "application/octet-stream",
      "Content-Length": String(size),
      "Content-Disposition": `attachment; filename="${file}"`,
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
