# Asistente IA de Inmigración Familiar — Instrucciones y Cuestionario

Proyecto de InnovationTECH: asistente de admisión y análisis preliminar de casos migratorios para un despacho de abogados.

## Archivos

| Archivo | Contenido |
| --- | --- |
| `public/` | La página web: chat, aviso legal, temas y resumen para el abogado (`index.html`, `styles.css`, `app.js`) |
| `api/chat.js` | Servidor que recibe la conversación y consulta a Claude con las instrucciones de `system_prompt.txt` |
| `api/config.js` | Entrega a la página el nombre y los datos de contacto del despacho |
| `system_prompt.txt` | Instrucciones de sistema de la IA (rol, tono y límites éticos) |
| `scripts/dev.mjs` | Servidor local para probar la página en su computadora |
| `.env.example` | Lista de variables que debe configurar en Vercel |

## Qué hace la página

1. El usuario lee el aviso legal y marca la casilla de aceptación.
2. Elige un tema: residencia por familia, ciudadanía, Seguro Social u otra pregunta.
3. Conversa con el asistente, que hace las preguntas del cuestionario un bloque a la vez.
4. Al final presiona **Resumen para el abogado** y lo copia, lo descarga o lo envía por correo o WhatsApp al despacho.

Además:

- Funciona en español (por defecto) y en inglés, en celular y computadora, con modo claro y oscuro.
- Oculta automáticamente números que parecen de Seguro Social o A-Number, en la página y en el servidor.
- No guarda conversaciones: se borran al cerrar la página.
- Muestra siempre el teléfono del despacho para casos urgentes (detención o audiencia próxima).
- La clave de la API nunca llega al navegador; solo vive en el servidor.

## Cómo publicarla en Vercel

