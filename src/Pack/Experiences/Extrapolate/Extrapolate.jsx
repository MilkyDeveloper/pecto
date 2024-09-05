import React, { useState, useEffect, useRef, useContext, useReducer } from 'react'

import { shallow } from 'zustand/shallow'
import { usePack } from '@/stores/pack'
import { Experience } from '../Experience'

import Table from 'react-bootstrap/Table'
import Button from 'react-bootstrap/Button'
import Form from 'react-bootstrap/Form'
import FloatingLabel from 'react-bootstrap/FloatingLabel'
import Accordion from 'react-bootstrap/Accordion'
import Alert from 'react-bootstrap/Alert'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'

import { useParams } from 'react-router-dom'
import { useUser } from '@/stores/user'
import { ThemeContext } from '@/lib/context'

import { createCategory, generateCards } from './NLP'
import LLMPipeline from '../LLMPipeline'
import { capitalizeFirstLetter } from '@/lib/utilities'
import { v4 as uuidv4 } from 'uuid'
import Tesseract from 'tesseract.js'

function InputWrapper({ value, save }) {
	const ref = useRef(null)

	useEffect(() => {
		resize()
	}, [])

	// Automatically resizes textareas
	function resize() {
		ref.current.style.height = 'inherit'
		ref.current.style.height = `${ref.current.scrollHeight + 2}px`
	}

	return (
		<Form.Control
			type="text"
			value={value}
			as="textarea"
			ref={ref}
			onChange={(e) => {
				save(e)
				resize()
			}}
		/>
	)
}

function reducer(state, action) {
	let cards
	if (Array.isArray(action)) {
		cards = action
	} else if (typeof action === 'object') {
		cards = [...state.cards]
		let found = false
		cards.forEach((card, i) => {
			if (card.term == action.term) {
				cards[i].definition = `${cards[i].definition}. ${action.definition}`
				found = true
			}
		})
		if (found) return { cards: cards }
		cards = [...state.cards, action]
	}
	return { cards: cards }
}

class OCR {
	static instance = null

	static async getInstance() {
		if (this.instance === null) this.instance = await Tesseract.createWorker()

		return this.instance
	}
}

