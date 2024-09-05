import React, { useState, useEffect } from 'react'

import { shallow } from 'zustand/shallow'
import { usePack } from '@/stores/pack'

import Form from 'react-bootstrap/Form'

import leven from 'leven'
import { stripHTML } from '@/lib/utilities'

export default function Written({ i, submit, save }) {
	const [cards] = usePack((state) => [state.pack.content[i]], shallow)
	const [answer, setAnswer] = React.useState('')
	const [qs, setQs] = useState([])

	useEffect(() => {
		if (submit) {
			let correctness = leven(answer, stripHTML(cards.term))
			if (correctness === 0) {
				save(true)
				setQs(
					<>
						<span className="text-success">Correct Answer!</span>
						<Form.Control
							size="lg"
							type="text"
							placeholder="Term"
							value={answer}
							readOnly
							disabled
						/>
					</>
				)
			} else if (correctness <= 3) {
				save(true)
				setQs(
					<>
						<span className="text-info">
							Correct Answer! {answer} was guessed to be equal to{' '}
							{stripHTML(cards.term)}.
						</span>
						<Form.Control
							size="lg"
							type="text"
							placeholder="Term"
							value={answer}
							readOnly
							disabled
						/>
					</>
				)
			} else if (correctness > 3) {
				save(false)
				setQs(
					<>
						<span className="text-danger">
							Incorrect Answer -{' '}
							<span className="text-success">{stripHTML(cards.term)}</span>
						</span>
						<Form.Control
							size="lg"
							type="text"
							placeholder="Term"
							value={answer}
							readOnly
							disabled
						/>
					</>
				)
			}
		} else {
			setQs(
				<Form.Control
					size="lg"
					type="text"
					placeholder="Term"
					value={answer}
					onChange={(e) => setAnswer(e.target.value)}
				/>
			)
		}
	}, [submit, cards, answer])

	return (
		<div className={`mb-3 w-75 mx-auto card p-1`}>
			<div className="row g-0">
				<div className="col-md-6 my-auto">
					<h3 className="fw-light mb-0 p-5">{stripHTML(cards?.definition)}</h3>
				</div>
				<div className="col-md-6 my-auto">
					<div className="card-body">{qs}</div>
				</div>
			</div>
		</div>
	)
}
