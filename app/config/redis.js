// app/config/redis.js
const Redis = require('ioredis');
require('dotenv').config();

const redis = new Redis(process.env.REDIS_URL, {
    keepAlive: 10000, // Mantiene la conexión viva enviando impulsos cada 10 segundos
    maxRetriesPerRequest: null
});

redis.on('connect', () => {
    console.log('⚡ Conectado exitosamente a Redis Cloud');
});

// Capturar el evento de error de forma limpia
redis.on('error', (err) => {
    if (err.code === 'ECONNRESET') {
        // Ignorar o mostrar un aviso simple en vez del error gigante
        console.log('🔄 Reconectando sesión de Redis Cloud por inactividad...');
    } else {
        console.error('❌ Error en Redis:', err.message);
    }
});

module.exports = redis;