1. **Consiga la clave de la API.** Entre a [console.anthropic.com](https://console.anthropic.com), cree una cuenta, agregue un método de pago y cree una clave en *API Keys*. Cópiela; empieza con `sk-ant-`.
2. **Importe el repositorio.** En [vercel.com](https://vercel.com) elija *Add New → Project*, seleccione `innovationtech1/lawyerIA` y presione *Import*. No cambie el *Framework Preset* (debe decir *Other*).
3. **Agregue las variables.** Antes de *Deploy*, abra *Environment Variables* y agregue:

   | Variable | Ejemplo | ¿Obligatoria? |
   | --- | --- | --- |
   | `ANTHROPIC_API_KEY` | `sk-ant-...` | Sí |
   | `FIRM_NAME` | Despacho Martínez & Asociados | Sí |
   | `ATTORNEY_NAME` | Lic. Ana Martínez | Recomendada |
   | `FIRM_PHONE` | +1 (210) 555-0100 | Recomendada |
   | `FIRM_WHATSAPP` | 12105550100 (solo números, con código de país) | Opcional |
   | `FIRM_EMAIL` | contacto@despacho.com | Recomendada |
   | `ANTHROPIC_MODEL` | claude-sonnet-5-5 | Opcional |

4. **Publique.** Presione *Deploy*. Cuando termine, abra el enlace y haga una conversación de prueba.
5. **Si cambia una variable después**, vaya a *Deployments*, abra el último y elija *Redeploy* para que tome el cambio.

Cada vez que suba cambios a la rama `main` en GitHub, Vercel publica la nueva versión automáticamente.

## Probar en su computadora (opcional)

Necesita [Node.js](https://nodejs.org) 20 o más reciente.

- **Modo demostración (sin clave y sin costo):** `npm run demo` y abra http://localhost:3000
- **Con la IA real:** copie `.env.example` como `.env`, ponga su clave y ejecute `npm run dev`

## Antes de abrirla al público

- [ ] El abogado revisa y aprueba `system_prompt.txt` y el aviso legal
- [ ] Probar 5 a 10 casos ficticios y que el abogado valide las respuestas
- [ ] Poner un límite de gasto mensual en console.anthropic.com (*Settings → Limits*)
- [ ] Agregar una política de privacidad del despacho
- [ ] Conectar un dominio propio en Vercel (*Settings → Domains*)

## Propósito y alcance

El asistente apoya al despacho del abogado en la evaluación inicial de casos de familias estadounidenses y mexicanas. Cubre tres áreas: residencia permanente por petición familiar, ciudadanía (naturalización, o adquirida/derivada por los padres) y número de Seguro Social.

- Realiza la entrevista de admisión con preguntas estructuradas.
- Analiza la elegibilidad preliminar según el estatus del peticionario (ciudadano o residente) y del beneficiario.
- Explica los formularios que aplican, como el I-130, y la ruta probable: ajuste de estatus dentro de EE. UU. o proceso consular.
- Entrega un informe para que el abogado lo revise.

No sustituye al abogado: no emite opiniones legales definitivas ni presenta trámites. La asesoría y la decisión final corresponden al abogado con licencia.

## Cuestionario de admisión

La IA hace estas preguntas en orden, un bloque a la vez, y omite los bloques que no apliquen al objetivo del usuario.

1. **Objetivo del caso**
   - ¿Qué busca: residencia, ciudadanía, número de Seguro Social o varias?
   - ¿Para quién es el trámite y quién lo pide?
2. **Peticionario**
   - ¿Es ciudadano estadounidense o residente permanente?
   - Si es ciudadano: ¿por nacimiento en EE. UU., por naturalización o por sus padres?
   - Si es residente: ¿desde qué fecha?
   - ¿Qué edad tiene y vive en EE. UU.?
   - ¿Cuáles son sus ingresos anuales y cuántas personas dependen de él? ¿Tiene un posible co-patrocinador?
3. **Beneficiario y relación**
   - ¿Cuál es la relación exacta: cónyuge, hijo, padre o hermano?
   - Fecha de nacimiento, país de nacimiento y estado civil del beneficiario.
   - Si es cónyuge: fecha del matrimonio y si los matrimonios anteriores de ambos terminaron legalmente.
   - Si es hijastro o adoptado: edad del menor cuando ocurrió el matrimonio o la adopción.
   - ¿Dónde vive hoy el beneficiario?
4. **Historial migratorio del beneficiario**
   - ¿Cómo entró a EE. UU.: con visa, con parole o sin inspección? Fechas de cada entrada y salida.
   - ¿Cuál es su estatus actual y cuándo vence?
   - ¿Ha tenido peticiones anteriores, asilo, DACA o TPS?
   - ¿Alguien presentó una petición o certificación laboral a su favor antes del 30 de abril de 2001?
   - ¿Ha tenido órdenes de deportación, salidas voluntarias o detenciones en la frontera?
5. **Presencia ilegal y salidas**
   - ¿Cuánto tiempo ha estado sin estatus legal después de cumplir 18 años?
   - ¿Salió de EE. UU. después de más de 180 días sin estatus?
   - ¿Volvió a entrar sin inspección después de más de un año sin estatus o después de una deportación?
6. **Antecedentes**
   - ¿Ha sido arrestado, citado o condenado, aunque el caso se haya cerrado o borrado?
   - ¿Ha dicho ser ciudadano estadounidense sin serlo, o ha votado en EE. UU.?
   - ¿Ha usado documentos falsos o trabajado sin autorización?
7. **Ciudadanía por naturalización (N-400)**
   - ¿Desde cuándo es residente? ¿Lleva 3 años casado y viviendo con un ciudadano?
   - ¿Ha hecho viajes fuera de EE. UU. de más de 6 meses?
   - ¿Se registró en el Servicio Selectivo (hombres de 18 a 26 años)?
   - ¿Ha presentado sus impuestos y cumplido con la manutención de hijos?
   - ¿Tiene servicio militar? ¿Podría necesitar una exención del examen de inglés o civismo?
8. **Ciudadanía por los padres (N-600)**
   - ¿Alguno de sus padres era ciudadano cuando nació? ¿Cuánto tiempo vivió ese padre en EE. UU. antes del nacimiento?
   - ¿Fue residente siendo menor de 18 años, bajo la custodia de un padre ciudadano?
9. **Seguro Social**
   - ¿Ya tiene número? ¿Cuál es su estatus actual?
   - ¿Tiene permiso de trabajo (EAD) o lo solicitó?
   - ¿Pidió la tarjeta dentro de su trámite migratorio (I-765 o DS-260)?
10. **Documentos disponibles**
    - Actas de nacimiento, matrimonio y divorcio; pasaporte; I-94; tarjeta de residente; registros de corte o policía; declaraciones de impuestos.

## Señales de alerta

Cuando aparece cualquiera de estas situaciones, la IA lo marca en el informe y recomienda no presentar ningún formulario hasta hablar con el abogado.

| Señal | Por qué importa | Acción del asistente |
| --- | --- | --- |
| Entrada sin inspección | Normalmente impide el ajuste de estatus, salvo 245(i) u otras excepciones | Evaluar proceso consular y perdón I-601A |
| Más de 180 días o 1 año sin estatus, seguido de una salida | Activa el castigo de 3 o 10 años | Calcular fechas y revisar perdón |
| Reingreso sin inspección tras más de 1 año sin estatus o tras deportación | Barra permanente | Detener y referir al abogado |
| Orden de deportación previa o caso en corte | El caso puede depender de la corte de inmigración | Referir al abogado de inmediato |
| Arresto, citación o condena | Puede causar inadmisibilidad, deportación o falta de buen carácter moral | Pedir registros certificados |
| Falso reclamo de ciudadanía o voto ilegal | Suele causar inadmisibilidad permanente | Detener y referir al abogado |
| Matrimonio anterior cuestionado por fraude | La sección 204(c) prohíbe aprobar nuevas peticiones | Referir al abogado |
| Hijo cerca de cumplir 21 años | La edad puede cambiar la categoría; aplica la ley CSPA | Calcular la edad CSPA |
| Hijo de peticionario que se casa | Cambia o elimina la categoría | Revisar categoría actual |
| Viajes largos siendo residente | Pueden romper la residencia continua para el N-400 | Sumar días fuera del país |
| Residente con antecedentes que quiere naturalizarse | El N-400 puede exponer causas de deportación | Revisión del abogado antes de presentar |

## Formularios y formato del informe

| Formulario | Para qué sirve | Quién lo presenta |
| --- | --- | --- |
| I-130 | Petición de familiar; demuestra la relación | Peticionario ciudadano o residente |
| I-130A | Información adicional del cónyuge beneficiario | Cónyuge beneficiario |
| I-485 | Ajuste de estatus a residente dentro de EE. UU. | Beneficiario |
| I-864 | Declaración jurada de patrocinio económico | Peticionario y co-patrocinador |
| I-765 | Permiso de trabajo; puede incluir solicitud de Seguro Social | Beneficiario |
| I-131 | Permiso de viaje (advance parole) | Beneficiario |
| DS-260 | Solicitud de visa de inmigrante en proceso consular | Beneficiario, ante el NVC |
| I-601A | Perdón provisional por presencia ilegal | Beneficiario |
| I-751 | Quitar condiciones de la residencia por matrimonio | Residente condicional |
| N-400 | Naturalización | Residente permanente |
| N-600 | Certificado de ciudadanía adquirida o derivada | Hijo de ciudadano |
| SS-5 | Solicitud de tarjeta de Seguro Social | Solicitante, ante la SSA |

**Estructura del informe de elegibilidad**

1. Resumen del caso en 2 o 3 líneas.
2. Datos clave del peticionario y del beneficiario.
3. Categoría probable (familiar inmediato o preferencia F1–F4) y si hay espera de visa.
4. Ruta probable: ajuste de estatus o proceso consular, con la razón.
5. Formularios que aplican y orden de presentación.
6. Señales de alerta detectadas.
7. Documentos faltantes.
8. Preguntas abiertas para el abogado.
9. Aviso: "Evaluación preliminar; requiere revisión del abogado."

## Notas de implementación y límites éticos

La IA debe presentarse como asistente del despacho, no como abogado: dar servicios legales sin licencia es ilegal en Texas y en otros estados.

- **Supervisión:** el abogado revisa cada informe antes de dar cualquier recomendación al cliente.
- **Aviso inicial:** mostrarlo al empezar cada conversación (está incluido en las instrucciones).
- **Privacidad:** usar una plataforma con garantías de confidencialidad; no guardar números de Seguro Social, A-Number ni pasaporte en el chat.
- **Actualización:** revisar las instrucciones con el abogado cuando cambien leyes, tarifas o políticas de USCIS, SSA o el Departamento de Estado.
- **Pruebas:** antes de lanzarla, probarla con 5 a 10 casos ficticios y que el abogado valide cada respuesta.
- **Idioma:** probar las respuestas en español y en inglés.

Pendientes del despacho:

- [ ] Nombre del despacho y del abogado que supervisa
- [ ] Plataforma donde se instalará la IA
- [ ] Canal seguro para recibir documentos y datos sensibles
