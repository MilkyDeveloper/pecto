import React, { useState, useMemo, useReducer, useRef } from 'react'

import { shallow } from 'zustand/shallow'
import { usePack } from '@/stores/pack'
import { useReactToPrint } from 'react-to-print'

import { shuffle } from '@/lib/utilities'

import Button from 'react-bootstrap/Button'
import ProgressBar from 'react-bootstrap/ProgressBar'

import MultipleChoice from './Questions/MultipleChoice'
import TrueOrFalse from './Questions/TrueOrFalse'
import Written from './Questions/Written'

// We have to use a reducer since the next state depends on the previous state,
// and state updates are called at the same time (submit)

const initialState = { answers: {} }

function reducer(state, action) {
	let answers = { ...state.answers, [action.payload.i]: action.payload.val }
	let arr = Object.values(answers)
	let sum = arr.reduce((a, b) => a + b)
	let right = (sum / arr.length) * 100
	let wrong = ((arr.length - sum) / arr.length) * 100
	return {
		answers: answers,
		right: right,
		wrong: wrong,
		fraction: `${sum}/${arr.length}`,
		percentage: Math.round((sum / arr.length) * 100 * 100) / 100,
	}
}

export function Test({ questions, paper }) {
	const [content] = usePack((state) => [state.pack.content], shallow)
	const [submit, setSubmit] = useState(false)
	const [answers, dispatch] = useReducer(reducer, initialState)

	// Only randomize the questions once
	const randomContent = useMemo(() => shuffle(content), [questions])
	const questionList = useMemo(() => questionGenerator(), [submit, randomContent])

	const printRef = useRef()
	const print = useReactToPrint({
		content: () => printRef.current,
	})

	function questionGenerator(submitQ = submit, interactive = false) {
		return randomContent.slice(0, questions.total).map((card, i) => {
			// TODO: Fix repetition
			if (i < questions.mcq) {
				return (
					<div key={i}>
						<MultipleChoice
							i={i}
							submit={submitQ}
							save={
								interactive
									? (val) => dispatch({ payload: { i: i, val: val } })
									: () => {}
							}
						/>
					</div>
				)
			} else if (i < questions.mcq + questions.written) {
				return (
					<div key={i}>
						<Written
							key={i}
							i={i}
							submit={submitQ}
							save={
								interactive
									? (val) => dispatch({ payload: { i: i, val: val } })
									: () => {}
							}
						/>
						{!interactive && <div className="page-break" />}
					</div>
				)
			} else if (i < questions.mcq + questions.written + questions.tfq) {
				return (
					<div key={i}>
						<TrueOrFalse
							key={i}
							i={i}
							submit={submitQ}
							save={
								interactive
									? (val) => dispatch({ payload: { i: i, val: val } })
									: () => {}
							}
						/>
						{!interactive && <div className="page-break" />}
					</div>
				)
			} else if (i < questions.mcq + questions.written + questions.tfq + questions.hmcq) {
				return (
					<div key={i}>
						<MultipleChoice
							key={i}
							i={i}
							submit={submitQ}
							hard
							save={
								interactive
									? (val) => dispatch({ payload: { i: i, val: val } })
									: () => {}
							}
						/>
						{!interactive && <div className="page-break" />}
					</div>
				)
			}
		})
	}

	if (paper) {
		return (
			<>
				<style type="text/css" media="print">
					{`
					@media all {
						.page-break {
							display: none;
						}
					}
					
					@media print {
						html,
						body {
							height: initial !important;
							overflow: initial !important;
							print-color-adjust: exact;
						}
						@page {
							size: 210mm 1250mm;
						}
					}
					
					@media print {
						.page-break {
							margin-top: 1rem;
							display: block;
							page-break-before: auto;
						}
					}
					
					@page {
						size: auto;
						margin: 20mm;
					}
					`}
				</style>
				<div className="d-flex mb-4">
					<Button size="lg" className="mx-auto" onClick={print}>
						Print Test
					</Button>
				</div>
				<div ref={printRef}>
					{questionGenerator(false)}
					<hr />
					{[...Array(25)].map((_, i) => (
						<div key={i}>
							<h5
								className="text-center"
								style={{
									color: `rgb(${255 - Math.random() * 100}, ${
										255 - Math.random() * 100
									}, ${255 - Math.random() * 100})`,
								}}
							>
								TEST FINISHED
							</h5>
							<hr />
						</div>
					))}
					{questionGenerator(true)}
				</div>
			</>
		)
	} else {
		return (
			<>
				{questionList}
				<Button
					className="mb-3 mx-auto d-block"
					variant="primary"
					size="lg"
					onClick={() => setSubmit(true)}
					disabled={submit}
				>
					Submit
				</Button>
				{submit && (
					<div className="text-center">
						<hr />
						{answers.percentage < 75 ? (
							<p>Use the Blitz or Master mode to guarantee memorization!</p>
						) : (
							<>
								<h1>🎉</h1>
								<h2>You got {answers.percentage} percent!</h2>
							</>
						)}
						<hr className="mb-3" />
						<h3>{answers.fraction}</h3>
						<ProgressBar className="mb-3">
							<ProgressBar
								striped
								animated
								variant="success"
								now={answers.right}
								key={1}
							/>
							<ProgressBar
								striped
								animated
								variant="danger"
								now={answers.wrong}
								key={2}
							/>
						</ProgressBar>
					</div>
				)}
			</>
		)
	}
}
