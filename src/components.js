/*
 * tiny-questionnaire
 * @copyright Anders Evenrud <andersevenrud@gmail.com>
 * @license MIT
 */
import { h } from 'hyperapp'
import { dateToTimestamp, parseQuestion, isCorrect, ifWithArray } from './utils'
import translate from './locales'

/**
 * Table component
 */
const Table = ({ lines }) => (
  <table>
    <tbody>
      {lines.map(([k, v]) => (
        <tr>
          <td>{k}</td>
          <td>{v}</td>
        </tr>
      ))}
    </tbody>
  </table>
)

/**
 * Debugger Component
 */
const Debugger = () => (state, actions) => {
  const formatted = date => date ? dateToTimestamp(date) : '-'

  const solution = !state.ended && state.questionIndex >= 0
    ? state.questions[state.questionIndex].answers.join(', ')
    : ''

  const lines = [
    ['Busy', String(state.busy)],
    ['Started', formatted(state.started)],
    ['Ended', formatted(state.ended)],
    ['Question time', `${state.currentTime}s / ${state.questionTimeout}s`],
    ['Total time', `${state.totalTime}s`],
    ['Question', `${state.questionIndex + 1} / ${state.questions.length}`],
    ['Correct', state.correctCount],
    ['Incorrect', state.incorrectCount],
    ['Solution', solution]
  ]

  return (
    <div class="debug">
      <header>
        Debug
      </header>

      <Table lines={lines} />

      <pre>
        {JSON.stringify({ answers: state.answers, questions: state.questions }, null, 2)}
      </pre>

      <div class="debug__buttons">
        <button type="button" tabindex="-1" onclick={() => actions.stop()}>End</button>
        <button type="button" tabindex="-1" onclick={() => actions.start()}>(Re)start</button>
        <button type="button" tabindex="-1" onclick={() => actions.nextQuestion()}>Skip</button>
      </div>
    </div>
  )
}

/**
 * Container component for answer element(s)
 */
const AnswerInputField = ({
  index,
  disabled
}) => ({
  autocomplete,
  skippable,
  answers,
  questions,
  answerIndex,
  questionIndex
}, {
  answerQuestion,
  updateAnswerValue
}) => {
  const answer = String(questions[questionIndex].answers[index])
  const { value, correct } = answers[questionIndex][index] || {}
  const disable = disabled || correct !== undefined
  const triggeranswer = value => answerQuestion({ index, value })

  const oninput = ev => updateAnswerValue({
    index,
    value: String(ev.target.value)
  })

  const onkeyup = (ev) => {
    const enter = ev.key === 'Enter'

    if (skippable && enter && ev.shiftKey) {
      triggeranswer()
    } else {
      const value = ev.target.value || ''
      const inputValue = skippable && enter && !value.length ? answer : value

      if ((autocomplete && isCorrect(value, answer)) || (inputValue.length > 0 && enter)) {
        triggeranswer(inputValue)
      }
    }
  }

  const onkeydown = (ev) => {
    if (ev.key === 'Tab') {
      ev.preventDefault()
    }
  }

  const oncreate = (el) => {
    if (index === answerIndex || index === 0) {
      el.focus()
    }
  }

  return (
    <div class={`answer answer--${String(correct)}`}>
      <input
        class="__answer__"
        type="text"
        autocomplete="off"
        spellcheck="false"
        maxlength={answer.length}
        disabled={disable}
        value={value}
        style={{ width: `${answer.length}em` }}
        oncreate={oncreate}
        onupdate={oncreate}
        oncontextmenu={ev => ev.preventDefault()}
        onkeydown={onkeydown}
        onkeyup={onkeyup}
        oninput={oninput}
      />
    </div>
  )
}

/**
 * Container component for answer element(s)
 */
const AnswerChoiceButton = ({
  value,
  index,
  highlightable,
  focuschoice
}) => ({
  answers,
  questions,
  skippable,
  questionIndex,
  answerIndex
}, {
  answerQuestion
}) => {
  const questionAnswer = String(questions[questionIndex].answers[answerIndex])
  const answer = answers[questionIndex][answerIndex] || {}
  const correct = highlightable && answer.value === value ? answer.correct : undefined
  const onanswer = ev => answerQuestion({
    index: answerIndex,
    value: skippable ? (ev.shiftKey ? undefined : questionAnswer) : value
  })

  const oncreate = (el) => {
    if (focuschoice && index === 0) {
      el.focus()
    }
  }

  return (
    <div class={`question__choices__choice question__choices__choice--${correct}`}>
      <button
        class="__choice__"
        type="button"
        oncreate={oncreate}
        onclick={onanswer}
      >
        {value}
      </button>
    </div>
  )
}

/**
 * Question screen view component
 */
const QuestionView = () => ({
  busy,
  language,
  answerIndex,
  questionIndex,
  questions,
  questionTimeout,
  questionDelimiter,
  currentTime
}) => {
  const _ = translate(language)
  const progress = 100 - Math.round(currentTime / (questionTimeout - 1) * 100)
  const question = questions[questionIndex]
  const choices = question.choices instanceof Array ? ifWithArray(question.choices[answerIndex], question.choices) : []
  const disabled = busy || (choices ? choices.length > 0 : false)
  const focuschoice = choices.length > 0
  const highlightable = focuschoice ? !(question.choices[answerIndex] instanceof Array) : false
  const parsedQuestion = parseQuestion(question.text, questionDelimiter)
  const isDisabled = index => disabled || index > answerIndex

  return (
    <div class="question" key={questionIndex}>
      <div class="question__header">
        {_('header', questionIndex + 1, questions.length)}
      </div>

      <div class="question__wrapper">
        {parsedQuestion.map(({ word, field, index }) => (
          <div class="question__inner">
            {field
              ? (<AnswerInputField index={index} disabled={isDisabled(index)} />)
              : (<div class="question__text">{word}</div>)}
          </div>
        ))}
      </div>

      {choices.length > 0 && (
        <div class="question__choices">
          {choices.map((value, index) => (
            <AnswerChoiceButton
              value={value}
              index={index}
              highlightable={highlightable}
              focuschoice={focuschoice}
            />
          ))}
        </div>
      )}

      {questionTimeout > 0 && (
        <div class="question__progress">
          <div style={{ width: `${progress}%` }}></div>
        </div>
      )}
    </div>
  )
}

/**
 * Summary screen view component
 */
const SummaryView = () => ({
  correctCount,
  incorrectCount,
  questions,
  language
}) => {
  const _ = translate(language)
  const count = questions.length
  const formatted = v => `${v} (${(v ? v / count * 100 : 0).toFixed(2)}%)`
  const lines = [
    [_('answered'), count],
    [_('correct'), formatted(correctCount)],
    [_('incorrect'), formatted(incorrectCount)]
  ]

  return (
    <div class="summary">
      <Table lines={lines} />
    </div>
  )
}

/**
 * Welcome screen view component
 */
const WelcomeView = () => ({ language }, { start }) => {
  const _ = translate(language)

  return (
    <div class="welcome">
      <button
        type="button"
        oncreate={el => el.focus()}
        onclick={() => start()}
      >
        {_('welcome')}
      </button>
    </div>
  )
}

/**
 * View Component
 */
export const View = () => ({ debug, ended, started }) => (
  <div class="app">
    {debug && (
      <Debugger />
    )}

    <div class="container">
      {ended
        ? (<SummaryView />)
        : (started ? (<QuestionView />) : (<WelcomeView />))
      }
    </div>
  </div>
)
