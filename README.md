🌐 Proyecto Web - Next.js + Firebase

Este es un proyecto web desarrollado con Next.js y desplegado en Firebase, que integra múltiples servicios como Authentication, Firestore, Functions, Storage y Hosting. Además, se utiliza GitHub Actions para automatizar el flujo de despliegue a producción.

🚀 Instalación
    1. Clona el repositorio:

        git clone https://github.com/tu-usuario/tu-repo.git
        cd tu-repo

    2. Instala las dependencias del proyecto:

        npm install
        # o
        yarn install

    3. Crea un archivo .env.local con las variables necesarias para tu entorno (por ejemplo, claves de Firebase, etc.).

⚙️ Configuración
Asegúrate de tener configurado Firebase en tu entorno:

    1. Instala Firebase CLI si no la tienes:

        npm install -g firebase-tools

    2. Inicia sesión en Firebase:

        firebase login

    3. Asocia el proyecto local con tu proyecto de Firebase:

        firebase use --add

    4. Archivos clave incluidos en este repositorio:

        - firebase.json: configuración del hosting y servicios.
        - .firebaserc: alias del proyecto.
        - functions/: lógica backend (Cloud Functions).
        - app/: estructura del frontend con Next.js (modo App Router).

🧪 Uso en Desarrollo

Para levantar el servidor local de desarrollo:

    npm run dev

Abre http://localhost:3000 para ver la aplicación.

El frontend se actualiza automáticamente al guardar cambios.

Para emular servicios de Firebase localmente (opcional):

    firebase emulators:start

📦 Despliegue

El despliegue a producción se realiza automáticamente mediante GitHub Actions al hacer push a la rama main.

También puede hacerse manualmente con:

    firebase deploy --only "hosting,functions"

📁 Estructura del Proyecto

    ├── app/                # Frontend Next.js (App Router)
    ├── functions/          # Backend con Cloud Functions
    ├── public/             # Archivos estáticos
    ├── firebase.json       # Configuración de Firebase Hosting
    ├── .firebaserc         # Alias del proyecto
    └── .github/workflows/  # CI/CD con GitHub Actions

🧠 Tecnologías Utilizadas
    - Next.js
    - Firebase
    - Hosting, Auth, Firestore, Storage, Functions
    - GitHub Actions
    - TypeScript
    - IA Generativa (Claude + ChatGPT) (en el flujo de desarrollo)

👥 Equipo
Proyecto desarrollado por un equipo de 3 personas, integrando prácticas de DevOps, BPM, y automatización asistida por IA.
