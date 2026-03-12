-- =========================================================================
-- SIGAM BACKEND - DATOS DE PRUEBA (CORREGIDO)
-- =========================================================================

BEGIN;

-- 0. LIMPIEZA PREVIA
TRUNCATE TABLE
    ALERTAS, CONSUMO_REPUESTOS, ORDENES_MANTENIMIENTO, CATALOGO_PRECIOS_PROVEEDORES,
    ASIGNACION_LICENCIAS, BAJAS_ACTIVOS, HISTORIAL_ACTIVOS, TICKETS, LICENCIAS,
    ACTIVOS, REPUESTOS, SOFTWARE, PROVEEDORES, CATEGORIAS, UBICACIONES, USUARIOS
RESTART IDENTITY CASCADE;

-- 1. DATOS DE CATÁLOGO
INSERT INTO USUARIOS (nombre, email, password_hash, rol) VALUES
('Ana Gómez', 'ana.gomez@empresa.com', '$2b$10$xwmpRHSr7knFZEd1Ri95feru36Eql1hPBJqsuP3luPowLiZ6Tx40S', 'Analista'),
('Luis Pérez', 'luis.perez@empresa.com', '$2b$10$xwmpRHSr7knFZEd1Ri95feru36Eql1hPBJqsuP3luPowLiZ6Tx40S', 'Técnico'),
('Carlos Ruiz', 'carlos.ruiz@empresa.com', '$2b$10$xwmpRHSr7knFZEd1Ri95feru36Eql1hPBJqsuP3luPowLiZ6Tx40S', 'Gerente'),
('Marta Díaz', 'marta.diaz@empresa.com', '$2b$10$xwmpRHSr7knFZEd1Ri95feru36Eql1hPBJqsuP3luPowLiZ6Tx40S', 'Técnico'),
('Jorge Vega', 'jorge.vega@empresa.com', '$2b$10$xwmpRHSr7knFZEd1Ri95feru36Eql1hPBJqsuP3luPowLiZ6Tx40S', 'Técnico'),
('Elena Mora', 'elena.mora@empresa.com', '$2b$10$xwmpRHSr7knFZEd1Ri95feru36Eql1hPBJqsuP3luPowLiZ6Tx40S', 'Usuario'),
('Pedro Gil', 'pedro.gil@empresa.com', '$2b$10$xwmpRHSr7knFZEd1Ri95feru36Eql1hPBJqsuP3luPowLiZ6Tx40S', 'Usuario'),
('Lucía Paz', 'lucia.paz@empresa.com', '$2b$10$xwmpRHSr7knFZEd1Ri95feru36Eql1hPBJqsuP3luPowLiZ6Tx40S', 'Usuario'),
('Raúl Ríos', 'raul.rios@empresa.com', '$2b$10$xwmpRHSr7knFZEd1Ri95feru36Eql1hPBJqsuP3luPowLiZ6Tx40S', 'Usuario'),
('Sara Luna', 'sara.luna@empresa.com', '$2b$10$xwmpRHSr7knFZEd1Ri95feru36Eql1hPBJqsuP3luPowLiZ6Tx40S', 'Usuario'),
('David Sol', 'david.sol@empresa.com', '$2b$10$xwmpRHSr7knFZEd1Ri95feru36Eql1hPBJqsuP3luPowLiZ6Tx40S', 'Usuario'),
('Alba Roa', 'alba.roa@empresa.com', '$2b$10$xwmpRHSr7knFZEd1Ri95feru36Eql1hPBJqsuP3luPowLiZ6Tx40S', 'Usuario'),
('Hugo Rey', 'hugo.rey@empresa.com', '$2b$10$xwmpRHSr7knFZEd1Ri95feru36Eql1hPBJqsuP3luPowLiZ6Tx40S', 'Usuario'),
('Inés Cid', 'ines.cid@empresa.com', '$2b$10$xwmpRHSr7knFZEd1Ri95feru36Eql1hPBJqsuP3luPowLiZ6Tx40S', 'Usuario'),
('Omar Leo', 'omar.leo@empresa.com', '$2b$10$xwmpRHSr7knFZEd1Ri95feru36Eql1hPBJqsuP3luPowLiZ6Tx40S', 'Usuario'),
('Ariel Audit', 'ariel.audit@empresa.com', '$2b$10$xwmpRHSr7knFZEd1Ri95feru36Eql1hPBJqsuP3luPowLiZ6Tx40S', 'Auditor');

INSERT INTO CATEGORIAS (nombre_categoria) VALUES
('Laptop'), ('Desktop'), ('Servidor'), ('Monitor'), ('Impresora'),
('Router'), ('Switch'), ('UPS'), ('Teléfono IP'), ('Tablet');

INSERT INTO UBICACIONES (sede, piso, sala) VALUES
('Norte', 'Piso 1', 'Recepción'), ('Norte', 'Piso 2', 'Desarrollo'), ('Norte', 'Piso 2', 'Gerencia'),
('Sur', 'Piso 1', 'Ventas'), ('Sur', 'Piso 1', 'Bodega'), ('Centro', 'Piso 3', 'Data Center'),
('Centro', 'Piso 3', 'Soporte'), ('Centro', 'Piso 4', 'Marketing'), ('Este', 'Piso 1', 'Logística'),
('Este', 'Piso 2', 'Finanzas');

INSERT INTO PROVEEDORES (nombre, contacto, identificacion_legal) VALUES
('Dell Colombia', 'ventas@dell.co', 'NIT-800123456-1'), ('HP Enterprise', 'soporte@hp.co', 'NIT-800654321-2'),
('Lenovo', 'b2b@lenovo.co', 'NIT-900111222-3'), ('Cisco Systems', 'redes@cisco.co', 'NIT-900333444-4'),
('Microsoft Partner', 'licencias@mspartner.co', 'NIT-900555666-5');

