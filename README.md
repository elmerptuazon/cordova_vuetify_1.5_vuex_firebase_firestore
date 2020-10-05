# AppSell Mobile Application

> AppSell

## Build Setup

Version:
node 12.16.3
gradle 6.6.1(install manually via zip)
android sdk 28(might need to change manually under platforms)

Requirements:
create gradle.properties under platforms android

``` bash
# install dependencies
npm install

# serve with hot reload at localhost:8080
npm run dev

# build for production with minification
npm run build

# build for production and view the bundle analyzer report
npm run build --report

# build for production and cordova build.
npm run cordova-build

# build for production and serve the app through the browser - no hot reload.
npm run browser

# add respective platforms
cordova platform add android
cordova platform add ios

# build for production and serve the app on an iOS device
npm run ios

# build for production and serve the app on an android device (won't serve on a virtual device)
npm run android

# build for production and serve the app on an android device (will serve on a virtual device or physical device - prefers virtual)
npm run android-vm

# create unsigned apk in live connection - Select company you wish to generate
npm run generate

# create unsigned apk in dev connection - Select company you wish to generate
npm run generate-dev

# create iOS app and xcodeproject in dev connection - Select company you wish to generate
npm run generate-dev-ios

# create the released files
cordova build android --release

# location of the released file
cd platforms/android/app/build/outputs/apk/release

# sign the unsigned APK
jarsigner -verbose -sigalg SHA1withRSA -digestalg SHA1 -keystore everbilena-release-key.keystore app-release-unsigned.apk alias_name

# run zip align tool
zipalign -v 4 app-release-unsigned.apk HelloWorld.apk

For detailed explanation on how things work, checkout the [guide](http://vuejs-templates.github.io/webpack/) and [docs for vue-loader](http://vuejs.github.io/vue-loader).


# If generating an iOS app for other clients
# Generate the Android APK first for that client, then do the following below:
cordova plugin save

*revert all changes in package.json* (very important step)

cordova platform rm ios
cordova platform add ios

#If the iOS app crashes when Camera is used, go to the <company name>-Info.plist, located at the platform/ios/<app name>
# add the following tags after the "NSPhotoLibraryUsageDescription" string tag
<key>NSCameraUsageDescription</key>
<string>This app requires camera access to function properly.</string>
