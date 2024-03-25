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
  identificacion VARCHAR(9) UNIQUE NOT NULL,
  nombre TEXT NOT NULL,
  telefono VARCHAR(100) NOT NULL,
  per_contacto VARCHAR(50) NOT NULL,
  est_financiero estado_financiero DEFAULT 'Activo'::estado_financiero,
  clave VARCHAR(100) NOT NULL,
  instancia VARCHAR(250),
  createUser TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE cliente
DROP COLUMN est_financiero;

ALTER TABLE cliente
ADD COLUMN est_financiero BOOLEAN DEFAULT TRUE;


DROP TABLE IF EXISTS dispositivo;
CREATE TABLE dispositivo(
  id serial PRIMARY KEY,
  id_cliente INT REFERENCES cliente(id) ON DELETE CASCADE,
  telefono VARCHAR(25),
  mac VARCHAR(255) UNIQUE NOT NULL,
  rol VARCHAR(50) NOT NULL CHECK (rol IN ('rol1', 'rol2', 'rol3')),
  clave VARCHAR(100) NOT NULL
);

DROP TABLE IF EXISTS cliente_eliminado;
CREATE TABLE cliente_eliminado(
  id_delete serial PRIMARY KEY,
  id INT NOT NULL,  
  identificacion VARCHAR(9) UNIQUE NOT NULL,
  nombre TEXT NOT NULL,
  telefonos VARCHAR(100) NOT NULL,
  dispositivos VARCHAR(250),
  per_contacto VARCHAR(50) NOT NULL,
  est_financiero estado_financiero DEFAULT 'Activo'::estado_financiero,
  clave VARCHAR(100) NOT NULL,
  instancia VARCHAR(250),
  userDelete TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

DROP TABLE IF EXISTS suscripcion;
CREATE TABLE suscripcion(
  id serial PRIMARY KEY,
  idUser INT NOT NULL,
  token VARCHAR(255) NOT NULL,
  FOREIGN KEY (idUser) REFERENCES cliente(id)
);

DROP TABLE IF EXISTS users;
CREATE TABLE users(
  id serial PRIMARY KEY,
  username TEXT NOT NULL,
  email VARCHAR(80) UNIQUE NOT NULL,
  password VARCHAR(64) NOT NULL
);

CREATE OR REPLACE FUNCTION clientes_eliminados_respaldo()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO cliente_eliminado
  (id, identificacion, nombre, telefonos, dispositivos, per_contacto, est_financiero, clave, instancia) 
  VALUES (OLD.id, OLD.identificacion, OLD.nombre, OLD.telefonos, OLD.dispositivos, OLD.per_contacto, OLD.est_financiero, OLD.clave, OLD.instancia);
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER clientes_eliminados_respaldo
AFTER DELETE ON cliente
FOR EACH ROW
EXECUTE FUNCTION clientes_eliminados_respaldo();