import React, { useContext, useState } from 'react'

import { shallow } from 'zustand/shallow'
import { usePack } from '@/stores/pack'
import { Experience } from '../Experience'
import { Filter } from '../Filter'

import Button from 'react-bootstrap/Button'
import ButtonGroup from 'react-bootstrap/ButtonGroup';
import Form from 'react-bootstrap/Form'
import FloatingLabel from 'react-bootstrap/FloatingLabel'
import Col from 'react-bootstrap/Col'
import Row from 'react-bootstrap/Row'
import { Test } from './Test'
import { ThemeContext } from '@/lib/context'

function AssessComponent() {
	const [pack] = usePack((state) => [state.pack], shallow)
	const theme = useContext(ThemeContext)

	const [startedTest, setStartedTest] = useState(false)
	const [paper, setPaper] = useState(false)

	// The divisor is how many question types are there
	const defaultQuestions = Math.floor(pack.content.length / 4)
	var remainder = 0
	if (defaultQuestions * 4 < pack.content.length) {
		remainder = pack.content.length - defaultQuestions * 4
	}

	const [totalQuestions, setTotalQuestions] = useState(pack.content.length)
	const [multipleChoiceQuestions, setMultipleChoiceQuestions] = useState(
		defaultQuestions + remainder
	)
	const [writtenQuestions, setWrittenQuestions] = useState(defaultQuestions)
	const [trueOrFalseQuestions, setTrueOrFalseQuestions] = useState(defaultQuestions)
	const [hardMultipleChoiceQuestions, setHardMultipleChoiceQuestions] = useState(defaultQuestions)

	function handleSubmit(paper = false) {
		if (totalQuestions < 1 || totalQuestions > pack.content.length) {
			alert(`Total questions must be above 0 or below/equal to ${pack.content.length}`)
		} else if (
			multipleChoiceQuestions +
				writtenQuestions +
				trueOrFalseQuestions +
				hardMultipleChoiceQuestions !==
			totalQuestions
		) {
			alert(`All questions must add up to ${totalQuestions}!`)
		} else {
			setPaper(paper)
			setStartedTest(true)
		}
	}

	return (
		<>
			<div className="text-center">
				<h1 className="mt-5">Assess</h1>
				<p>
					Determine your proficiency{' '}
					{pack.name && (
						<>
							for <span className="text-muted">{pack.name} </span>
						</>
					)}
					through a personalized test
				</p>

				<hr />
				<h1>⚙️</h1>
				<hr />

				<div
					className={`w-75 mx-auto border p-4 rounded-3 text-start ${
						startedTest && `bg-${theme.color}`
					}`}
				>
					<h3>🔑 Filters</h3>
					<Filter disabled={startedTest} />

					<h3 className="mt-3 mb-3">✏️ Questions</h3>
					<Form>
						<Row>
							<Col>
								<FloatingLabel label="Total Questions">
									<Form.Control
										type="number"
										value={totalQuestions}
										onChange={(e) =>
											setTotalQuestions(
												e.target.value ? Math.abs(e.target.value) : ''
											)
										}
										className="mb-3"
										min={0}
										max={pack.content.length}
										disabled={startedTest}
									/>
									<Form.Control.Feedback type="invalid">
										Must be above 0 or below/equal to {pack.content.length}
									</Form.Control.Feedback>
								</FloatingLabel>
							</Col>
							<Form.Control.Feedback type="invalid">
								<Col>All questions must add up to {totalQuestions}!</Col>
							</Form.Control.Feedback>
						</Row>
						<Row className="g-3">
							<Col>
								<FloatingLabel label="Multiple Choice">
									<Form.Control
										type="number"
										value={multipleChoiceQuestions}
										onChange={(e) =>
											setMultipleChoiceQuestions(
												e.target.value ? Math.abs(e.target.value) : ''
											)
										}
										min={0}
										disabled={startedTest}
									/>
								</FloatingLabel>
							</Col>
							<Col>
								<FloatingLabel label="Written Questions">
									<Form.Control
										type="number"
										value={writtenQuestions}
										onChange={(e) =>
											setWrittenQuestions(
												e.target.value ? Math.abs(e.target.value) : ''
											)
										}
										min={0}
										disabled={startedTest}
									/>
								</FloatingLabel>
							</Col>
							<Col>
								<FloatingLabel label="True or False">
									<Form.Control
										type="number"
										value={trueOrFalseQuestions}
										onChange={(e) =>
											setTrueOrFalseQuestions(
												e.target.value ? Math.abs(e.target.value) : ''
											)
										}
										min={0}
										disabled={startedTest}
									/>
								</FloatingLabel>
							</Col>
							<Col>
								<FloatingLabel label="Hard Multiple Choice">
									<Form.Control
										type="number"
										value={hardMultipleChoiceQuestions}
										onChange={(e) =>
											setHardMultipleChoiceQuestions(
												e.target.value ? Math.abs(e.target.value) : ''
											)
										}
										min={0}
										disabled={startedTest}
									/>
								</FloatingLabel>
							</Col>
							<Col>
								<div className="d-grid h-100">
									<ButtonGroup>
										<Button
											onClick={() => handleSubmit(true)}
											variant={theme.dark ? 'light' : 'dark'}
											disabled={startedTest}
											size="sm"
										>
											Paper
										</Button>
										<Button
											onClick={() => handleSubmit()}
											variant={theme.dark ? 'light' : 'dark'}
											disabled={startedTest}
											size="sm"
										>
											Test
										</Button>
									</ButtonGroup>
								</div>
							</Col>
						</Row>
					</Form>
				</div>
			</div>

			{startedTest && (
				<>
					<hr />
					<h3 className="text-center">📝</h3>
					<hr className="mb-4" />
					<Test
						questions={{
							total: totalQuestions,
							mcq: multipleChoiceQuestions,
							written: writtenQuestions,
							tfq: trueOrFalseQuestions,
							hmcq: hardMultipleChoiceQuestions,
						}}
						paper={paper}
					/>
				</>
			)}
		</>
	)
}

const Assess = function () {
	return (
		<Experience name="assess" showFilter={false}>
			<AssessComponent />
		</Experience>
	)
}

export default Assess
