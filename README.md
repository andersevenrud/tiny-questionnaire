# tiny-questionnaire

Embeddable web application that presents the user with a series of questions that can have multiple outcomes and formats.

## Features

* Easly enbeddable client-side application
* Extremely light-weight in production (< 20K*)
* Multiple question types (listed below)
* Diffrent answer modes
* Statistics support
* Localization support
* Supports all browsers
* Accessibility support
* Debug mode

> (*) In modern browsers, i.e. no Internet Explorer. Addutional 5-10K for legacy support.

## Installation

To fire up a development environment simply run the following commands.

This repository is set up to build the example `example.js` solution.

> Requires Node 10+

```
npm install
npm run start:dev
```

### Deployment

Run `npm run prod` to create a distribution bundle in `dist/`.

## Configuration

| Option              | Type          | Default | Description                                       |
| ------------------- | ------------- | ------- | ------------------------------------------------- |
| `questions`         | `question[]`  | `[]`    | Questions                                         |
| `questionTimeout`   | `number`      | `15`    | Question timeout                                  |
| `questionDelimiter` | `string`      | `_`     | Question input field delimiter                    |
| `skippable`         | `boolean`     | `false` | Yes/No (oral) mode (see keybindings below)        |
| `autocomplete`      | `boolean`     | `true`  | Simulates 'Enter' key if correct value was filled |
| `language`          | `string`      | `en`    | UI Language                                       |
| `debug`             | `boolean`     | auto    | Debug mode (v/overview)                           |

### Question types

There are several types of questions based on the `question[]` array entry data.

An answer value could be anything that's serializable to a string.

### Fill in sentences

```json
{
  text: 'Hello _ !',
  answers: ['world']
}
```

```json
{
  text: 'Hello _! Goodbye _ !',
  answers: ['world', 'sandman']
}
```

### Fill in sentences, but from a list of options

```json
{
  text: 'Hello _ !',
  answers: ['world'],
  choices: ['world', 'universe']
}
```

### Standard question, answer from a list of options

```json
{
  text: 'Who are you ?',
  answers: ['god'],
  choices: ['god', 'dog']
}
```

## Events

Hook into events with `.on()` and `.off()` on the application instance.

| Name        | Description                                        |
| ----------- | -------------------------------------------------- |
| `start`     | When exercise starts                               |
| `stop`      | When exercise stops (argument contains last state) |

## Actions

See `src/app.js` for a list of actions that's wired to the application instance.

## Keyboard Shortcuts

| Shortcut       | Description                                                                     |
| -------------- | ------------------------------------------------------------------------------- |
| `Enter`        | In `skippable` mode fill/mark the current answer as correct                     |
| `Shift+Enter`  | Same as above, except that it makes the current answer invalid                  |

## License

MIT
