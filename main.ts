import { Hono } from "https://deno.land/x/hono@v3.4.1/mod.ts";
import { cors } from "https://deno.land/x/hono/middleware.ts";

const app = new Hono();
const kv = await Deno.openKv();

// Usar el middleware de CORS
app.use('*', cors({
  origin: '*',  // Permitir cualquier origen
  methods: ['GET', 'POST', 'DELETE','OPTIONS'],  // Permitir estos métodos
  headers: ['Content-Type']  // Permitir estos encabezados
}));

// Redirect root URL
app.get("/", (c) => c.redirect("/items"));

// List all items
app.get("/items", async (c) => {
  const iter = await kv.list({ prefix: ["items"] });
  const items = [];
  for await (const res of iter) items.push(res);

  return c.json(items);
});

// Create a book (POST body is JSON)
app.post("/items", async (c) => {
  const body = await c.req.json();
  const result = await kv.set(["items", body.id], body.value);
  return c.json(result);
});

// Get a item by id
app.get("/items/:id", async (c) => {
  const id = c.req.param("id");
  const result = await kv.get(["items",id]);
  return c.json(result);
});

// Delete a book by title
app.delete("/items/:id", async (c) => {
  const id = c.req.param("id");
  await kv.delete(["id", id]);
  return c.text("");
});

Deno.serve(app.fetch);