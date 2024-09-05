import React, { useState, useEffect, useMemo } from 'react'

import { shallow } from 'zustand/shallow'
import { usePack } from '@/stores/pack'

import Form from 'react-bootstrap/Form'
import { stripHTML } from '@/lib/utilities'

export default function TrueOrFalse({ i, submit, save }) {
	const [cards, getSimilarCards] = usePack(
		(state) => [state.pack.content[i], state.getSimilarCards],
		shallow
	)
	const [similarTerms, setSimilarTerms] = useState([])
	// Should be a boolean when set by the user
	const [answer, setAnswer] = useState('none')
	const [qs, setQs] = useState([])
	// If this is true, we show a similar definition
	// Note that this doesn't persist through HMR
	const tf = useMemo(() => (Math.random() > 0.5 ? true : false), [])

	useEffect(() => {
		setSimilarTerms(getSimilarCards(cards, 2))
	}, [cards, getSimilarCards])

	useEffect(() => {
		if (submit) {
			if ((tf && !answer) || (!tf && answer)) {
				save(true)
				setQs(
					<>
						<span className="text-success me-2">Correct Answer!</span>
						{['True', 'False'].map((c) => (
							<Form.Check
								inline
								key={cards.uuid + c}
								label={c}
								type="radio"
								name={cards.uuid + i}
								checked={c == 'True' ? answer : !answer}
								disabled
								id={cards.uuid + c}
							/>
						))}
					</>
				)
			} else {
				save(false)
				setQs(
					<>
						<span className="text-danger me-2">Incorrect!</span>
						{['True', 'False'].map((c) => (
							<Form.Check
								inline
								key={cards.uuid + c}
								label={c}
								type="radio"
								name={cards.uuid + i}
								checked={c == 'True' ? answer : !answer}
								disabled
								id={cards.uuid + c}
							/>
						))}
					</>
				)
			}
		} else {
			setQs(
				['True', 'False'].map((c) => (
					<Form.Check
						inline
						key={cards.uuid + c}
						label={c}
						type="radio"
						name={cards.uuid + i}
						checked={c == 'True' && answer !== 'none' ? answer : !answer}
						onChange={() => setAnswer(c == 'True' ? true : false)}
						id={cards.uuid + c}
					/>
				))
			)
		}
	}, [submit, tf, answer])

	if (similarTerms?.length == 0) return <></>

	return (
		<div className={`mb-3 w-75 mx-auto card p-3`}>
			<div className="row g-0">
				<div className="col-md-6 my-auto">
					<h3 className="fw-light mb-0 p-5">
						{stripHTML(similarTerms[tf ? 1 : 0].definition)}
					</h3>
				</div>
				<div className="col-md-6 my-auto">
					<div className="card-body">
						<h3 className="card-title">{stripHTML(cards.term)}</h3>
						{qs}
					</div>
				</div>
			</div>
		</div>
	)
}
