'use strict'

let binding = null

function load() {
  if (binding) return binding
  try {
    binding = require('./build/Release/raw_keyboard.node')
  } catch (e1) {
    try {
      binding = require('./build/Debug/raw_keyboard.node')
    } catch (e2) {
      throw new Error('Cannot load raw_keyboard native module. Please run: pnpm rebuild raw-keyboard')
    }
  }
  return binding
}

module.exports = {
  getKeyboardDevices: function () {
    return load().getKeyboardDevices()
  },
  startRawInput: function (callback) {
    return load().startRawInput(callback)
  },
  stopRawInput: function () {
    return load().stopRawInput()
  }
}
