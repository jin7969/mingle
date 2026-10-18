const { withAppDelegate } = require('@expo/config-plugins');

const classDeclaration = 'class AppDelegate: ExpoAppDelegate {';
const sceneClassDeclaration =
  'class AppDelegate: ExpoAppDelegate, ExpoReactNativeFactoryProvider {';
const legacyWindowSetup = `#if os(iOS) || os(tvOS)
    window = UIWindow(frame: UIScreen.main.bounds)
    factory.startReactNative(
      withModuleName: "main",
      in: window,
      launchOptions: launchOptions)
#endif`;

module.exports = function withIosSceneLifecycle(config) {
  return withAppDelegate(config, (appDelegateConfig) => {
    if (appDelegateConfig.modResults.language !== 'swift') {
      throw new Error('The iOS 27 scene lifecycle plugin requires a Swift AppDelegate.');
    }

    let contents = appDelegateConfig.modResults.contents;

    if (contents.includes(classDeclaration)) {
      contents = contents.replace(classDeclaration, sceneClassDeclaration);
    }

    if (contents.includes(legacyWindowSetup)) {
      contents = contents.replace(legacyWindowSetup, '');
    }

    if (!contents.includes(sceneClassDeclaration)) {
      throw new Error('Unable to configure AppDelegate for the iOS 27 scene lifecycle.');
    }

    appDelegateConfig.modResults.contents = contents;
    return appDelegateConfig;
  });
};
