const request = require("supertest");
const app = require("../server");
const { sequelize, Producto } = require("../models");

beforeAll(async () => {
  // Sincronizar todos los modelos, forzando reborrado
  await sequelize.sync({ force: true });

  // Semilla inicial: creamos un producto de prueba
  await Producto.create({
    nombre: "ProductoTest",
    descripcion: "Descripción de prueba",
    precio: 9.99,
    stock: 50,
  });
});

afterAll(async () => {
  // Cerramos la conexión para que Jest termine
  await sequelize.close();
});

describe("GET /api/productos", () => {
  it("debe responder 200 y devolver un array con al menos nuestro producto de prueba", async () => {
    const res = await request(app).get("/api/productos");

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);

    const prod = res.body.find((p) => p.nombre === "ProductoTest");
    expect(prod).toBeDefined();
    expect(prod).toHaveProperty("productoID");
    expect(prod).toHaveProperty("precio", 9.99);
    expect(prod).toHaveProperty("stock", 50);
  });
});
