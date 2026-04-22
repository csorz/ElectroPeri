{
  'targets': [{
    'target_name': 'raw_keyboard',
    'sources': ['raw_keyboard.c'],
    'cflags': ['-Wall'],
    'conditions': [
      ['OS=="win"', {
        'libraries': ['-luser32.lib']
      }]
    ]
  }]
}
