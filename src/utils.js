/*
 * tiny-questionnaire
 * @copyright Anders Evenrud <andersevenrud@gmail.com>
 * @license MIT
 */

/**
 * Formats Date instance to a timestamp
 * @param {Date} date
 * @return {string}
 */
export const dateToTimestamp = date => [date.getHours(), date.getMinutes(), date.getSeconds()]
  .map(str => String(str).padStart(2, '0'))
  .join(':')

/**
 * Replaces arguments in a translation string
 * @param {*} args Array of arguments
 * @return {(m: string, n: string) => string?}
 */
const translatorMatcher = args => (m, n) => n in args ? args[n] : m

/**
 * Translates a string
 * @param {object} translations
 * @return {(locale: string) => (str: string, ...any) => string}
 */
export const translator = translations => locale => {
  const list = {
    ...translations.en,
    ...translations[locale]
  }

  return (str, ...args) => (list[str] || str).replace(/\{(\d+)\}/g, translatorMatcher(args))
}

/**
 * Normalizes the indexes of answer inline inputs in an array of words
 * @example `['foo', delimiter, 'bar', delimiter]` => `[-1, 0, -1, 1]`
 * @param {string[]} words Word list
 * @param {string} delimiter Word delimiter
 * @return {number[]}
 */
const normalizeQuestionInlineIndexes = (words, delimiter) => words.reduce((acc, curr) => {
  const n = acc.filter(a => a !== -1).length
  return [...acc, curr === delimiter ? n : -1]
}, [])

/**
 * Parses a question string into an object used for visualization
 * @param {string} str Question text string
 * @param {string} delimiter Word delimiter
 * @return {object[]}
 */
export const parseQuestion = (str, delimiter) => {
  const words = str.replace(/\s+/g, ' ').split(' ')
  const indexes = normalizeQuestionInlineIndexes(words, delimiter)

  return words.map((word, index) => ({
    word,
    field: word === delimiter,
    index: indexes[index]
  }))
}

/**
 * Create a lowercase string from anything
 * @param {*} s
 * @return {string}
 */
const asLowerTrimString = s => String(s).trim().toLowerCase()

/**
 * Checks for equality of two arbitrary values
 * @param {*} a
 * @param {*} b
 * @return {boolean}
 */
export const isCorrect = (a, b) => asLowerTrimString(a) === asLowerTrimString(b)

/**
 * Counts the amount of correct entries in an array of answers
 * based on given condition callback
 * @param {object[]} answers
 * @param {Function} conditionFn
 * @return {number}
 */
export const countCorrectAnswers = (answers, conditionFn) =>
  answers
    .filter(i => i.length && conditionFn(i.every(a => a.correct)))
    .length

/**
 * Either returns 'a' if it's an array, or 'b'. If neither argument is an array
 * return an empty array
 * @param {Array|*} a
 * @param {Array?} b
 * @return {Array}
 */
export const ifWithArray = (a, b) => (a instanceof Array ? a : b) || []

/**
 * Defers a function call if a time was given, if not execute immediately
 * Mainly used for testing purposes
 * @param {Function} fn
 * @param {number} [time]
 */
export const defer = (fn, time) => time
  ? setTimeout(fn, time)
  : fn()
