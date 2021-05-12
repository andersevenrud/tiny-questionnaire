/*
 * tiny-questionnaire
 *
 * This is an example implementation of this application.
 *
 * @copyright Anders Evenrud <andersevenrud@gmail.com>
 * @license MIT
 */
import './src/index.scss'
import { createApp } from './src'

// Root element for application
const root = document.body.appendChild(document.createElement('div'))

// Bootstrap
const app = createApp(root, {
  debug: process.env.NODE_ENV === 'development',
  questions: [
    {
      text: 'Hei _ deg _',
      answers: ['på', 'sann'],
      choices: [
        ['av', 'på'],
        ['ikke', 'sann']
      ]
    },
    {
      text: 'Hvem er USAs president ?',
      answers: ['Donald Trump'],
      choices: [
        'George Bush',
        'Donald Trump',
        'Barack Obama'
      ]
    },
    {
      text: 'Ja, _ _ skal du _',
      answers: ['tusen', 'takk', 'ha']
    },
    {
      text: 'Hello _ !',
      answers: ['world']
    },
    {
      text: '5 + 5 = _',
      answers: [10]
    },
    {
      text: '2 + _ = 4',
      answers: [2]
    }
  ]
})

// Available events for external operations etc
app.on('start', () => {
  console.log('Started')
})

app.on('stop', (result) => {
  console.log('Finished', result)
})

// Global events
document.addEventListener('click', () => {
  app.focusNextInput()
})

// Skip introduction view in development mode
if (process.env.NODE_ENV === 'development') {
  document.addEventListener('DOMContentLoaded', () => {
    app.start()
  })
}
