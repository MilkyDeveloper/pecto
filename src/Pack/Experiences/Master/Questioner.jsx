import React, { useState } from 'react'

import { shallow } from 'zustand/shallow'
import { useIntervals } from './stores/intervals'

import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'

import Question from './Question'
// import { ThemeContext } from '@/lib/context'

export default function Questioner() {
	const [intervals, boxes, advanceCard] = useIntervals(
		(state) => [state.intervals, state.boxes, state.advanceCard],
		shallow
	)
	// const theme = useContext(ThemeContext)

	const [index, setIndex] = useState(0)
	const [questionIndex, setQuestionIndex] = useState(0)
	const [right, setRight] = useState(0)
	// TODO: add a finish screen
	const [done, setDone] = useState(false)

	const currentInterval = intervals[index]
	const content = boxes[currentInterval.box]
	const current = content[questionIndex]

	function next() {
		if (index + 1 >= intervals.length) {
			setRight(0)
			setDone(true)
		}
		if (questionIndex + 1 >= content.length) {
			setQuestionIndex(0)
			setRight(0)
			setIndex(index + 1)
		} else {
			setQuestionIndex(questionIndex + 1)
		}
	}

	var lastDay = 0
	const map = intervals.slice(index, index + 1 + 5).map((interval) => {
		if (interval.day === lastDay) {
			return (
				<div
					className="d-flex justify-content-center align-items-center w-100 mb-1"
					key={JSON.stringify(interval)}
				>
					<div
						className="rounded-circle text-center text-muted p-1 px-2"
						// style={{ width: '25px', height: '25px' }}
					>
						Box {interval.box + 1}
					</div>
				</div>
			)
		} else {
			lastDay = interval.day
			return (
				<div key={JSON.stringify(interval)}>
					<div className="d-flex justify-content-center align-items-center w-100 mb-1">
						<div
							className="rounded-2 border border-1 text-center text-muted p-1 px-2"
							// style={{ width: '25px', height: '25px' }}
						>
							Stage {interval.day}
						</div>
					</div>

					<div className="d-flex justify-content-center align-items-center w-100 mb-1">
						<div
							className="text-center text-muted p-1 px-2"
							// style={{ width: '25px', height: '25px' }}
						>
							{interval.day === currentInterval.day ? (
								<b className="text-warning">Box {interval.box + 1}</b>
							) : (
								<>Box {interval.box + 1}</>
							)}
						</div>
					</div>
				</div>
			)
		}
	})

	return (
		<>
			<Row>
				<Col className="mb-2">
					<div>Stage {currentInterval.day}</div>
					<div>Box {currentInterval.box + 1}</div>
					{/* <div>Box {stage.box + 1}</div> */}
					{/* {!lastTerm && <Button onClick={next}>Next</Button>} */}
					<br />

					<div>
						<span className="badge bg-success">Correct</span>
						<span className="ms-1">
							{right}/{content.length}
						</span>
					</div>

					<div>
						<span className="badge bg-primary">Progress</span>
						<span className="ms-1">
							{questionIndex + 1}/{content.length}
						</span>
					</div>

					<div>
						<span className="badge bg-warning mb-2">Map</span>

						<div>{map}</div>
					</div>
				</Col>
				<Col xs={11}>
					<Question
						key={current.uuid}
						card={current}
						next={next}
						correct={() => {
							advanceCard(currentInterval.box, questionIndex)
							setRight(right + 1)
						}}
					/>
				</Col>
			</Row>
		</>
	)
}
