/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */

import React, { Component } from 'react'
import { AppRegistry, StyleSheet, Text, View } from 'react-native'

const noble = require('noble')
const bleat = require('./libs/bleat/index').classic
const ergometer = require('./libs/ergometer.js').ergometer(bleat)

class ErgometerReactNative extends Component {
  performanceMonitor = new ergometer.PerformanceMonitor()

  state = {
    connectionState: '-',
    deviceName: '-',
    distance: 0,
    versionInfo: ''
  }

  onConnectionStateChanged(oldState, newState) {
    this.setState({ connectionState: newState })
    const self = this
    //do a csafe call when we are ready for communication
    if (newState === 6) {
      //ready for communication
      this.performanceMonitor.csafeBuffer
        .clear()
        .getVersion({
          onDataReceived: function(version) {
            self.setState({
              versionInfo:
                'Version hardware ' +
                version.HardwareVersion.toString() +
                ' software:' +
                version.FirmwareVersion.toString()
            })
          }
        })
        .send()
    }
  }
  onRowingGeneralStatus(data) {
    this.setState({ distance: data.distance })
  }

  onNobleStateChange(state) {
    if (state === 'poweredOn') {
      this.performanceMonitor.startScan(device => {
        if (device.name.startsWith('PM5')) {
          this.setState({ deviceName: device.name })
          return true
        }

        return false
      })
    } else {
    }
  }

  componentWillMount() {
    this.performanceMonitor.logLevel = ergometer.LogLevel.trace
    this.performanceMonitor.connectionStateChangedEvent.sub(
      this,
      this.onConnectionStateChanged
    )
    this.performanceMonitor.rowingGeneralStatusEvent.sub(
      this,
      this.onRowingGeneralStatus
    )

    noble.on('stateChange', state => {
      this.onNobleStateChange(state)
    })
  }

  componentWillUnmount() {
    this.performanceMonitor.connectionStateChangedEvent.unsub(
      this.onConnectionStateChanged
    )
    this.performanceMonitor.rowingGeneralStatusEvent.unsub(
      this.onRowingGeneralStatus
    )
  }

  render() {
    return (
      <View style={styles.container}>
        <Text style={styles.welcome}>Welcome to React Native ErgometerJS</Text>
        <Text style={styles.instructions}>
          To get started, edit index.ios.js
        </Text>
        <Text style={styles.instructions}>
          State: {this.state.connectionState}
        </Text>
        <Text style={styles.instructions}>Device: {this.state.deviceName}</Text>
        <Text style={styles.instructions}>Distance: {this.state.distance}</Text>
        <Text style={styles.instructions}>
          Version: {this.state.versionInfo}
        </Text>
        <Text style={styles.instructions}>
          Press Cmd+R to reload,{'\n'}
          Cmd+D or shake for dev menu
        </Text>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF'
  },
  welcome: {
    fontSize: 20,
    textAlign: 'center',
    margin: 10
  },
  instructions: {
    textAlign: 'center',
    color: '#333333',
    marginBottom: 5
  }
})

AppRegistry.registerComponent(
  'ErgometerReactNative',
  () => ErgometerReactNative
)
