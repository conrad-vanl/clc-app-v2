import './shim';
import './loadConfig';
import { AppRegistry, YellowBox } from 'react-native';

const MainApp = require('./src').default;

let App = MainApp;

YellowBox.ignoreWarnings([
  'Warning: isMounted(...) is deprecated',
  'Module RCTImageLoader',
]);

AppRegistry.registerComponent('CLC', () => App);
