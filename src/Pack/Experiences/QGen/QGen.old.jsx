import React, { useEffect, useState, useReducer, useContext } from 'react'

import { shallow } from 'zustand/shallow'
import { usePack } from '@/stores/pack'
import { ThemeContext } from '@/lib/context'
import { Experience } from '../Experience'

import Table from 'react-bootstrap/Table'
import Button from 'react-bootstrap/Button'
import { Markup } from '@/lib/Markup'

import LLMPipeline from '../LLMPipeline'

const reducer = (state, action) => {
	return { ...state, [action.uuid]: action.q }
}

function QGenComponent() {
	const [pack] = usePack((state) => [state.pack], shallow)
	const [q, setQ] = useReducer(reducer, {})

	const theme = useContext(ThemeContext)

	async function genQuestion(specific = false) {
		const questionizer = await LLMPipeline.getInstance()
		pack.content.forEach(async (card, _i) => {
			if (specific === false || specific === _i) {
				console.log(`Started ${_i}`)
				setQ({ uuid: card.uuid, q: await questionizer(card.definition, card.term) })
				console.log(`Finished ${_i}`)
			}
		})
	}

	return (
		<>
			<div className="text-center">
				<h1>QGen</h1>
				<p className="mb-3">
					Generate short-answer test questions through a locally-run LLM
				</p>
				{/* <Button
					variant="dark"
					size="lg"
					className="mb-4"
					onClick={() =>
						alert(
							'Not implemented yet!\n\nAll AI results should already be shown in the rightmost columns below.'
						)
					}
				>
					🏭 Generate
				</Button> */}
			</div>

			<Table striped bordered className="mx-auto">
				<thead>
					<tr>
						<th>#</th>
						<th>Term</th>
						<th>Definition</th>
						{/* <th>Present Tense</th> */}
						<th>Question</th>
					</tr>
				</thead>
				<tbody>
					{pack.content.map((card, index) => (
						<tr key={index}>
							<td>{index + 1}</td>
							<td>
								<Markup content={card.term} />
							</td>
							<td>
								<Markup content={card.definition} />
							</td>
							<td>
								{q[card.uuid] === undefined ? (
									<Button
										variant={theme.dark ? 'light' : 'dark'}
										onClick={() => genQuestion(index)}
									>
										Generate {index + 1}
									</Button>
								) : (
									q[card.uuid]
								)}
							</td>
						</tr>
					))}
				</tbody>
			</Table>
		</>
	)
}

const QGen = function () {
	return (
		<Experience name="qgen">
			<QGenComponent />
		</Experience>
	)
}

export default QGen
