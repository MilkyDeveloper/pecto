import React, { useEffect, useState, useMemo } from 'react'

import Button from 'react-bootstrap/Button'
import Form from 'react-bootstrap/Form'
import Modal from 'react-bootstrap/Modal'
import ProgressBar from 'react-bootstrap/ProgressBar'

import { useUser } from '@/stores/user'
import { saveStarred, usePack } from '@/stores/pack'
import { shallow } from 'zustand/shallow'
import { Markup } from '@/lib/Markup'

import './FlashcardView.scss'

import MultipleChoice from './MultipleChoice'
import { shuffle as shuffleFunction } from '@/lib/utilities'
import { motion } from 'framer-motion'

function smallText(text) {
	return text.length > 150 || text.split('<p>').length > 3 || text.includes('<h')
}

function Definition({ content, setProgress }) {
	const [subcard, setSubcard] = useState(0)

	function handleSubcardKey(e) {
		if (e.key === 'd' && subcard + 1 < content.length) {
			setSubcard(subcard + 1)
		} else if (e.key === 'a' && subcard - 1 >= 0) {
			setSubcard(subcard - 1)
		}
	}

	useEffect(() => {
		document.addEventListener('keydown', handleSubcardKey)

		return () => document.removeEventListener('keydown', handleSubcardKey)
	}, [subcard, content, setSubcard, handleSubcardKey])

	useEffect(() => {
		if (content.length > 1) {
			setProgress(
				<div className="w-75 mx-auto my-3 d-flex justify-content-between align-items-center">
					<kbd className="mx-2 badge text-bg-secondary">A</kbd>
					<ProgressBar
						variant="secondary"
						className="w-100"
						now={((subcard + 1) / content.length) * 100}
					/>
					<kbd className="mx-2 badge text-bg-secondary">D</kbd>
				</div>
			)
		}
	}, [subcard, setProgress])

	return (
		<div className={smallText(content[subcard]) ? 'fcTextSmall' : 'fcTextBig'}>
			<Markup dark content={content[subcard]} />
		</div>
	)
}

