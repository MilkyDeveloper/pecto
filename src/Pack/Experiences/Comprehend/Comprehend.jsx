import React, { useState, useReducer, useContext, useRef } from 'react'

import { shallow } from 'zustand/shallow'
import { usePack } from '@/stores/pack'
import { Experience } from '../Experience'
import { useReactToPrint } from 'react-to-print'

import Table from 'react-bootstrap/Table'
import Button from 'react-bootstrap/Button'
import Spinner from 'react-bootstrap/Spinner'
import Form from 'react-bootstrap/Form'
import { Markup } from '@/lib/Markup'

import nlp from 'compromise'

import { v4 as uuidv4 } from 'uuid'
import LLMPipeline from '../LLMPipeline'
import { ThemeContext } from '@/lib/context'

const reducer = (state, action) => {
	return { ...state, [action.i]: action.q }
}

function ComprehendComponent() {
	const [pack] = usePack((state) => [state.pack], shallow)
	const [questions, setQuestions] = useReducer(reducer, {})
	const [generating, setGenerating] = useState(false)

	const [showNumber, setShowNumber] = useState(true)
	const [showTerm, setShowTerm] = useState(true)
	const [showDefinition, setShowDefinition] = useState(true)
	const [showSummary, setShowSummary] = useState(true)
	const [showQuestions, setShowQuestions] = useState(true)
	const [showAnswerBox, setShowAnswerBox] = useState(false)

	const printRef = useRef()
	const print = useReactToPrint({
		content: () => printRef.current,
	})

	const theme = useContext(ThemeContext)

	// Must be a single sentence
	// TODO: implement https://github.com/spencermountain/compromise/issues/388#issuecomment-1602804777
	function minifyDefinition(sentence, includeSubject = false) {
		// Strip HTML
		sentence = sentence.replace(/<[^>]*>?/gm, '')

		// Convert to present tense
		let doc = nlp(nlp(sentence).sentences().toPresentTense().text())

		var output = ''
		const and = uuidv4()

		// Get the parts of the sentence
		// let parts = doc.sentences().json()[0].sentence
		doc.sentences()
			.json()
			.forEach((e, i) => {
				if (e.sentence.predicate.length > 2 && e.sentence.verb.length > 2) {
					if (includeSubject) {
						output +=
							(i > 0 ? and : '') + e.sentence.subject + ' is ' + e.sentence.predicate
					} else {
						output += (i > 0 ? and : '') + e.sentence.verb + ' ' + e.sentence.predicate
					}
				}
			})

		// Remove the and placeholder if it is at the start or end of the string
		if (output.trim().startsWith(`${and} `)) output = output.substring(5)
		if (output.trim().endsWith(` ${and}`)) output = output.substring(0, output.length - 5)

		// Capitalize the first letter
		output = output.charAt(0).toUpperCase() + output.slice(1)
		output = output.replaceAll(and, ' and ')

		return output
	}

	// function toPresentTense(text) {
	// 	text = text.replace(/<[^>]*>?/gm, '')
	// 	let doc = nlp(text)
	// 	// ignore spaces when calculating equality
	// 	if (
	// 		doc.sentences().toPresentTense().text().trim().replaceAll(' ', '') !=
	// 		text.trim().replaceAll(' ', '')
	// 	) {
	// 		return text
	// 	}
	// }

	async function generateQuestions() {
		const questionizer = await LLMPipeline.getInstance()
		for (const [index, card] of pack.content.entries()) {
			console.log(`Started ${index}`)
			setQuestions({ i: index, q: await questionizer(card.definition, card.term) })
			console.log(`Finished ${index}`)
		}
	}

	return (
		<>
			<div className="text-center">
				<h1>Comprehend</h1>
				<p className="mb-3">
					Generate cheat sheets, summaries, or worksheets using Artificial Intelligence
					and Natural Language Processing
				</p>
				<div className="d-flex justify-content-center">
					<Button
						variant={theme.dark ? 'light' : 'dark'}
						size="lg"
						className="mb-3 me-2"
						onClick={async () => {
							setGenerating(true)
							setTimeout(async () => {
								await generateQuestions()
								setGenerating(false)
							}, 500)
						}}
					>
						{generating ? (
							<>
								<Spinner size="sm" /> Generating (can take up to a minute)
							</>
						) : (
							'🏭 Generate Questions'
						)}
					</Button>
					<Button
						size="lg"
						className="mb-3"
						variant={theme.dark ? 'light' : 'dark'}
						onClick={print}
					>
						🖨️ Print
					</Button>
				</div>
			</div>

			<div className="mb-2">
				<Form.Check
					type="checkbox"
					label="Number"
					inline
					checked={showNumber}
					onChange={(e) => setShowNumber(e.target.checked)}
				/>
				<Form.Check
					type="checkbox"
					label="Term"
					inline
					checked={showTerm}
					onChange={(e) => setShowTerm(e.target.checked)}
				/>
				<Form.Check
					type="checkbox"
					label="Definition"
					inline
					checked={showDefinition}
					onChange={(e) => setShowDefinition(e.target.checked)}
				/>
				<Form.Check
					type="checkbox"
					label="Summary"
					inline
					checked={showSummary}
					onChange={(e) => setShowSummary(e.target.checked)}
				/>
				<Form.Check
					type="checkbox"
					label="Questions"
					inline
					checked={showQuestions}
					onChange={(e) => setShowQuestions(e.target.checked)}
				/>
				<Form.Check
					type="checkbox"
					label="Answer Box"
					inline
					checked={showAnswerBox}
					onChange={(e) => setShowAnswerBox(e.target.checked)}
				/>
			</div>

			<Table striped bordered className="mx-auto" ref={printRef}>
				<thead>
					<tr>
						{showNumber && <th>#</th>}
						{showTerm && <th>Term</th>}
						{showDefinition && <th>Definition</th>}
						{showSummary && <th>Summary</th>}
						{showQuestions && <th>Questions</th>}
						{showAnswerBox && <th>Answer Box</th>}
					</tr>
				</thead>
				<tbody>
					{pack.content.map((card, index) => {
						return (
							<tr key={index}>
								{showNumber && <td>{index + 1}</td>}
								{showTerm && (
									<td>
										<Markup content={card.term} />
									</td>
								)}
								{showDefinition && (
									<td>
										<Markup content={card.definition} />
									</td>
								)}
								{showSummary && <td>{minifyDefinition(card.definition)}</td>}
								{showQuestions && <td>{questions[index]}</td>}
								{showAnswerBox && (
									<td className="w-25">
										{[...Array(10)].map((_, i) => (
											<br key={i} />
										))}
									</td>
								)}
							</tr>
						)
					})}
				</tbody>
			</Table>
		</>
	)
}

const Comprehend = function () {
	return (
		<Experience name="comprehend">
			<ComprehendComponent />
		</Experience>
	)
}

export default Comprehend