function ExtrapolateComponent() {
	const [newPack] = useUser((state) => [state.newPack], shallow)
	const [pack, addCategory] = usePack((state) => [state.pack, state.addCategory], shallow)
	const theme = useContext(ThemeContext)

	const { packId } = useParams()

	const [category, setCategory] = useState('Default')
	const [text, setText] = useState('')
	const [imagePreview, setImagePreview] = useState('')
	const [cards, dispatch] = useReducer(reducer, { cards: [] })
	const [removeSubject, setRemoveSubject] = useState(true)

	async function generateTerm() {
		// Create a new category if one doesn't exist
		const uuid = createCategory(category, addCategory)

		// Load the LLM
		const condenser = await LLMPipeline.getInstance()

		// Make a new flashcard for each newline
		let split = text.split('\n')
		split.forEach(async (paragraph) => {
			let term = capitalizeFirstLetter(await condenser(paragraph))
			let definition = capitalizeFirstLetter(paragraph)

			// Remove the subject from the definition
			term.split(' ').forEach((w) => (definition = definition.replaceAll(w, '')))

			// Push changes
			dispatch({
				term: term,
				definition: definition,
				category: uuid,
				uuid: uuidv4(),
			})
		})
	}

	async function saveCards() {
		dispatch([])
		setText('')
		let p = { ...pack }
		// For whatever reason p.content.push(..cards)
		// gives us an "Object is not extensible" error
		p.content = p.content.concat(cards.cards)
		await newPack(packId, p)
	}

	async function handleBlob(blob) {
		setImagePreview(URL.createObjectURL(blob))
		const worker = await OCR.getInstance()
		await worker.loadLanguage('eng')
		await worker.initialize('eng')
		const {
			data: { text },
		} = await worker.recognize(blob)
		setText(text)
		await worker.terminate()
	}

	useEffect(() => {
		document.addEventListener('paste', async (e) => {
			const clipboardItems =
				typeof navigator?.clipboard?.read === 'function'
					? await navigator.clipboard.read()
					: e.clipboardData.files

			for (const clipboardItem of clipboardItems) {
				let blob
				if (clipboardItem.type?.startsWith('image/')) {
					// For files from `e.clipboardData.files`.
					blob = clipboardItem
					handleBlob(blob)
				} else {
					// For files from `navigator.clipboard.read()`.
					const imageTypes = clipboardItem.types?.filter((type) =>
						type.startsWith('image/')
					)
					for (const imageType of imageTypes) {
						blob = await clipboardItem.getType(imageType)
						handleBlob(blob)
					}
				}
			}
		})

		return () => {
			document.removeEventListener('paste', () => {})
		}
	}, [setImagePreview])

	return (
		<>
			<div className="text-center mt-5">
				<h1>Extrapolate</h1>
				<p className="mb-3">Enter text to automatically generate cards through AI</p>

				<FloatingLabel label="Category">
					<Form.Control
						type="text"
						value={category}
						onChange={(e) => {
							setCategory(e.target.value)
						}}
						className="mb-3"
					/>
				</FloatingLabel>

				<Row className="mb-3">
					<Col sm={9}>
						<FloatingLabel label="Excerpt" className="h-100">
							<InputWrapper value={text} save={(e) => setText(e.target.value)} />
						</FloatingLabel>
					</Col>
					<Col sm={3} className="d-grid">
						<Form.Group controlId="formFile" className="mb-3">
							<Form.Label>Drag, paste, or upload an image file</Form.Label>
							<Form.Control
								type="file"
								accept=".bmp,.jpg,.png,.pbm,.webp"
								onChange={(e) => handleBlob(e.target.files[0])}
							/>
						</Form.Group>
					</Col>
				</Row>

				<img src={imagePreview} className="img-fluid mb-3" />

				<Alert variant="info" className="text-start">
					<h5>★ Lightweight NLP</h5>
					<p>
						Uses a complex algorithm to generate cards based on sentence structure, but
						fails to use context for finding the sentence&apos;s subject.
					</p>
					<h5>Optimized LLM</h5>
					<p className="mb-0">
						Infers the subject of a sentence through the FLAN-T5 LLM, making it useful
						for extracting information from complicated paragraphs.
					</p>
				</Alert>

				<Accordion defaultActiveKey="0" flush className="mt-3 mb-5">
					<Accordion.Item eventKey="0">
						<Accordion.Header>Lightweight NLP</Accordion.Header>
						<Accordion.Body>
							<Button
								variant={theme.dark ? 'light' : 'dark'}
								size="lg"
								onClick={() => generateCards(text, category, addCategory, dispatch)}
								className="mt-3 mb-3"
							>
								🏭 Generate
							</Button>
						</Accordion.Body>
					</Accordion.Item>
					<Accordion.Item eventKey="1">
						<Accordion.Header>Optimized LLM</Accordion.Header>
						<Accordion.Body>
							<div className="d-flex justify-content-center">
								<Form.Check
									type="switch"
									label="Remove Subject from Definition"
									checked={removeSubject}
									onChange={(e) => setRemoveSubject(e.target.checked)}
								/>
							</div>
							<Button
								variant={theme.dark ? 'light' : 'dark'}
								size="lg"
								onClick={generateTerm}
								className="mt-3 mb-3"
							>
								⚒️ Generate
							</Button>
						</Accordion.Body>
					</Accordion.Item>
				</Accordion>
			</div>

			{cards.cards.length > 0 && (
				<>
					<Table striped bordered>
						<thead>
							<tr>
								<th>#</th>
								<th>Term</th>
								<th>Definition</th>
							</tr>
						</thead>
						<tbody>
							{cards.cards.map((card, index) => {
								return (
									<tr key={index}>
										<td>{index + 1}</td>
										<td>
											<InputWrapper
												value={card.term}
												save={(e) => {
													// We can use the spread syntax because this is synchronous
													let t = [...cards.cards]
													t[index].term = e.target.value
													dispatch(t)
												}}
											/>
										</td>
										<td>
											<InputWrapper
												value={card.definition}
												save={(e) => {
													let t = [...cards.cards]
													t[index].definition = e.target.value
													dispatch(t)
												}}
											/>
										</td>
									</tr>
								)
							})}
						</tbody>
					</Table>

					<div className="text-center mb-5">
						<Button variant={theme.color} size="lg" onClick={saveCards}>
							➕ Add to pack
						</Button>
					</div>
				</>
			)}
		</>
	)
}

const Extrapolate = function () {
	return (
		<Experience name="extrapolate" showFilter={false}>
			<ExtrapolateComponent />
		</Experience>
	)
}

export default Extrapolate
