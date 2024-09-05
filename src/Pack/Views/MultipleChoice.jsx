import React, { useEffect, useState } from 'react'

import Button from 'react-bootstrap/Button'
// import Form from 'react-bootstrap/Form'

// import { motion } from 'framer-motion'

import { usePack } from '@/stores/pack'
import { shallow } from 'zustand/shallow'
import { stripHTML } from '@/lib/utilities'

import './FlashcardView.scss'

function Answer(props) {
	var content = (
		<>
			<div className="badge bg-dark my-auto">{props.i + 1}</div> {stripHTML(props.answerText)}
		</>
	)

	if (props.correctChoice && props.wrongAnswerClicked) {
		content = (
			<>
				<div className="badge bg-success my-auto">✓</div> {stripHTML(props.answerText)}
			</>
		)
	}

	return (
		<div className="col py-3" key={props.answerText}>
			<div className="d-grid">
				<Button
					variant="light"
					onClick={() => {
						props.handleAnswerClick(props.correctChoice)
					}}
					className="d-flex justify-content-between"
				>
					{content}
				</Button>
			</div>
		</div>
	)
}

function MultipleChoice({ content, currentCard, setCurrentCard, flipped = false }) {
	const [similarTerms, setSimilarTerms] = useState([])
	const [getSimilarCards] = usePack((state) => [state.getSimilarCards], shallow)

	const [wrongAnswerClicked, clickedWrongAnswer] = useState(false)

	// TODO: why do we have a seperate function for this?
	function regenerateSimilarTerms() {
		setSimilarTerms(getSimilarCards(content))
	}

	useEffect(() => {
		// Go to the term on the next card if not in multiple choice mode
		regenerateSimilarTerms()
		clickedWrongAnswer(false)
	}, [currentCard])

	async function nextTermDelayed() {
		await new Promise((r) => setTimeout(r, 1500))
		setCurrentCard(currentCard + 1)
	}

	async function handleAnswerClick() {
		// if (!correctChoice) {
		// 	clickedWrongAnswer(true)
		// }
		clickedWrongAnswer(true)
		nextTermDelayed()
	}

	const choices = similarTerms.map((card, i) => {
		const correctChoice = card == content

		return (
			// <div className="col py-3" key={card.term}>
			// 	<div className="d-grid gap-2 col-10">
			// 		<Button
			// 			variant="light"
			// 			onClick={() => {
			// 				if (correctChoice) {
			// 					props.setCurrentCard(props.currentCard + 1)
			// 				} else {
			// 					clickedWrongAnswer(true)
			// 				}
			// 			}}
			// 			className="d-flex justify-content-between"
			// 		>
			// 			{correctChoice && wrongAnswerClicked ? (
			// 				<><div className="badge bg-success">✓</div> {card.term}</>
			// 			) : (
			// 				<><div className="badge bg-dark">{i + 1}</div> {card.term}</>
			// 			)}
			// 		</Button>
			// 	</div>
			// </div>
			<Answer
				key={card.term}
				i={i}
				correctChoice={correctChoice}
				answerText={flipped ? card.definition : card.term}
				wrongAnswerClicked={wrongAnswerClicked}
				handleAnswerClick={handleAnswerClick}
			/>
		)
	})

	return (
		<div className="mt-4 d-flex justify-content-center">
			<div className="row row-cols-1 row-cols-sm-2 gx-3">{choices}</div>
		</div>
	)
}

export default MultipleChoice
