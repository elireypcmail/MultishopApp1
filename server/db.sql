DROP DATABASE IF EXISTS multishop;
CREATE DATABASE IF NOT EXISTS multishop;
USE multishop;

CREATE TYPE estado_financiero AS ENUM ('Activo', 'Inactivo');

DROP TABLE IF EXISTS usuario;
CREATE TABLE usuario(
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

DROP TABLE IF EXISTS usuario_eliminado;
CREATE TABLE usuario_eliminado(
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
  FOREIGN KEY (idUser) REFERENCES usuario(id)
);

CREATE OR REPLACE FUNCTION usuarios_eliminados_respaldo()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO usuario_eliminado
  (id, identificacion, nombre, telefonos, dispositivos, per_contacto, est_financiero, clave, instancia) 
  VALUES (OLD.id, OLD.identificacion, OLD.nombre, OLD.telefonos, OLD.dispositivos, OLD.per_contacto, OLD.est_financiero, OLD.clave, OLD.instancia);
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER usuarios_eliminados_respaldo
AFTER DELETE ON usuario
FOR EACH ROW
EXECUTE FUNCTION usuarios_eliminados_respaldo();