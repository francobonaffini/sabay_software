
# Contexto del proyecto

Quiero desarrollar una aplicación web para la gestión integral de un emprendimiento de Pilates. El objetivo principal es reemplazar la gestión actual basada en planillas de Excel y reducir al mínimo la cantidad de mensajes que reciben los administradores por WhatsApp para modificar turnos.

Este proyecto será desarrollado de manera incremental, priorizando una arquitectura limpia, mantenible y escalable. No quiero que generes código de forma apresurada. Prefiero analizar primero el dominio del negocio, identificar correctamente las entidades, reglas y casos de uso, y recién después comenzar la implementación.

## Objetivo del sistema

Actualmente la administración del estudio se realiza mediante planillas de Excel. El mayor problema operativo es que los alumnos solicitan constantemente cambios de turno por WhatsApp, generando una gran carga administrativa.

La aplicación debe permitir que la mayor parte de esas modificaciones sean realizadas directamente por los propios alumnos, sin intervención del administrador, siempre respetando las reglas del negocio.

## Tecnologías

### Backend

* Node.js
* Express
* JavaScript (NO TypeScript)
* PostgreSQL
* Prisma ORM

### Frontend

* React
* Vite
* Tailwind CSS

## Arquitectura

Quiero implementar una Arquitectura Hexagonal utilizando Vertical Slicing.

Cada slice deberá contener sus propias capas:

* application
* domain
* infrastructure

Quiero evitar una arquitectura basada en CRUD. Los slices deben representar capacidades del negocio.

La lógica de negocio debe permanecer en el dominio y no en los controladores.

## Filosofía de desarrollo

Quiero que actúes como un arquitecto de software senior.

Antes de escribir código:

* analizá el problema;
* proponé distintas alternativas cuando existan;
* explicá ventajas y desventajas;
* justificá las decisiones de diseño;
* señalá posibles problemas futuros;
* mantené una visión de largo plazo.

No quiero soluciones rápidas si comprometen la arquitectura.

Cuando exista una decisión importante, preferí discutirla antes de implementarla.

## Problema de negocio

El estudio ofrece clases de Pilates.

Características actuales:

* Existen 7 clases por día.
* Cada clase posee capacidad para 5 alumnos (5 camillas).
* Los alumnos adquieren un plan mensual de:

  * 4 clases
  * 8 clases
  * 12 clases

El pago de la cuota se realiza entre los días 1 y 10 de cada mes.

La aplicación no procesará pagos online.

El administrador simplemente registrará si el alumno pagó o no.

Luego del día 10 el sistema deberá mostrar alertas de alumnos con pagos pendientes.

## Usuarios del sistema

### Administrador

Puede:

* administrar alumnos;
* administrar profesores;
* administrar horarios;
* administrar planes;
* administrar reservas;
* mover alumnos entre clases;
* registrar pagos;
* visualizar estadísticas;
* consultar ocupación de clases.

### Profesor

Puede:

* visualizar únicamente las clases asignadas;
* consultar la lista de alumnos de cada clase;
* registrar asistencia (en una etapa futura).

No administra horarios ni pagos.

### Alumno

Debe disponer de un portal propio.

Puede:

* visualizar sus clases;
* cambiar una reserva por otra disponible;
* cancelar una clase;
* recuperar clases (cuando las reglas del negocio lo permitan);
* consultar el estado de su plan;
* consultar el estado de su cuota.

El objetivo principal es que el alumno pueda autogestionar sus cambios de turno sin necesidad de enviar mensajes por WhatsApp.

## Reglas importantes

No todas las reglas del negocio están definidas todavía.

A medida que avancemos iremos refinando el dominio.

Cuando detectes que una regla de negocio no está suficientemente definida, no asumas un comportamiento automáticamente.

Primero proponé alternativas y esperá una decisión.

## Forma de trabajo

Quiero construir el proyecto paso a paso.

No avances varios módulos simultáneamente.

En cada etapa quiero:

1. analizar el problema;
2. diseñar el modelo de dominio;
3. definir entidades y casos de uso;
4. revisar la arquitectura;
5. recién después escribir código.

Si en algún momento detectás que una decisión rompe los principios de Arquitectura Hexagonal o Vertical Slicing, quiero que lo indiques y propongas una alternativa mejor.

La prioridad del proyecto es mantener una arquitectura limpia y escalable, incluso si eso implica escribir un poco más de código.


Reglas para completar el codigo:

- Utilizar funciones antes que clases, salvo que exista una justificación clara para usar programación orientada a objetos.
- Escribir código modular y desacoplado.
- Evitar lógica de negocio en controladores, routers o middleware.
- Explicar cada decisión importante antes de implementarla.
- Mantener consistencia con Arquitectura Hexagonal y Vertical Slicing.
- Cada Modulo corresponde a un slice vertical
- No generar archivos innecesarios ni sobreingeniería.
- Preferir soluciones simples, legibles y fáciles de mantener.
- Siempre justificar la creación de nuevas entidades, servicios o puertos cuando formen parte del dominio.

Evitar:

- Sobreingeniería.
- Patrones heredados de Java/C# que no aporten valor en JavaScript.
- Clases cuando una función sea suficiente.
- Archivos que sólo contengan una exportación vacía.
- Interfaces o puertos sin implementación real.
- Capas que únicamente deleguen llamadas sin agregar comportamiento.
- Crear más archivos de los necesarios para resolver un problema simple.