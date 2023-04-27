import './shim'
import 'reflect-metadata' // needed for migrations
import 'react-native-get-random-values'
import '@ethersproject/shims'
import 'fast-text-encoding'
import 'react-native-gesture-handler'
// if (typeof BigInt === 'undefined') global.BigInt = require('big-integer')
import { registerRootComponent } from 'expo'

import App from './App'

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(App)
