
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Swagger setup
const swaggerUi = require('swagger-ui-express');
const swaggerJSDoc = require('swagger-jsdoc');

const swaggerDefinition = {
	openapi: '3.0.0',
	info: {
		title: 'Control Flujo Logístico API',
		version: '1.0.0',
		description: 'Documentación de la API para Control de Flujo Logístico',
	},
	servers: [
		{
			url: 'http://localhost:3000',
			description: 'Servidor local'
		}
	],
};

const options = {
	swaggerDefinition,
	apis: [__dirname + '/src/routes/*.js'], // Documenta rutas en estos archivos
};

const swaggerSpec = swaggerJSDoc(options);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Middlewares
app.use(cors());
app.use(express.json());

// Rutas base (puedes importar tus rutas reales después)
app.get('/', (req, res) => {
	res.send('API Control Flujo Logístico funcionando');
});

// Importar rutas
const authRoutes = require('./src/routes/auth');
const usuariosRoutes = require('./src/routes/usuarios');
const pedidosRoutes = require('./src/routes/pedidos');

// Usar rutas con prefijo
app.use('/api/auth', authRoutes);
app.use('/api/usuarios', usuariosRoutes);
app.use('/api/pedidos', pedidosRoutes);

// Iniciar servidor
app.listen(PORT, () => {
	console.log(`Servidor corriendo en puerto ${PORT}`);
});
