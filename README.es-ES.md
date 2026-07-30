

# Deno KV GUI Client

![downloads](https://img.shields.io/github/downloads/abdulrhmangoni/denokv-gui-client/total.svg)

Esta es una aplicación de escritorio para gestionar [**bases de datos Deno KV**](https://docs.deno.com/deploy/kv/manual/). <br/>
Te permite **explorar** tus datos en una interfaz gráfica moderna y amigable, realizar **operaciones CRUD**, guardar y reutilizar filtros de exploración y preferencias, ejecutar **operaciones atómicas** y transacciones, **observar claves** para actualizaciones de datos en tiempo real, ¡y mucho más!

Es como usar **"MongoDB Compass"** con **MongoDB**, **"Redis Insight"** con **Redis**, o **"Beekeeper Studio"** con muchas bases de datos diferentes.

## Algunas Capturas de Pantalla

![Kv Stores Grid screenshot (Dark)](./screenshots/KvStoresGrid_dark.png#gh-dark-mode-only)
![Kv Stores Grid screenshot (Light)](./screenshots/KvStoresGrid_light.png#gh-light-mode-only)

![Kv Entries Table screenshot (Dark)](./screenshots/KvEntriesTable_dark.png#gh-dark-mode-only)
![Kv Entries Table screenshot (Light)](./screenshots/KvEntriesTable_light.png#gh-light-mode-only)

![Add Entry Form screenshot (Dark)](./screenshots/AddKvEntryForm_dark.png#gh-dark-mode-only)
![Add Entry Form screenshot (Light)](./screenshots/AddKvEntryForm_light.png#gh-light-mode-only)

Para ver más capturas de pantalla de las funcionalidades que ofrece esta aplicación, consulta el [documento de capturas](./screenshots/SCREENSHOTS.md).

## Descarga

**_Siempre se recomienda descargar desde la última versión publicada_**

Para descargar la aplicación **Deno KV GUI Client**, ve a la página de [publicaciones][releases-page], selecciona y descarga el archivo que corresponda a tu sistema operativo:

### Windows

En Windows, solo necesitas descargar el archivo `denokv-gui-client-x.x.x-win-x64.exe` desde la página de [publicaciones][releases-page] y ejecutarlo.

### Linux

Existen dos opciones para usuarios de Linux:

#### `.AppImage` format (compatible con la mayoría de las distribuciones de Linux)

> [!TIP]
> Para descargar fácilmente el archivo `.AppImage` y configurar una entrada de escritorio para la aplicación, ejecuta:
>
> ```bash
> curl -sS https://abdulrhmangoni.github.io/denokv-gui-client/linux-AppImage-install.sh | sh
> ```
>
> Si ya descargaste el archivo `.AppImage` desde la página de [publicaciones][releases-page], puedes pasar su ruta al script de instalación para omitir la descarga y solo configurar la entrada de escritorio:
>
> ```bash
> curl -sS https://abdulrhmangoni.github.io/denokv-gui-client/linux-AppImage-install.sh path/to/denokv-gui-client-x.x.x-linux-x86_64.AppImage | sh
> ```

> [!IMPORTANT]
> Si decidiste descargar y ejecutar manualmente el archivo `.AppImage`, es posible que necesites hacerlo ejecutable antes de correrlo:
>
> ```bash
> chmod +x path/to/denokv-gui-client-x.x.x-linux-x86_64.AppImage
> ```
>
> _Asegúrate de reemplazar 'path/to' y 'x.x.x' con la ubicación y versión reales._

#### `.deb` format (instalador para Debian/Ubuntu)

Si elegiste el instalador `.deb` y lo descargaste, puedes instalarlo de la siguiente manera:

```bash
sudo dpkg -i path/to/denokv-gui-client-x.x.x-linux-x86_64.deb
```

### MacOS

La aplicación se proporciona como un instalador `.dmg` tanto para Apple Silicon (arm64) como para Intel (x86_64).  
Descarga la versión correcta para tu Mac desde la página de [publicaciones][releases-page]:

- `denokv-gui-client-x.x.x-mac-arm64.dmg` para **Macs con Apple Silicon**
- `denokv-gui-client-x.x.x-mac-x64.dmg` para **Macs basados en Intel**

> [!IMPORTANT]
> La versión para MacOS de esta aplicación aún no está firmada digitalmente. Al ejecutar la aplicación, es posible que te encuentres con advertencias de seguridad como "“denokv-gui-client.app” está dañado y no se puede abrir". Por lo tanto, asegúrate de confiar en el código fuente.
>
> Cuando descargues e instales la aplicación, es muy probable que se te impida abrirla y veas una advertencia como esta:
>
> > “denokv-gui-client.app” está dañado y no se puede abrir. Deberías moverlo a la papelera.
>
> Puedes omitir esto usando el siguiente comando:
>
> ```sh
> xattr -c /path/to/denokv-gui-client.app
> ```
>
> _Asegúrate de reemplazar '/path/to' con la ubicación real de la aplicación_

## Instalar y ejecutar localmente

### Instalación

1. Clona el repositorio y entra en el directorio del proyecto

```bash
  git clone https://github.com/AbdulrhmanGoni/denokv-gui-client.git && cd denokv-gui-client
```

2. Instala las dependencias

```bash
  pnpm install
```

### Modo de desarrollo

Primero debes ejecutar la migración para configurar la base de datos de desarrollo:

```bash
  pnpm run migration up
```

> [!NOTE]
> Se creará un archivo de base de datos SQLite de desarrollo en el directorio raíz del proyecto una vez que ejecutes el comando de migración por primera vez.
> Allí se almacenarán todos los datos y configuraciones creados en modo de desarrollo.

Luego, ejecuta la aplicación en modo de desarrollo con:

```bash
  pnpm start
```

### Compilar la aplicación

Para compilar o construir la aplicación para su uso en producción:

```bash
  pnpm run compile
```

> Este comando creará los artefactos de compilación en el directorio `dist`,

[releases-page]: https://github.com/AbdulrhmanGoni/denokv-gui-client/releases

## Contribución

Por favor, consulta el documento [CONTRIBUTING.md](./CONTRIBUTING.md) para las directrices de contribución.