INSERT INTO SOFTWARE (nombre, fabricante) VALUES
('Windows 11 Pro', 'Microsoft'), ('Office 365', 'Microsoft'), ('Creative Cloud', 'Adobe'),
('AutoCAD 2024', 'Autodesk'), ('Antivirus Endpoint', 'Kaspersky');

INSERT INTO REPUESTOS (nombre, stock, stock_minimo) VALUES
('Memoria RAM 16GB DDR4', 50, 10), ('Disco SSD 512GB', 30, 5), ('Batería Laptop Dell', 15, 5),
('Fuente de Poder 650W', 10, 3), ('Cable de Red Cat 6 (Caja)', 5, 2), ('Monitor 24 Pulgadas', 8, 2),
('Teclado Inalámbrico', 25, 5), ('Mouse Óptico', 40, 10), ('Tóner Impresora Negro', 20, 5),
('Pasta Térmica', 15, 3);

-- 2. GENERACIÓN MASIVA
INSERT INTO ACTIVOS (serial, modelo, fecha_compra, vida_util, nivel_criticidad, especificaciones_electricas, id_ubicacion, id_categoria, id_proveedor, costo_compra)
SELECT
    'SN-' || LPAD(i::text, 6, '0'),
    'Modelo Genérico ' || floor(random() * 10 + 1)::int,
    CURRENT_DATE - (floor(random() * 1000)::int),
    48,
    CASE WHEN random() > 0.8 THEN 'Alta' WHEN random() > 0.4 THEN 'Media' ELSE 'Baja' END,
    CASE WHEN random() > 0.5 THEN '120V - 15A' ELSE '240V - 20A' END,
    floor(random() * 10 + 1)::int,
    floor(random() * 10 + 1)::int,
    floor(random() * 5 + 1)::int,
    floor(random() * 5000000 + 800000)::numeric
FROM generate_series(1, 40) s(i);

INSERT INTO TICKETS (id_activo, id_usuario_reporta, descripcion, prioridad_ia, clasificacion_nlp, estado, fecha_creacion)
SELECT
    floor(random() * 40 + 1)::int,
    floor(random() * 10 + 6)::int,
    'Falla reportada generada automáticamente para pruebas de carga. Detalles del incidente #' || i,
    CASE WHEN random() > 0.7 THEN 'Crítica' WHEN random() > 0.4 THEN 'Alta' ELSE 'Media' END,
    CASE WHEN random() > 0.6 THEN 'Hardware' WHEN random() > 0.3 THEN 'Software' ELSE 'Red' END,
    CASE WHEN random() > 0.5 THEN 'Abierto' ELSE 'Resuelto' END,
    CURRENT_TIMESTAMP - (random() * interval '30 days')
FROM generate_series(1, 30) s(i);

INSERT INTO HISTORIAL_ACTIVOS (id_activo, tipo_evento, detalle, fecha_evento)
SELECT
    floor(random() * 40 + 1)::int,
    CASE WHEN random() > 0.5 THEN 'Mantenimiento Preventivo' ELSE 'Actualización de Software' END,
    'Registro de auditoría generado automáticamente para el evento ' || i,
    CURRENT_TIMESTAMP - (random() * interval '60 days')
FROM generate_series(1, 40) s(i);

INSERT INTO LICENCIAS (id_software, clave_producto, fecha_expiracion, asientos_totales)
SELECT
    floor(random() * 5 + 1)::int,
    substring(md5(random()::text) from 1 for 16),
    CURRENT_DATE + (floor(random() * 700)::int),
    floor(random() * 50 + 10)::int
FROM generate_series(1, 20) s(i);

WITH base AS (
    SELECT l.id_licencia, random() AS r
    FROM LICENCIAS l
    ORDER BY random()
    LIMIT 30
)
INSERT INTO ASIGNACION_LICENCIAS (id_licencia, id_usuario, id_activo)
SELECT
    b.id_licencia,
    CASE WHEN b.r > 0.5 THEN (SELECT id_usuario FROM USUARIOS ORDER BY random() LIMIT 1) ELSE NULL END,
    CASE WHEN b.r <= 0.5 THEN (SELECT id_activo FROM ACTIVOS ORDER BY random() LIMIT 1) ELSE NULL END
FROM base b;

INSERT INTO CATALOGO_PRECIOS_PROVEEDORES (id_proveedor, id_repuesto, precio)
SELECT
    floor(random() * 5 + 1)::int,
    floor(random() * 10 + 1)::int,
    (floor(random() * 500000 + 50000))::numeric
FROM generate_series(1, 30) s(i)
ON CONFLICT (id_proveedor, id_repuesto) DO NOTHING;

INSERT INTO ORDENES_MANTENIMIENTO (
    id_ticket,
    id_usuario_tecnico,
    diagnostico,
    fecha_inicio,
    fecha_fin,
    checklist_seguridad
)
SELECT
    i,
    floor(random() * 3 + 2)::int,
    'Diagnóstico técnico y reparación completada.',
    fecha_inicio,
    fecha_inicio + (random() * interval '5 days'),
    TRUE
FROM (
    SELECT
        i,
        CURRENT_TIMESTAMP - (random() * interval '10 days') AS fecha_inicio
    FROM generate_series(1,20) s(i)
) t;

INSERT INTO CONSUMO_REPUESTOS (id_orden, id_repuesto, cantidad_usada)
SELECT
    floor(random() * 20 + 1)::int,
    floor(random() * 10 + 1)::int,
    floor(random() * 3 + 1)::int
FROM generate_series(1, 30) s(i);

COMMIT;
