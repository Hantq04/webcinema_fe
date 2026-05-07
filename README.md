# WebcinemaFe

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 21.2.7.

## Development server

To start a local development server, run:

```bash
ng serve
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

## Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## Building

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Running unit tests

To execute unit tests with the [Vitest](https://vitest.dev/) test runner, use the following command:

```bash
ng test
```

## Running end-to-end tests

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.

## Running on Another Machine or Local Network

To run this project on another machine or allow access from other devices in your network:

### 1. Automatic API URL Detection
The system is configured to **automatically detect** the Backend address:
- When accessing via `localhost`, the API will call `localhost:8080`.
- When accessing via a network IP (e.g., `192.168.x.x`), the API will automatically call the Backend on the same IP at port `8080`.
*Note: If the Backend is running on a completely different machine from the Frontend, you will need to manually update `src/app/core/services/api.service.ts`.*

### 2. Start the Server for Network Access
Run the following command to allow other devices to connect to your frontend:

```bash
npm run start:network
```

Once running, you can access the application from other devices using your machine's IP address: `http://<YOUR_IP>:4200/`.

### 3. Prerequisites
Ensure that:
- Both machines are on the same local network (Wi-Fi or LAN).
- Firewall settings on both machines allow traffic on ports `4200` (Frontend) and `8080` (Backend).
- The Backend is configured to listen on `0.0.0.0` (Binding to all interfaces).

