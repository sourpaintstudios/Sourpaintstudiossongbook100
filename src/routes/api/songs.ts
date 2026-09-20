import { createFileRoute } from "@tanstack/react-router";
import { getSql } from "@/lib/db";

const BLOB_ID = "default";

async function readPayload(): Promise<string | null> {
  const sql = await getSql();
  const rows = await sql<{ payload: string }>`
    select payload from songbook_blob where id = ${BLOB_ID}
  `;
  return rows[0]?.payload ?? null;
}

async function writePayload(payload: string): Promise<void> {
  const sql = await getSql();
  await sql`
    insert into songbook_blob (id, payload, updated_at)
    values (${BLOB_ID}, ${payload}, now())
    on conflict (id) do update
      set payload = excluded.payload,
          updated_at = now()
  `;
}

export const Route = createFileRoute("/api/songs")({
  server: {
    handlers: {
      GET: async () => {
        try {
          const payload = await readPayload();
          return Response.json({ ok: true, payload });
        } catch (err) {
          const message = err instanceof Error ? err.message : "read failed";
          return Response.json({ ok: false, error: message }, { status: 500 });
        }
      },
      POST: async ({ request }: { request: Request }) => {
        try {
          const body = (await request.json()) as { payload?: unknown };
          const payload =
            typeof body?.payload === "string"
              ? body.payload
              : JSON.stringify(body?.payload ?? {});
          if (payload.length > 4_000_000) {
            return Response.json({ ok: false, error: "payload too large" }, { status: 413 });
          }
          await writePayload(payload);
          return Response.json({ ok: true });
        } catch (err) {
          const message = err instanceof Error ? err.message : "write failed";
          return Response.json({ ok: false, error: message }, { status: 500 });
        }
      },
    },
  },
});
