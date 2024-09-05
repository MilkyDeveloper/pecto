import React, { useEffect, useState, useContext } from 'react'

import { shallow } from 'zustand/shallow'
import { usePack } from '@/stores/pack'
import { useUser } from '@/stores/user'
import { ThemeContext } from '@/lib/context'
import { useIntervals, cycleModifier } from './stores/intervals'

import { Experience } from '../Experience'

import Button from 'react-bootstrap/Button'
import Form from 'react-bootstrap/Form'
import FloatingLabel from 'react-bootstrap/FloatingLabel'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Alert from 'react-bootstrap/Alert'

// import { Markup } from '@/lib/Markup'

import './Master.scss'
import Questioner from './Questioner'
import { syncLocalStorage } from '@/lib/firebase'

function MasterComponent() {
	const [user] = useUser((state) => [state.user], shallow)
	const [pack] = usePack((state) => [state.pack], shallow)
	const [intervals, setPostSave, initialize, generateIntervals] = useIntervals(
		(state) => [state.intervals, state.setPostSave, state.initialize, state.generateIntervals],
		shallow
	)
	const theme = useContext(ThemeContext)

	const [days, setDays] = useState(5)
	const [difficulty, setDifficulty] = useState(3)
	const [valid, setValid] = useState(false)
	const [message, setMessage] = useState('')

	// Initialize local storage
	useEffect(() => {
		initialize(pack.uuid)
	}, [])

	// Sync to firebase if logged in
	useEffect(() => {
		setPostSave(user?.uid ? () => syncLocalStorage(user.uid) : () => {})
	}, [user])

	// Validate the form
	useEffect(() => {
		console.log(cycleModifier(pack.content.length))
		if (days == 0) {
			setValid(false)
			setMessage('Days must be larger than 0')
		} else if (days * difficulty * cycleModifier(pack.content.length) < 3) {
			setValid(false)
			setMessage('')
			setDifficulty(Number(difficulty) + 1)
		} else {
			setValid(true)
		}
	}, [days, difficulty])

	if (pack.content.length < 30) {
		return (
			<>
				<div className="text-center">
					<h1>Master</h1>
					<p className="mb-3">
						Build your long-term memory with personalized spaced repetition algorithms
					</p>
					<p className="mb-3">You need at least 30 cards to use this feature.</p>
				</div>
			</>
		)
	}

	if (!intervals || Object.keys(intervals) == 0) {
		return (
			<>
				<div className="text-center">
					<h1>Master</h1>
					<p className="mb-3">
						Build your long-term memory with personalized spaced repetition algorithms
					</p>

					<div className="w-75 mx-auto border p-4 rounded-3 text-start">
						<h3 className="mt-1 mb-3">Configuration</h3>
						<Form>
							<Row className="g-3">
								<Col xs={4}>
									Pecto&apos;s algorithm is optimized for studying at least 3 days
									in advance
								</Col>
								<Col>
									<FloatingLabel
										className="h-75 mb-3"
										label="Days until your test, including today"
									>
										<Form.Control
											type="number"
											min={1}
											value={days}
											onChange={(e) => setDays(e.target.value)}
										/>
									</FloatingLabel>
								</Col>
							</Row>
							<Row className="g-3">
								<Col xs={4} className="pe-0">
									The algorithm, a Leitner System augmented with parameterization,
									accepts different rigor values that determine how many cycles
									are generated.
								</Col>
								<Col>
									<FloatingLabel label="Difficulty" className="h-50">
										<Form.Control
											type="number"
											className="mb-3 h-100"
											min={1}
											value={difficulty}
											onChange={(e) => setDifficulty(e.target.value)}
										/>
									</FloatingLabel>
								</Col>
								<Col>
									{valid ? (
										<Button
											className="w-100 h-50"
											variant={theme.dark ? 'light' : 'dark'}
											onClick={() =>
												generateIntervals(days * difficulty, pack.content)
											}
										>
											Get Started
										</Button>
									) : (
										<Alert variant="danger">{message}</Alert>
									)}
								</Col>
							</Row>
						</Form>
					</div>
				</div>
			</>
		)
	}

	return (
		<>
			<Questioner />
			<Button
				variant="danger"
				onClick={async () => {
					localStorage.removeItem(`boxes_${pack.uuid}`)
					localStorage.removeItem(`intervals_${pack.uuid}`)
					await syncLocalStorage(user?.uid)
					window.location.reload()
				}}
			>
				Reset
			</Button>
		</>
	)
}

const Master = function () {
	return (
		<Experience name="master" showFilter={false}>
			<MasterComponent />
		</Experience>
	)
}

export default Master
