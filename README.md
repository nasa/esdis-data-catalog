# ESDIS Data Catalog

#### Requirements

- [Node](https://nodejs.org/) (check .nvmrc for correct version)
  - [nvm](https://github.com/nvm-sh/nvm) is highly recommended

#### Running Data-Catalog locally

```bash
    npm run dev
```

#### Local Testing

To run the test suite, run:

```bash
    npm run test
```

#### Build

This project uses [Vite](https://vitejs.dev/) as its build tool. To build the project for production, follow these steps:

```bash 
    npm run build
```

After the build process completes, you'll find the main output file `DataCatalog.js` in the `dist` directory. This file contains the compiled and bundled version of the Data Catalog application, ready for deployment.

To test the production build locally:

1. After running `npm run build`, locate the `index.html` file in the `dist` directory.
2. Open `index.html` in a text editor and update the script tag to point directly to the `DataCatalog.js` file:
    ```
    <!doctype html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Data Catalog</title>
        <script type="module" crossorigin src="/DataCatalog.js"></script
      </head>
      <body>
        <div id="data-catalog"></div>
      </body>
    </html>
    ```
    Add a script tag with custom configuration values. You can adjust these values as needed:
     ```html
     <script id="config-data" type="application/json">
     {
       "defaultPageSize": 10,
       "collectionPath": "/data/catalog/<%= ProviderId %>-<%= ShortName %>-<%= Version %>",
       "cmrHost": "https://cmr.earthdata.nasa.gov",
       "providersWithLandingPages": ["GHRC_DAAC", "SEDAC"]
     }
     </script>
     ```
   This configuration script allows you to customize various settings for the Data Catalog application. Adjust the values according to your specific requirements.

3. Serve the built files locally:
   - If you don't have a local server installed, you can use `http-server`. Install it globally by running:
     ```
     npm install -g http-server
     ```
   - Navigate to the `dist` directory in your terminal:
     ```
     cd dist
     ```
   - Start the local server:
     ```
     http-server
     ```
   - Open your browser and visit `http://localhost:8080` (or the URL provided by http-server) to view your built application.

Note: Using a local server like `http-server` ensures that your application runs in an environment similar to a production server, which is important for testing purposes.
