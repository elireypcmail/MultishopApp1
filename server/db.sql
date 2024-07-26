DROP DATABASE IF EXISTS multishop;
CREATE DATABASE IF NOT EXISTS multishop;
USE multishop;

DROP TABLE IF EXISTS cliente;
DO $$
BEGIN
  CREATE TYPE estado_financiero AS ENUM ('Activo', 'Inactivo');
EXCEPTION
  WHEN duplicate_object THEN null;
END$$;

CREATE TABLE cliente(
  id serial PRIMARY KEY,
  identificacion VARCHAR(15) UNIQUE NOT NULL,
  nombre TEXT NOT NULL,
  telefono VARCHAR(100) NOT NULL,
  est_financiero estado_financiero DEFAULT 'Activo'::estado_financiero,
  intento INT DEFAULT 0,
  instancia TEXT,
  suscripcion INT DEFAULT 30,
  createUser TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

DROP TABLE IF EXISTS instancia;
CREATE TABLE instancia (
  id serial PRIMARY KEY,
  id_cliente INT REFERENCES cliente(id),
  nombre_cliente TEXT,
  est_financiero estado_financiero DEFAULT 'Activo'::estado_financiero,
  instance TEXT UNIQUE NOT NULL
);

DROP TABLE IF EXISTS dispositivo;
CREATE TABLE dispositivo(
  id serial PRIMARY KEY,
  id_cliente INT REFERENCES cliente(id) ON DELETE CASCADE,
  telefono VARCHAR(25),
  rol VARCHAR(50) NOT NULL CHECK (rol IN ('rol1', 'rol2', 'rol3')),
  clave VARCHAR(100) NOT NULL
);

DROP TABLE IF EXISTS verificacion_code;
CREATE TABLE vericacion_code(
  id serial PRIMARY KEY,
  userId INT REFERENCES cliente(id) ON DELETE CASCADE,
  telefono VARCHAR(25),
  code VARCHAR(25) NOT NULL
);

DROP TABLE IF EXISTS cliente_eliminado;
CREATE TABLE cliente_eliminado(
  id_delete serial PRIMARY KEY,
  id INT NOT NULL,  
  identificacion VARCHAR(15) NOT NULL,
  nombre TEXT NOT NULL,
  telefono VARCHAR(100) NOT NULL,
  est_financiero estado_financiero DEFAULT 'Activo'::estado_financiero,
  instancia TEXT,
  userDelete TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

DROP TABLE IF EXISTS suscripcion;
CREATE TABLE suscripcion(
  id serial PRIMARY KEY,
  idUser INT NOT NULL,
  token TEXT NOT NULL,
  FOREIGN KEY (idUser) REFERENCES cliente(id)
);

DROP TABLE IF EXISTS users;
CREATE TABLE users(
  id serial PRIMARY KEY,
  username TEXT NOT NULL,
  email VARCHAR(80) UNIQUE NOT NULL,
  password VARCHAR(64) NOT NULL
);

INSERT INTO users (username, email, password)  VALUES('admin','admin@gmail.com','admin');

DROP TABLE IF EXISTS notificacion;
CREATE TABLE notificacion(
  id serial PRIMARY KEY,
  id_user INT NOT NULL,
  notify_type text NOT NULL, -- tipo de notificación:
  id_dispositivo VARCHAR(250),
  fecha DATE NOT NULL DEFAULT CURRENT_DATE
);

CREATE TABLE auditoria (
  id SERIAL PRIMARY KEY,
  id_usuario INT NOT NULL,
  accion TEXT NOT NULL,
  id_dispositivo VARCHAR(250),
  additional_info JSONB,
  fecha DATE NOT NULL DEFAULT CURRENT_DATE
);

CREATE OR REPLACE FUNCTION clientes_eliminados_respaldo()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO cliente_eliminado
  (id, identificacion, nombre, telefono, est_financiero, instancia) 
  VALUES (
    OLD.id, 
    OLD.identificacion, 
    OLD.nombre, 
    OLD.telefono, 
    OLD.est_financiero, 
    OLD.instancia
  );
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER clientes_eliminados_respaldo
AFTER DELETE ON cliente
FOR EACH ROW
EXECUTE FUNCTION clientes_eliminados_respaldo();