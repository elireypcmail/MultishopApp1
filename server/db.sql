DROP DATABASE IF EXISTS multishop;
CREATE DATABASE IF NOT EXISTS multishop;
USE multishop;

CREATE TYPE estado_financiero AS ENUM ('Activo', 'Inactivo');

DROP TABLE IF EXISTS cliente;
CREATE TABLE cliente(
  id serial PRIMARY KEY,
  identificacion VARCHAR(9) UNIQUE NOT NULL,
  nombre TEXT NOT NULL,
  telefonos VARCHAR(100) NOT NULL,
  dispositivos VARCHAR(250),
  per_contacto VARCHAR(50) NOT NULL,
  est_financiero estado_financiero DEFAULT 'Activo'::estado_financiero,
  clave VARCHAR(100) NOT NULL,
  instancia VARCHAR(250),
  createUser TIMESTAMP DEFAULT CURRENT_TIMESTAMP
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

DROP TABLE IF EXISTS user;
CREATE TABLE user(
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