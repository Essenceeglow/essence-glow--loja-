import { drizzle } from "drizzle-orm/mysql2";
import { products, categories } from "./drizzle/schema.js";
import mysql from "mysql2/promise";

const connection = await mysql.createConnection({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "beauty_store",
});

const db = drizzle(connection);

// Primeiro, verificar se a categoria Maquiagem existe
const existingCategory = await db.select().from(categories).limit(1);
console.log("Categorias existentes:", existingCategory);

// Inserir o produto
const result = await db.insert(products).values({
  categoryId: 1, // Maquiagem
  name: "Gel Facial Peeling Vegano Ruby Skin",
  slug: "gel-peeling-facial",
  description: "Esfoliante líquido que renova a pele suavemente, ajudando a eliminar células mortas e impurezas acumuladas. Enriquecido com ativos hidratantes e antioxidantes, deixa a pele com aspecto mais uniforme e revitalizado — ideal para incluir na rotina de skincare 2x por semana.",
  price: "34.99",
  originalPrice: "44.99",
  images: ["/manus-storage/gel-peeling-ruby-skin_ac23d260.webp"],
  rating: "4.8",
  featured: 1,
});

console.log("Produto inserido com sucesso!");
await connection.end();
