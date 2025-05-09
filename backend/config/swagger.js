const swaggerJsdoc = require("swagger-jsdoc");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "SublidathaApp API",
      version: "1.0.0",
      description: "Documentación de la API de SublidathaApp",
    },
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
      schemas: {
        Usuario: {
          type: "object",
          properties: {
            usuarioID: {
              type: "integer",
              example: 1,
            },
            nombre: {
              type: "string",
              example: "Efraín",
            },
            apellido: {
              type: "string",
              example: "Briñez",
            },
            email: {
              type: "string",
              format: "email",
              example: "e.brinez@example.com",
            },
            direccion: {
              type: "string",
              example: "Av. Siempre Viva 123",
            },
            telefono: {
              type: "string",
              example: "+56912345678",
            },
            rol: {
              type: "string",
              enum: ["cliente", "administrador"],
              example: "cliente",
            },
            avatar: {
              type: "string",
              format: "uri",
              example: "http://localhost:3000/uploads/avatar.jpg",
            },
          },
          required: ["usuarioID", "nombre", "apellido", "email", "rol"],
        },
        Producto: {
          type: "object",
          properties: {
            productoID: { type: "integer", example: 1 },
            nombre: { type: "string", example: "Taza Personalizada" },
            descripcion: { type: "string", example: "Taza de cerámica 11oz" },
            precio: { type: "number", example: 12.99 },
            stock: { type: "integer", example: 50 },
            imagen: { type: "string", format: "uri", example: "http://…" },
          },
          required: ["productoID", "nombre", "precio", "stock"],
        },
        Pedido: {
          type: "object",
          properties: {
            pedidoID: { type: "integer", example: 10 },
            usuarioID: { type: "integer", example: 3 },
            fecha: {
              type: "string",
              format: "date-time",
              example: "2025-05-01T12:34:56Z",
            },
            estado: { type: "string", example: "pendiente" },
          },
          required: ["pedidoID", "usuarioID", "fecha", "estado"],
        },
        DetallePedido: {
          type: "object",
          properties: {
            detallePedidoID: { type: "integer", example: 5 },
            pedidoID: { type: "integer", example: 10 },
            productoID: { type: "integer", example: 1 },
            cantidad: { type: "integer", example: 2 },
            precioUnitario: { type: "number", example: 12.99 },
          },
          required: [
            "detallePedidoID",
            "pedidoID",
            "productoID",
            "cantidad",
            "precioUnitario",
          ],
        },
        ProductoExistencia: {
          type: "object",
          properties: {
            productoID: { type: "integer", example: 1 },
            nombre: { type: "string", example: "Taza 11oz" },
            stock: { type: "integer", example: 42 },
          },
        },
        VentasPorMes: {
          type: "object",
          properties: {
            mes: { type: "integer", example: 5 },
            total: { type: "number", example: 12345.67 },
          },
        },
      },
      responses: {
        Unauthorized: {
          description: "No autorizado",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  message: {
                    type: "string",
                    example: "Token inválido o ausente",
                  },
                },
              },
            },
          },
        },
        Forbidden: {
          description: "No tienes permisos para acceder a este recurso",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  message: { type: "string", example: "Acceso denegado" },
                },
              },
            },
          },
        },
        InternalServerError: {
          description: "Error interno del servidor",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  message: { type: "string", example: "Error en el servidor" },
                },
              },
            },
          },
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
    tags: [
      {
        name: "Usuarios",
        description: "Endpoints de registro, login y perfil",
      },
      { name: "Productos", description: "Gestión de productos" },
      { name: "Pedidos", description: "Gestión de pedidos" },
      { name: "Pagos", description: "Procesamiento de pagos" },
      { name: "Admin", description: "Dashboard y estadísticas admin" },
    ],
    servers: [{ url: "http://localhost:3000/", description: "Servidor local" }],
  },
  apis: ["./routes/*.js"],
};

module.exports = swaggerJsdoc(options);
