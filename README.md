# Memorama de Perros

Juego de memoria creado con Ionic y Angular. Encuentra las seis parejas de perros en el menor número de intentos posible.

## Funcionalidades

- Partidas para un jugador con nombre personalizado.
- Tablero de 12 cartas con imágenes de perros aleatorias.
- Contador de parejas encontradas e intentos.
- Tabla de récords ordenada por menor cantidad de intentos.
- Historial guardado localmente en el dispositivo.

Las imágenes se obtienen de [Dog CEO API](https://dog.ceo/dog-api/), por lo que se necesita conexión a internet para iniciar una partida.

## Requisitos

- Node.js y npm, en versiones compatibles con Angular 22.
- Android Studio y el SDK de Android si quieres ejecutar la aplicación como app Android.

## Instalación y ejecución

Clona el repositorio y ejecuta estos comandos desde su carpeta:

```bash
npm install
npm start
```

Abre la dirección que indique Angular CLI (normalmente `http://localhost:4200`) en el navegador.

## Comandos disponibles

| Comando | Descripción |
| --- | --- |
| `npm start` | Inicia el servidor de desarrollo. |
| `npm run build` | Compila la aplicación para producción en `www/`. |
| `npm run watch` | Compila en modo desarrollo y vuelve a compilar al detectar cambios. |
| `npm test` | Ejecuta las pruebas unitarias. |
| `npm run lint` | Analiza el código TypeScript y las plantillas HTML. |

## Android

El proyecto incluye la plataforma Android configurada con Capacitor. Para compilar los recursos web y sincronizarlos con Android:

```bash
npm run build
npx cap sync android
npx cap open android
```

El último comando abre el proyecto en Android Studio, desde donde puedes ejecutarlo en un emulador o dispositivo conectado.

## Tecnologías

- Angular 22 y TypeScript
- Ionic 9
- Capacitor 8
- Capacitor Preferences para guardar los récords localmente
- Dog CEO API para las imágenes de perros
