/*
 * tiny-questionnaire
 * @copyright Anders Evenrud <andersevenrud@gmail.com>
 * @license MIT
 */
import { translator } from './utils'

/*
 * English translations
 */
const en = {
  header: '{0} of {1}',
  answered: 'Answered',
  correct: 'Correct',
  incorrect: 'Incorrect',
  welcome: 'Press this button to start exercise.'
}

/**
 * Translates strings
 */
export default translator({
  en
})
