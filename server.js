const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = 3000;

const dataDir = path.join(__dirname, "data");
const dataFile = path.join(dataDir, "inscripciones.json");

if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

if (!fs.existsSync(dataFile)) {
  fs.writeFileSync(dataFile, "[]", "utf8");
}

app.use(express.json());
app.use(express.static(__dirname));

function readInscripciones() {
  try {
    const content = fs.readFileSync(dataFile, "utf8");
    return JSON.parse(content);
  } catch (error) {
    return [];
  }
}

function saveInscripciones(inscripciones) {
  fs.writeFileSync(dataFile, JSON.stringify(inscripciones, null, 2), "utf8");
}

app.post("/api/inscripciones", (req, res) => {
  const {
    nombre,
    apellido,
    ciudad,
    dni,
    acompanantes = [],
    cantidadAcompanantes = 0,
    metodoPago = "mercado_pago",
    pagoConfirmado = false,
  } = req.body;

  if (!nombre || !apellido || !ciudad || !dni) {
    return res.status(400).json({ message: "Faltan datos obligatorios." });
  }

  if (!pagoConfirmado) {
    return res.status(400).json({
      message: "No se puede registrar la inscripcion sin confirmar el pago.",
    });
  }

  const inscripciones = readInscripciones();
  const nuevaInscripcion = {
    id: Date.now(),
    nombre,
    apellido,
    ciudad,
    dni,
    cantidadAcompanantes,
    acompanantes,
    metodoPago,
    estadoPago: "confirmado_por_usuario",
    createdAt: new Date().toISOString(),
  };

  inscripciones.push(nuevaInscripcion);
  saveInscripciones(inscripciones);

  return res.status(201).json({
    message: "Inscripcion guardada correctamente.",
    inscripcion: nuevaInscripcion,
  });
});

app.get("/api/inscripciones", (_req, res) => {
  const inscripciones = readInscripciones();
  res.json(inscripciones);
});

app.listen(PORT, () => {
  console.log(`Servidor listo en http://localhost:${PORT}`);
});
