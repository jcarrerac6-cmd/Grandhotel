// app/config/stripe.js
const Stripe = require('stripe');
require('dotenv').config();

// Inicializar la librería de Stripe con la clave secreta del entorno
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_dummy_key');

module.exports = stripe;