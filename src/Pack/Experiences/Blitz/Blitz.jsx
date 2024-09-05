import React, { useContext, useEffect, useState } from 'react'

import { stripHTML, toTitleCase } from '@/lib/utilities'
import leven from 'leven'

import { usePack } from '@/stores/pack'
import { shallow } from 'zustand/shallow'
import { Experience } from '../Experience'

import Form from 'react-bootstrap/Form'
import Alert from 'react-bootstrap/Alert'
import Button from 'react-bootstrap/Button'
import InputGroup from 'react-bootstrap/InputGroup'
import { Markup } from '@/lib/Markup'

import './Blitz.scss'
import { ThemeContext } from '@/lib/context'

function BlitzComponent() {
	const theme = useContext(ThemeContext)

	const [guided, setGuided] = useState(true)
	const [ignoreSpelling, setIgnoreSpelling] = useState(true)
	const [index, setIndex] = useState(0)
	const [answer, setAnswer] = useState('')
	const [feedback, setFeedback] = useState({ variant: '', message: 'none' })
	const [responses, setResponses] = useState({})

	const [pack, cards, length] = usePack(
		(state) => [state.pack, state.pack.content[index], state.pack.content.length],
		shallow
	)

	var blacklist = ['?', 'how', 'what', 'where', 'why']

	useEffect(() => {
		if (
			// Keywords of question terms that we should skip
			blacklist.some((v) => cards.term.toLowerCase().includes(v))
		) {
			// Go to the next term (if possible)
			if (index + 1 < length) {
				// Fill in responses
				setResponses({ ...responses, [index]: true })
				setIndex(index + 1)
			} else {
				setFeedback({ variant: 'danger', message: <div>No more terms left</div> })
			}
		} else {
			// TODO: Implement Spaced Repetition in a more organized Experience
			// TODO: Document/structure this better

			// Every 10th questions,
			// if the user got any of the last 10 questions wrong,
			// rewind to the first question (of the last 10 questions) they got wrong

			var firstIndexWrong = null
			var resetLastTen = 0

			// Continue if we're on the 10th question
			if (index % 10 == 0 && index != 0) {
				// Loop through the last ten responses
				Object.values(responses)
					.slice(index - 10, index)
					.forEach((value, i) => {
						if (!value) {
							if (firstIndexWrong === null) {
								// Store the first question we got wrong
								firstIndexWrong = i
							}
							// Increment the number of questions we got wrong
							resetLastTen++
						}
					})

				if (resetLastTen > 0) {
					;(async () => {
						setFeedback({
							variant: 'warning',
							message: (
								<div>
									You got {resetLastTen} of the last 10 questions wrong!
									<br />
									<br />
									Rewinding to Term {firstIndexWrong + 1}, the first term you
									answered incorrectly.
								</div>
							),
						})
						setTimeout(() => {
							setIndex(firstIndexWrong)
							setFeedback({ variant: '', message: 'none' })
						}, '5000')
					})()
				}
			}
		}
	}, [index, cards])

	function validateAnswer(e) {
		if (e.key === 'Enter') {
			// Strip HTML and convert to Title Case
			let correctAnswer = toTitleCase(stripHTML(cards.term))
			let correctness = leven(answer, correctAnswer)
			if (correctness == 0) {
				answerCorrect()
			} else if (correctness <= 3 && ignoreSpelling) {
				answerCloseEnough(correctAnswer)
			} else {
				answerIncorrect()
			}

			e.stopPropagation()

			document.addEventListener('keyup', (e) => {
				if (e.key === 'Enter') next()
			})
		}
	}

	function answerCorrect() {
		setResponses({ ...responses, [index]: true })
		setFeedback({
			variant: 'success',
			message: (
				<span>
					✔️ Correct
					{index <= 5 && (
						<>
							<hr className="w-100" />
							Type <kbd>Enter</kbd> or touch this to proceed
						</>
					)}
				</span>
			),
		})
	}

	function answerCloseEnough(correctAnswer) {
		setResponses({ ...responses, [index]: true })
		setFeedback({
			variant: 'info',
			message: (
				<span>
					✔️ Correct
					<br />
					<span className="text-muted">
						You put &quot;{answer}&quot;, which is close enough to &quot;{correctAnswer}
						&quot;
					</span>
					{index <= 5 && (
						<>
							<hr className="w-100" />
							Type <kbd>Enter</kbd> or touch this to proceed
						</>
					)}
				</span>
			),
		})
	}

	function answerIncorrect() {
		setResponses({ ...responses, [index]: false })
		setFeedback({
			variant: 'danger',
			message: (
				<span>
					❌ Incorrect!
					<hr className="w-100" />
					<span className="text-muted noBottomMargin inlineP">
						<Markup content={cards.term} />
					</span>{' '}
					is the correct answer
					{index <= 5 && (
						<>
							<hr className="w-100" />
							Type <kbd>Enter</kbd> or touch this to proceed
						</>
					)}
				</span>
			),
		})
	}

	function prevCard() {
		if (index - 1 >= 0) {
			let i = index - 1
			while (blacklist.some((v) => pack.content[i].term.toLowerCase().includes(v))) {
				i--
			}
			setIndex(i)
		}
	}

	function next() {
		setFeedback({ variant: '', message: 'none' })
		setAnswer('')
		if (index + 1 < length) setIndex(index + 1)
	}

	// var enterPressed = 0
	// function nextAnswerDeferred() {
	// 	// setTimeout(() => {
	// 	// 	setFeedback({ variant: '', message: 'none' })
	// 	// 	setAnswer('')
	// 	// 	if (index + 1 < length) setIndex(index + 1)
	// 	// }, '2500')
	// 	// Reset the number of times Enter has been pressed
	// 	enterPressed = 0
	// 	document.addEventListener('keyup', (e) => {
	// 		// The first Enter keypress is used to submit the answer
	// 		if (e.key === 'Enter') {
	// 			enterPressed++
	// 			if (enterPressed == 2) {
	// 				next()
	// 			}
	// 		}
	// 	})
	// }

	return (
		<>
			<Form.Check
				type="switch"
				label="Ignore Spelling Mistakes"
				className="mt-2"
				checked={ignoreSpelling}
				onChange={(e) => setIgnoreSpelling(e.target.checked)}
			/>

			<Form.Check
				type="switch"
				label="Guided Mode"
				className="mt-2"
				checked={guided}
				onChange={(e) => {
					if (
						e.target.checked == false &&
						confirm(
							'Disabling Guided Mode will erase your progress.\n\nAre you sure you want to continue?'
						)
					) {
						setResponses({})
						setGuided(false)
					} else {
						setResponses({})
						setGuided(true)
						setIndex(0)
					}
				}}
			/>

			{!guided ? (
				<InputGroup className="w-25 mt-2">
					<Button variant={theme.color} onClick={prevCard}>
						⬅️
					</Button>
					<Button disabled variant={theme.color}>
						{index + 1}
					</Button>
					<Button
						variant={theme.color}
						onClick={() => {
							if (index + 1 < length) setIndex(index + 1)
						}}
					>
						➡️
					</Button>
				</InputGroup>
			) : (
				<Button disabled variant={theme.color} className="w-25 mt-2">
					{index + 1}
				</Button>
			)}

			<div className="d-flex justify-content-center mt-5 mb-5">
				<div>
					<h3 className="w-75 mt-5 mx-auto">
						<Markup content={cards.definition} />
					</h3>

					{feedback.message != 'none' && (
						<Alert
							className="w-75 mx-auto"
							variant={feedback.variant}
							onClick={() => {
								next()
							}}
						>
							{feedback.message}
						</Alert>
					)}

					<input
						className="w-75 mx-auto mt-3 form-control form-control-lg"
						type="text"
						placeholder="Answer"
						value={answer}
						disabled={feedback.message != 'none'}
						onChange={(e) => {
							setAnswer(toTitleCase(e.target.value))
						}}
						// autoFocus only focuses on the initial render
						ref={(input) => input && input.focus()}
						onKeyUp={validateAnswer}
					/>
				</div>
			</div>
		</>
	)
}

const Blitz = function () {
	return (
		<Experience name="blitz">
			<BlitzComponent />
		</Experience>
	)
}

export default Blitz
