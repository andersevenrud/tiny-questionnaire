/*
 * tiny-questionnaire
 * @copyright Anders Evenrud <andersevenrud@gmail.com>
 * @license MIT
 */
import { h, app } from 'hyperapp'
import { View } from './components'
import { countCorrectAnswers, isCorrect, defer } from './utils'
import EventEmitter from 'events'

/**
 * Application State
 */
const applicationState = {
  _timer: undefined,

  // Configurables
  skippable: false,
  autocomplete: true,
  language: 'en',
  debug: false,
  questionDelimiter: '_',
  questionTimeout: 15,
  questions: [],

  // Internals
  started: false,
  ended: false,
  busy: false,
  currentTime: 0,
  totalTime: 0,
  answerStarted: false,
  answerIndex: 0,
  questionIndex: 0,
  correctCount: 0,
  incorrectCount: 0,
  tickInterval: 1000,
  answers: []
}

/**
 * Application Actions
 */
const applicationActions = (root, bus) => ({
  /*
   * Go to the next question
   */
  nextQuestion: () => ({ questionIndex, questions }) => ({
    busy: false,
    answerIndex: 0,
    currentTime: 0,
    answerStarted: new Date(),
    questionIndex: Math.min(questionIndex + 1, questions.length - 1)
  }),

  /*
   * Goes back to previous question
   */
  previousQuestion: () => ({ questionIndex }) => ({
    busy: false,
    answerIndex: 0,
    currentTime: 0,
    answerStarted: new Date(),
    questionIndex: Math.max(questionIndex - 1, 0)
  }),

  /*
   * Updates an answer with given value
   */
  updateAnswerValue: ({ index, value }) => ({ answers, questionIndex }) => {
    const newAnswers = [...answers]
    newAnswers[questionIndex][index] = { value }
    return { answers: newAnswers }
  },

  /*
   * Handle an answer or a timeout
   */
  answerQuestion: (answer) => ({
    answers,
    questionIndex,
    questions,
    tickInterval,
    answerStarted: started
  }, {
    stop,
    nextQuestion,
    focusNextInput
  }) => {
    // Block any attempts to set answer(s) twice
    if (answer &&
      answers[questionIndex][answer.index] &&
      answers[questionIndex][answer.index].correct !== undefined
    ) {
      return {}
    }

    const newAnswers = [...answers]
    const question = questions[questionIndex]
    const choices = question.choices || []
    const filled = answer ? answer.index >= question.answers.length - 1 : true
    const newAnswerIndex = answer ? Math.max(answer.index + 1, choices.length - 1) : 0
    const finished = questionIndex >= questions.length - 1
    const ended = new Date()
    const append = {}

    if (answer) {
      // If an answer was given, only fill out the current index with calculated state
      const questionValue = question.answers[answer.index]
      const correct = isCorrect(answer.value, questionValue)
      const value = correct ? questionValue : answer.value

      newAnswers[questionIndex][answer.index] = { value, started, ended, correct }
    } else {
      // If we timed out, fill inn remaining with incorrect state
      const remaindingCount = question.answers.length - newAnswers[questionIndex].length
      const remainder = [...new Array(remaindingCount)]

      newAnswers[questionIndex] = [...newAnswers[questionIndex], ...remainder]
        .map(a => ({ correct: false, started, ended, ...a }))
    }

    if (filled) {
      // All answers for current question was filled out
      append.answerIndex = 0
      append.busy = true
      append.correctCount = countCorrectAnswers(newAnswers, result => result)
      append.incorrectCount = countCorrectAnswers(newAnswers, result => !result)

      defer(() => finished ? stop() : nextQuestion(), tickInterval)
    } else {
      focusNextInput(answer ? answer.index + 1 : undefined)
    }

    return {
      answers: newAnswers,
      answerIndex: newAnswerIndex,
      answerStarted: ended,
      ...append
    }
  },

  /*
   * Runs every second while exercise is active
   */
  tick: () => ({
    busy,
    started,
    totalTime,
    currentTime,
    questionTimeout
  }, {
    answerQuestion
  }) => {
    const elapsedTime = !busy && started ? currentTime + 1 : 0
    const timedOut = questionTimeout > 0 && elapsedTime >= questionTimeout
    const newElapsedTime = timedOut ? 0 : elapsedTime
    const newTotalTime = busy ? totalTime : totalTime + 1

    if (timedOut) {
      answerQuestion()
    }

    return {
      currentTime: newElapsedTime,
      totalTime: newTotalTime
    }
  },

  /*
   * Stops the exercise
   */
  stop: () => ({ _timer, started, ended, questions, answers }) => {
    bus.emit('stop', { started, ended, questions, answers })

    return {
      _timer: clearInterval(_timer),
      busy: false,
      currentTime: 0,
      ended: new Date()
    }
  },

  /*
   * (Re)starts the exercise
   */
  start: () => ({ _timer, questions, tickInterval }, { tick }) => {
    bus.emit('start')

    clearInterval(_timer)

    return {
      _timer: tickInterval ? setInterval(() => tick(), tickInterval) : undefined,
      answers: Array.from({ length: questions.length }, () => []),
      answerIndex: 0,
      correctCount: 0,
      incorrectCount: 0,
      questionIndex: 0,
      currentTime: 0,
      totalTime: 0,
      started: new Date(),
      answerStarted: new Date(),
      ended: false,
      busy: false
    }
  },

  /*
   * Figures out what imput to focus next based on current state
   */
  focusNextInput: (next) => ({ answers, questionIndex }) => {
    const answer = answers[questionIndex] || []
    const nextIndex = typeof next === 'number' ? next : answer.length
    const answerInputs = root.getElementsByClassName('__answer__')
    const focusElement = answerInputs[nextIndex] || answerInputs[0]
    const buttons = root.getElementsByClassName('__choice__')

    if (focusElement && !focusElement.disabled) {
      focusElement.focus()
    } else if (buttons.length > 0) {
      buttons[0].focus()
    }
  }
})

/**
 * Creates a new Application and returns an event-bus + methods
 * wired from application actions.
 */
export const createApp = (root, appendState = {}) => {
  const bus = new EventEmitter()
  const state = { ...applicationState, ...appendState }
  const actions = applicationActions(root, bus)
  const view = () => (<View />)

  return {
    ...app(state, actions, view, root),
    on: (e, a) => bus.on(e, a),
    off: (e, a) => bus.off(e, a)
  }
}