export function FlashcardView() {
	const [user] = useUser((state) => [state.user], shallow)
	const [pack, editing] = usePack((state) => [state.pack, state.editing], shallow)
	const [currentCard, setCurrentCard] = useState(0)
	const [switchedTerm, setSwitchedTerm] = useState(false)
	const [shuffle, setShuffle] = useState(false)
	const [starred, setStarred] = useState(false)
	const content = useMemo(
		() => (shuffle ? shuffleFunction(pack.content) : pack.content),
		[pack, shuffle]
	)

	// Term/Definition switch click
	const [showDefinition, setShowDefinition] = useState(false)

	// Options
	const [showOptions, setShowOptions] = useState(false)
	const [mcqMode, setMcqMode] = useState(false)
	const [seperation, setSeperation] = useState(true)

	// This is messy but it works
	const [progress, setProgress] = useState(<></>)

	// Arrow Keys Navigation
	function handleKey(e) {
		if (e.key === 'ArrowRight' && currentCard + 1 < content.length) {
			setShowDefinition(mcqMode)
			setCurrentCard(currentCard + 1)
		} else if (e.key === 'ArrowLeft' && currentCard - 1 >= 0) {
			setShowDefinition(mcqMode)
			setCurrentCard(currentCard - 1)
		} else if (e.key === ' ' && !mcqMode) {
			e.preventDefault()
			setShowDefinition(!showDefinition)
		}
	}

	// All state referenced must be in the dependency array
	useEffect(() => {
		if (!editing) {
			document.addEventListener('keydown', handleKey)
		}
		return () => {
			document.removeEventListener('keydown', handleKey)
		}
	}, [mcqMode, editing, currentCard, showDefinition])

	// Reset stars indicator
	useEffect(() => {
		setStarred(
			localStorage.getItem(`starred-${pack.uuid}-${content[currentCard].uuid}`) === 'true'
		)
	}, [pack, currentCard])

	// Reset progress bar
	useEffect(() => {
		if (!showDefinition || !seperation) setProgress(<></>)
	}, [currentCard, showDefinition, seperation])

	if (content.length == 0) {
		return (
			<div className="container bg-dark text-light rounded-3 py-4 shadow-lg mt-3">
				<div className="container">
					<h3 className="text-center text-muted">No cards match your filters</h3>
				</div>
			</div>
		)
	}

	return (
		<>
			<Modal show={showOptions} onHide={() => setShowOptions(false)}>
				<Modal.Header closeButton>
					<Modal.Title>Flashcard Options</Modal.Title>
				</Modal.Header>
				<Modal.Body>
					<h5>Presentation and Order</h5>
					<Form.Check
						className="me-3"
						type="switch"
						label="Switch Term and Definition"
						checked={switchedTerm}
						onChange={(e) => setSwitchedTerm(e.target.checked)}
					/>
					<Form.Check
						type="switch"
						label="Shuffle"
						checked={shuffle}
						onChange={(e) => setShuffle(e.target.checked)}
					/>
					<div className="d-flex justify-content-between align-content-center">
						<Form.Check
							type="switch"
							label="Card Seperation"
							checked={seperation}
							className="me-2"
							inline
							onChange={(e) => setSeperation(e.target.checked)}
						/>
						<span className="badge bg-secondary my-auto">
							✨ Make flashcards with multiple sides!
						</span>
					</div>
					<h5>Assesment</h5>
					<Form.Check
						className="me-3"
						type="switch"
						label="Multiple Choice Mode"
						checked={mcqMode}
						onChange={(e) => {
							if (content.length >= 4) {
								setShowDefinition(false)
								setMcqMode(e.target.checked)
							} else {
								alert('Add at least 4 cards to enable Multiple Choice mode')
							}
							if (e.target.checked == true) setShowDefinition(true)
						}}
					/>
				</Modal.Body>
			</Modal>
			<div className="container bg-dark text-light rounded-3 py-4 shadow-lg mt-3">
				<div className="container">
					{/* Mode Options */}
					<div className="d-flex justify-content-between align-items-center mb-4 flex-wrap">
						<div>
							<Button variant="dark" onClick={() => setShowOptions(true)}>
								⚙️
							</Button>
						</div>
						<div>
							<b className="text-secondary me-2 align-middle">TERM</b>
							<Button
								variant={starred ? 'secondary' : 'dark'}
								onClick={() => {
									setStarred(!starred)
									saveStarred(
										!starred,
										pack.uuid,
										content[currentCard].uuid,
										user?.uid
									)
								}}
							>
								⭐
							</Button>
						</div>
					</div>

					{/* Flashcard */}
					<motion.div
						key={content[currentCard][showDefinition ? 'definition' : 'term']}
						className="shadow rounded-3 bg-secondary mx-auto text-center d-flex justify-content-center px-5 align-items-center flashCard"
						onClick={() => {
							if (!mcqMode) setShowDefinition(!showDefinition)
						}}
						initial={{
							x: showDefinition ? -50 : 0,
							y: showDefinition ? 0 : 50,
							opacity: showDefinition ? 1 : 0.75,
						}}
						animate={{ x: 0, y: 0, opacity: 1 }}
						transition={{ duration: 1, type: 'spring', bounce: 0.5 }}
						whileHover={{ scale: 1.1 }}
						whileTap={{ scale: 0.9 }}
					>
						{(showDefinition && !switchedTerm) || (!showDefinition && switchedTerm) ? (
							<Definition
								content={
									seperation
										? content[currentCard]['definition']
												.split(';')
												.map((e) => e.trim())
										: [content[currentCard]['definition']]
								}
								setProgress={setProgress}
							/>
						) : (
							<div
								className={
									smallText(content[currentCard]['term'])
										? 'fcTextSmall'
										: 'fcTextBig'
								}
							>
								{content[currentCard]?.picture !== undefined && (
									<img
										className="w-100 mb-5 rounded-3 shadow"
										src={content[currentCard]['picture']}
									></img>
								)}
								<Markup dark content={content[currentCard]['term']} />
							</div>
						)}
					</motion.div>

					{progress}

					{/* Multiple Choice */}
					{mcqMode && (
						<MultipleChoice
							content={content[currentCard]}
							currentCard={currentCard}
							setCurrentCard={setCurrentCard}
							flipped={switchedTerm}
						/>
					)}

					{/* Messy controls */}
					<div
						className="d-flex justify-content-evenly align-content-center mt-5"
						key={currentCard}
					>
						{currentCard - 1 < 0 ? (
							<Button variant="light" disabled>
								Previous
							</Button>
						) : (
							<Button
								variant="light"
								onClick={() => {
									setShowDefinition(false)
									setCurrentCard(currentCard - 1)
								}}
							>
								Previous
							</Button>
						)}

						{/* Current Card */}
						<span className="my-auto">
							{currentCard + 1}/{content.length}
						</span>

						{currentCard + 1 >= content.length ? (
							<Button variant="light" disabled>
								Next
							</Button>
						) : (
							<Button
								variant="light"
								onClick={() => {
									setShowDefinition(false)
									setCurrentCard(currentCard + 1)
								}}
							>
								Next
							</Button>
						)}
					</div>
				</div>
			</div>
		</>
	)
}
