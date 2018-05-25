import React from 'react'
import { BackHandler, Platform } from 'react-native'
import { addNavigationHelpers } from 'react-navigation'
import { createReduxBoundAddListener } from 'react-navigation-redux-helpers'
import { connect } from 'react-redux'
import AppNavigation from './AppNavigation'

const { MessagingEngine } = require('../Engine/engine.js');

class ReduxNavigation extends React.Component {
  constructor (props) {
    super (props)

    this.engine = this._initEngineNoData();
    this.engineInit = false;
    // this.fakeUserId = 'alexc.id';
    this.fakeUserId = 'pbj.id';
    this.engine.on('me-initialized', () => {
      console.log("engine initialized")
      // this.setState({initWithFetchedData: true});
      this.engineInit = true;
    });
  }
  componentDidMount() {
    this.engine.componentDidMountWork(this.engineInit, this.fakeUserId);
  }
  componentWillMount () {
    if (Platform.OS === 'ios') return
    BackHandler.addEventListener('hardwareBackPress', () => {
      const { dispatch, nav } = this.props
      // change to whatever is your first screen, otherwise unpredictable results may occur
      if (nav.routes.length === 1 && (nav.routes[0].routeName === 'LaunchScreen')) {
        return false
      }
      // if (shouldCloseApp(nav)) return false
      dispatch({ type: 'Navigation/BACK' })
      return true
    })
  }
  componentWillUnmount () {
    if (Platform.OS === 'ios') return
    BackHandler.removeEventListener('hardwareBackPress')
  }
  logger = (...args) => {
    // if (process.env.NODE_ENV === 'development' || this.state.console) {
      console.log(...args);
    // }
  }
  _initEngineNoData = () => {
    // Start the engine:
    const logger = this.logger;
    const privateKey = '1';
    const publicKey = '2';
    const isPlugIn = false;
    const avatarUrl = '';  // TODO
    const discoveryPath = ''; // TODO
    const configuration = {
      neverWebRTC: true
    }
    const engine =
      new MessagingEngine(logger,
                          privateKey,
                          publicKey,
                          isPlugIn,
                          avatarUrl,
                          discoveryPath,
                          configuration);

    return engine;
  }
  _getUserData = () => {
    const {BlockstackNativeModule} = NativeModules;
    BlockstackNativeModule.getUserData((error, userData) => {
      if (error) {
        throw(`Failed to get user data.  ${error}`);
      } else {
        console.log(`SUCCESS (getUserData):\n`);
        for (const key in userData) {
          console.log(`\t${key}: ${userData[key]}`)
        }
        // Get public key:
        BlockstackNativeModule.getPublicKeyFromPrivate(
          userData['privateKey'], (error, publicKey) => {
            if (error) {
              throw(`Failed to get public key from private. ${error}`);
            } else {
              console.log(`SUCCESS (loadUserDataObject): publicKey = ${publicKey}\n`);
              // Start the engine:
              const logger = undefined;
              const privateKey = userData['privateKey'];
              const isPlugIn = false;
              const avatarUrl = '';  // TODO
              const discoveryPath = ''; // TODO
              this.engine =
                new MessagingEngine(logger,
                                    privateKey,
                                    publicKey,
                                    isPlugIn,
                                    this.props.avatarUrl,
                                    this.props.path);

              // Test encryption
              // let testString = "Concensus";
              // BlockstackNativeModule.encryptPrivateKey(publicKey, testString, (error, cipherObjectJSONString) => {
              //   if (error) {
              //     throw(`Failed to encrpyt ${error}.`);
              //   } else {
              //     console.log(`SUCCESS (encryptPrivateKey): cipherObjectJSONString = ${cipherObjectJSONString}`);
              //     BlockstackNativeModule.decryptPrivateKey(userData['privateKey'], cipherObjectJSONString, (error, decrypted) => {
              //       if (error) {
              //         throw(`Failed to decrypt: ${error}.`)
              //       } else {
              //         console.log(`SUCCESS (decryptPrivateKey): decryptedString = ${decrypted}`)
              //       }
              //     });
              //   }
              // });

              // Test encryptContent / decryptContent
              // let testString = "Content works?";
              // BlockstackNativeModule.encryptContent(testString, (error, cipherObjectJSONString) => {
              //   if (error) {
              //     throw(`Failed to encrpyt with encryptContent: ${error}.`);
              //   } else {
              //     console.log(`SUCCESS (encryptContent): cipherObjectJSONString = ${cipherObjectJSONString}`);
              //     BlockstackNativeModule.decryptContent(cipherObjectJSONString, (error, decrypted) => {
              //       if (error) {
              //         throw(`Failed to decrypt with decryptContent: ${error}.`)
              //       } else {
              //         console.log(`SUCCESS (decryptContent): decryptedString = ${decrypted}`)
              //       }
              //     });
              //   }
              // });

              // Test get file on pk.txt path.
              // BlockstackNativeModule.getRawFile('pk.txt', (error, array) => {
              //   console.log('After getFile:');
              //   console.log('--------------------------------------------------------');
              //   console.log(`error: ${error}`);
              //   console.log(`content: ${array}`);
              //   console.log('');
              // });

              // Test write/read cycle:
              // BlockstackNativeModule.putFile('testWrite.txt',
              //                                'Will this work?',
              //                                (error, content) => {
              //   console.log('wrote testWrite.txt');
              //   console.log('After putFile:');
              //   console.log('--------------------------------------------------------');
              //   console.log(`error: ${error}`);
              //   console.log(`content: ${content}`);
              //   console.log('');
              //
              //   BlockstackNativeModule.getFile('testWrite.txt', (error, content) => {
              //     console.log('read testWrite.txt');
              //     console.log('After getFile:');
              //     console.log('--------------------------------------------------------');
              //     console.log(`error: ${error}`);
              //     console.log(`content: ${content}`);
              //     console.log('');
              //   });
              // });
            }
        });
        return userData;
      }
    });
    return undefined;
  };
  render () {
    return <AppNavigation screenProps={{engine: this.engine}} navigation={addNavigationHelpers({dispatch: this.props.dispatch, state: this.props.nav, addListener: createReduxBoundAddListener('root') })} />
  }
}

const mapStateToProps = state => ({ nav: state.nav })
export default connect(mapStateToProps)(ReduxNavigation)
