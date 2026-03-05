-- =========================================================================
-- SIGAM BACKEND - ESQUEMA PRINCIPAL
-- PostgreSQL
-- =========================================================================

BEGIN;

-- =========================================================================
-- FASE 1: TABLAS MAESTRAS E INDEPENDIENTES
-- =========================================================================

CREATE TABLE IF NOT EXISTS USUARIOS (
    id_usuario SERIAL PRIMARY KEY,
    nombre VARCHAR(150) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    rol VARCHAR(50) NOT NULL,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS UBICACIONES (
    id_ubicacion SERIAL PRIMARY KEY,
    sede VARCHAR(100) NOT NULL,
    piso VARCHAR(50),
    sala VARCHAR(100)
);

CREATE TABLE IF NOT EXISTS CATEGORIAS (
    id_categoria SERIAL PRIMARY KEY,
    nombre_categoria VARCHAR(100) NOT NULL
);

CREATE TABLE IF NOT EXISTS PROVEEDORES (
    id_proveedor SERIAL PRIMARY KEY,
    nombre VARCHAR(150) NOT NULL,
    contacto VARCHAR(150),
    identificacion_legal VARCHAR(50) UNIQUE NOT NULL
);

CREATE TABLE IF NOT EXISTS SOFTWARE (
    id_software SERIAL PRIMARY KEY,
    nombre VARCHAR(150) NOT NULL,
    fabricante VARCHAR(100)
);

CREATE TABLE IF NOT EXISTS REPUESTOS (
    id_repuesto SERIAL PRIMARY KEY,
    nombre VARCHAR(150) NOT NULL,
    stock INT DEFAULT 0,
    stock_minimo INT DEFAULT 5,
    CONSTRAINT chk_repuestos_stock_non_negative CHECK (stock >= 0),
    CONSTRAINT chk_repuestos_stock_min_non_negative CHECK (stock_minimo >= 0)
);

-- =========================================================================
-- FASE 2: TABLAS NÚCLEO
-- =========================================================================

CREATE TABLE IF NOT EXISTS ACTIVOS (
    id_activo SERIAL PRIMARY KEY,
    serial VARCHAR(100) UNIQUE NOT NULL,
    modelo VARCHAR(150),
    fecha_compra DATE NOT NULL,
    vida_util INT NOT NULL,
    nivel_criticidad VARCHAR(50) DEFAULT 'Media',
    especificaciones_electricas VARCHAR(255),
    id_ubicacion INT REFERENCES UBICACIONES(id_ubicacion),
    id_categoria INT REFERENCES CATEGORIAS(id_categoria),
    id_proveedor INT REFERENCES PROVEEDORES(id_proveedor),
    CONSTRAINT chk_activos_vida_util CHECK (vida_util > 0)
);

CREATE TABLE IF NOT EXISTS LICENCIAS (
    id_licencia SERIAL PRIMARY KEY,
    id_software INT REFERENCES SOFTWARE(id_software),
    clave_producto VARCHAR(255) NOT NULL,
    fecha_expiracion DATE,
    asientos_totales INT DEFAULT 1,
    CONSTRAINT chk_licencias_asientos CHECK (asientos_totales > 0)
);

CREATE TABLE IF NOT EXISTS TICKETS (
    id_ticket SERIAL PRIMARY KEY,
    id_activo INT REFERENCES ACTIVOS(id_activo),
    id_usuario_reporta INT REFERENCES USUARIOS(id_usuario),
    descripcion TEXT NOT NULL,
    prioridad_ia VARCHAR(50),
    clasificacion_nlp VARCHAR(100),
    estado VARCHAR(50) DEFAULT 'Abierto',
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =========================================================================
-- FASE 3: TABLAS DE TRAZABILIDAD, MANTENIMIENTO Y RELACIONES
-- =========================================================================

CREATE TABLE IF NOT EXISTS HISTORIAL_ACTIVOS (
    id_historial SERIAL PRIMARY KEY,
    id_activo INT REFERENCES ACTIVOS(id_activo),
    fecha_evento TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    tipo_evento VARCHAR(100) NOT NULL,
    detalle TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS BAJAS_ACTIVOS (
    id_baja SERIAL PRIMARY KEY,
    id_activo INT UNIQUE REFERENCES ACTIVOS(id_activo),
    fecha_baja DATE NOT NULL,
    motivo TEXT NOT NULL,
    borrado_seguro VARCHAR(255) NOT NULL
);

CREATE TABLE IF NOT EXISTS ASIGNACION_LICENCIAS (
    id_asignacion SERIAL PRIMARY KEY,
    id_licencia INT REFERENCES LICENCIAS(id_licencia),
    id_usuario INT REFERENCES USUARIOS(id_usuario),
    id_activo INT REFERENCES ACTIVOS(id_activo),
    fecha_asignacion DATE DEFAULT CURRENT_DATE
);

CREATE TABLE IF NOT EXISTS CATALOGO_PRECIOS_PROVEEDORES (
    id_catalogo SERIAL PRIMARY KEY,
    id_proveedor INT REFERENCES PROVEEDORES(id_proveedor),
    id_repuesto INT REFERENCES REPUESTOS(id_repuesto),
    precio DECIMAL(10,2) NOT NULL,
    moneda VARCHAR(10) DEFAULT 'COP',
    UNIQUE (id_proveedor, id_repuesto),
    CONSTRAINT chk_catalogo_precio_positive CHECK (precio > 0)
);

CREATE TABLE IF NOT EXISTS ORDENES_MANTENIMIENTO (
    id_orden SERIAL PRIMARY KEY,
    id_ticket INT UNIQUE REFERENCES TICKETS(id_ticket),
    id_usuario_tecnico INT REFERENCES USUARIOS(id_usuario),
    diagnostico TEXT,
    fecha_inicio TIMESTAMP,
    fecha_fin TIMESTAMP,
    checklist_seguridad BOOLEAN DEFAULT FALSE,
    CONSTRAINT chk_ordenes_fechas CHECK (fecha_fin IS NULL OR fecha_inicio IS NULL OR fecha_fin >= fecha_inicio)
);

CREATE TABLE IF NOT EXISTS CONSUMO_REPUESTOS (
    id_consumo SERIAL PRIMARY KEY,
    id_orden INT REFERENCES ORDENES_MANTENIMIENTO(id_orden),
    id_repuesto INT REFERENCES REPUESTOS(id_repuesto),
    cantidad_usada INT NOT NULL,
    CONSTRAINT chk_consumo_cantidad_positive CHECK (cantidad_usada > 0)
);

CREATE TABLE IF NOT EXISTS ALERTAS (
    id_alerta SERIAL PRIMARY KEY,
    tipo VARCHAR(100) NOT NULL,
    id_activo INT REFERENCES ACTIVOS(id_activo),
    id_repuesto INT REFERENCES REPUESTOS(id_repuesto),
    estado VARCHAR(50) DEFAULT 'Pendiente',
    fecha_generacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

COMMIT;
