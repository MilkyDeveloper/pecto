import React, { useState, useEffect, useContext } from 'react'

import { ThemeContext } from '@/lib/context'
import { shuffle, stripHTML } from '@/lib/utilities'
import { shallow } from 'zustand/shallow'
import { usePack } from '@/stores/pack'

import Button from 'react-bootstrap/Button'
import { Markup } from '@/lib/Markup'

export default function Question({ card, next, correct }) {
	const [getSimilarCards] = usePack((state) => [state.getSimilarCards], shallow)
	const theme = useContext(ThemeContext)
	const [similarCards, setSimilarCards] = useState([])
	const [content, setContent] = useState(null)
	const [clicked, setClicked] = useState(false)

	useEffect(() => {
		setSimilarCards(shuffle(getSimilarCards(card)))
	}, [card])

	useEffect(() => {
		setTimeout(() => {
			if (clicked) {
				if (clicked === card.uuid) {
					correct()
				} else {
					next()
				}
			}
		}, 1000)
	}, [clicked])

	useEffect(() => {
		if (similarCards === []) return
		setContent(
			similarCards.map((icard) => {
				let variant = theme.dark ? 'outline-light' : 'outline-dark'
				if (clicked && icard.uuid == card.uuid) {
					variant = 'success'
				} else if (icard.uuid === clicked) {
					variant = 'danger'
				}
				return (
					<Button
						key={icard.uuid}
						variant={variant}
						onClick={() => setClicked(icard.uuid)}
						size="lg"
					>
						{stripHTML(icard.term)}
					</Button>
				)
			})
		)
	}, [similarCards, clicked])

	return (
		<div className="mb-3 card p-3 mx-auto" style={{ minHeight: '60vh' }}>
			<div className="my-auto d-flex align-items-center justify-content-around flex-column flex-md-row me-5">
				<div>
					{/* TODO: add image support */}
					<h1 className="fw-light mb-0 p-5">
						<Markup content={card.definition} />
					</h1>
				</div>
				<div className="d-grid gap-2 w-25">{content}</div>
			</div>
		</div>
	)
}
