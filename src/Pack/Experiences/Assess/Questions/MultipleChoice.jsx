import React, { useState, useEffect } from 'react'

import { shallow } from 'zustand/shallow'
import { usePack } from '@/stores/pack'
import { stripHTML } from '@/lib/utilities'

export default function MultipleChoice({ i, hard, submit, save }) {
	const [cards, getSimilarCards] = usePack(
		(state) => [state.pack.content[i], state.getSimilarCards],
		shallow
	)
	const [similarTerms, setSimilarTerms] = useState([])
	const [answer, setAnswer] = useState('')
	const [qs, setQs] = useState([])

	useEffect(() => {
		if (cards !== undefined) setSimilarTerms(getSimilarCards(cards, hard ? 8 : 4))
	}, [cards, getSimilarCards])

	useEffect(() => {
		if (cards !== undefined) {
			setQs(
				similarTerms.map((card, i) => (
					<li key={card.uuid + cards.uuid + i} className="list-group-item bg-transparent">
						{(() => {
							// TODO: Refactor this into a seperate function with arguments for card and cards

							// Submitted
							if (submit) {
								// Correct Answer
								if (card.uuid === cards.uuid) {
									if (answer == cards.uuid) {
										// Correct Answer selected
										save(true)
										return (
											<>
												<input
													className="form-check-input me-3"
													type="radio"
													name={cards.uuid}
													checked
													readOnly
													id={card.uuid + cards.uuid}
												/>
												<label
													className="form-check-label stretched-link text-success"
													htmlFor={card.uuid + cards.uuid}
												>
													Correct Answer - {stripHTML(card.term)}
												</label>
											</>
										)
									} else {
										// Correct Answer not selected
										save(false)
										return (
											<>
												<input
													className="form-check-input me-3"
													type="radio"
													name={cards.uuid}
													disabled
													id={card.uuid + cards.uuid}
												/>
												<label
													className="form-check-label stretched-link text-danger"
													htmlFor={card.uuid + cards.uuid}
												>
													Correct Answer - {stripHTML(card.term)}
												</label>
											</>
										)
									}
								} else if (answer === card.uuid) {
									// Incorrect Answer
									return (
										<>
											<input
												className="form-check-input me-3"
												type="radio"
												name={cards.uuid}
												id={card.uuid + cards.uuid}
												checked
												readOnly
												disabled
											/>
											<label
												className="form-check-label stretched-link text-danger"
												htmlFor={card.uuid + cards.uuid}
											>
												❌ {stripHTML(card.term)}
											</label>
										</>
									)
								} else {
									// Any answer
									return (
										<>
											<input
												className="form-check-input me-3"
												type="radio"
												name={cards.uuid}
												id={card.uuid + cards.uuid}
												value={card.uuid}
												readOnly
												disabled
											/>
											<label
												className="form-check-label stretched-link"
												htmlFor={card.uuid + cards.uuid}
											>
												{stripHTML(card.term)}
											</label>
										</>
									)
								}
							} else {
								// Not Submitted
								return (
									<>
										<input
											className="form-check-input me-3"
											type="radio"
											name={cards.uuid}
											id={card.uuid + cards.uuid}
											value={card.uuid}
											onChange={(e) => setAnswer(e.target.value)}
										/>
										<label
											className="form-check-label stretched-link"
											htmlFor={card.uuid + cards.uuid}
										>
											{stripHTML(card.term)}
										</label>
									</>
								)
							}
						})()}
					</li>
				))
			)
		}
	}, [similarTerms, submit, cards, answer, save])

	return (
		<div className="mb-3 w-75 mx-auto card p-3">
			<div className="row g-0">
				<div className="col-md-6 my-auto">
					<h3 className="fw-light mb-0 p-5">{stripHTML(cards?.definition)}</h3>
				</div>
				<div className="col-md-6 my-auto">
					<ul className="list-group list-group-flush">{qs}</ul>
				</div>
			</div>
		</div>
	)
}
