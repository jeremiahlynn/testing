# UXPAngularLibrary

This is the monorepo variant (probably will be the only supported variant) for the uxp library

## Important Notes

This library is intended to be added to an angular app under the projects folder.

```sh
gh repo clone SiliconPublishing/UXPAngularLibrary projects/spi-library;
```

Then update the root tsconfig.json to include the following:

```json
{
    "paths": {
        "@spi-library": ["projects/spi-library/src/public_api.ts"]
    }
}
```

## Getting started

### Pre-requisites

- node v20.18.0; if you don't already, use nvm ( [MAC](https://github.com/nvm-sh/nvm) | [Windows](https://github.com/coreybutler/nvm-windows) )
- Logged into NPM with access to @silpub packages
- [Visual Studio Code](https://code.visualstudio.com/Download)

### Install dependencies

In some fashion, you will want to install the peerDependencies under package.json in the root project.

## Authors

- **Jeremiah Lynn** ( [email](mailto:jeremiahlynn@siliconpublishing.com) | [github](https://github.com/jeremiahlynn) )
