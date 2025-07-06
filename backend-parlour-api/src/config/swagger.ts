import swaggerJsdoc from 'swagger-jsdoc';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Parlour Admin API',
      version: '1.0.0',
      description: 'API documentation for the Parlour Admin Dashboard',
    },
    servers: [
      {
        url: 'http://localhost:5000/api',
      },
    ],
    components: {
        securitySchemes: {
            bearerAuth: {
                type: 'http',
                scheme: 'bearer',
                bearerFormat: 'JWT',
            }
        }
    },
    security: [
        {
            bearerAuth: []
        }
    ]
  },
  apis: ['./src/routes/*.ts'],
};

export const swaggerSpec = swaggerJsdoc(options); 