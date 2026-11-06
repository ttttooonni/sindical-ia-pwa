# Migración: fichas de ponencias (2026-11-06)

Cambio incremental. No se ha sustituido la aplicación ni el diseño, y no se ha borrado contenido histórico.

## Copia de seguridad

- Etiqueta git local: `backup-pre-ampliacion-2026-11-06` (commit `0ea6ec8`).
- Copia: `/workspace/sindical-ia-pwa-audit/backup/sindical-ia-pwa-pre-ampliacion-2026-11-06.tar.gz`
- Instantánea de `data.json` y recuentos en `/workspace/sindical-ia-pwa-audit/backup/`.

## Datos

Se añade una clave nueva de primer nivel, `FICHAS`, indexada por el `id` de sesión (`a1`, `a2`, `a3`, `b1`, `b2`, `b3`, `b5`, `c1`, `c2`, `c3`, `c4`).

No se modifican `OBJETIVOS`, `SESIONES`, `PONENTES`, `ANALISIS` ni `GALERIA`.

No se crean fichas para `b4` (catering) ni `b6` (coloquio abierto): no son ponencias con panel propio.

Cada ficha declara doce apartados de contenido (contexto, resumen, temas, investigación, legislación, datos, análisis, empresas, casos, propuestas, conclusiones, fuentes) más título, fecha, horario, ponentes y fotografía: los dieciséis bloques pedidos.

Las capas `expuesto`, `investiga` y `sindical` distinguen lo tomado del programa o de las diapositivas visibles, la investigación posterior y el análisis sindical. No se atribuyen citas de sala sin acta.

## Interfaz

Ruta nueva `#ficha/{id}` (también se acepta `#ficha-{id}`). Se accede desde la agenda («Abrir ficha de la ponencia»), desde la galería y con navegación anterior/siguiente. La pestaña activa sigue siendo Agenda. «Mi agenda» (favoritos en localStorage) se mantiene.

## Pendiente

Las dos fotografías en directo de la mesa «Europa frente a la IA» (6 nov, 09:30) no persistieron en el entorno de publicación y no se han inventado. Quedan pendientes de un nuevo envío.
