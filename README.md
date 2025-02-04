# ESDIS Data Catalog

#### Requirements

- [Node](https://nodejs.org/) (check .nvmrc for correct version)
  - [nvm](https://github.com/nvm-sh/nvm) is highly recommended

#### Running Data-Catalog locally

```bash
    npm run start
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

```bash
    npm run test-dist
```

This script will run the `npm run build` command, then start an http server in the `dist` directory that you can view at [http://127.0.0.1:8081/](http://127.0.0.1:8081/)

## Contributing

See CONTRIBUTING.md

## License

> Copyright © 2007-2024 United States Government as represented by the Administrator of the National Aeronautics and Space Administration. All Rights Reserved.
>
> Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License.
> You may obtain a copy of the License at
>
> <http://www.apache.org/licenses/LICENSE-2.0>
>
>Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS,
>WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
