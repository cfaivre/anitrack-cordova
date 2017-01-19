# AniTracker

Cordova application.

## Developement environment

This project requires **[npm](https://www.npmjs.com/)** to be installed.

Install cordova if you have not already.

```bash
npm install cordova -g
```

### Dependancies

The android platform requires the [Java SDK aka JDK](http://www.oracle.com/technetwork/java/javase/downloads/index.html) to be installed and PATHS configured.

Install the required cordova plugins & platforms.
```bash
npm install
```

### Build

```bash
npm run build:android
```

```bash
npm run build:ios
```

### iOS build requirements

Get a [developer ID](https://developer.apple.com/account/#/membership) and a [provisioning GUID](https://developer.apple.com/ios/manage/overview/index.action) from the iOS portal and add both to the `build.json` file in the root dir.