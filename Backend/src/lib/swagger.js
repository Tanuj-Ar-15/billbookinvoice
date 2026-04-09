const swaggerJsDoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");
const path = require("path");

module.exports = (app) => {
  const options = {
    definition: {
      openapi: "3.0.0",
      info: {
        title: "Restaurant API",
        version: "1.0.0",
        description: "API documentation for Restaurant Authentication & Items",
      },
      servers: [
        {
          url: process.env.BASE_URL || "http://localhost:5000",
        },
      ],
      components: {
        securitySchemes: {
          bearerAuth: {
            type: "http",
            scheme: "bearer",
            bearerFormat: "JWT",
          },
        },
      },
      security: [{ bearerAuth: [] }],
    },
 
    apis: [path.join(__dirname, "../routes/*.js")],
  };

  const swaggerSpec = swaggerJsDoc(options);

  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
};
