import { React, useState, useEffect, useContext } from 'react'

import { useNavigate } from 'react-router-dom'

import Button from 'react-bootstrap/Button'
import Form from 'react-bootstrap/Form'
import OverlayTrigger from 'react-bootstrap/OverlayTrigger'
import Tooltip from 'react-bootstrap/Tooltip'
import { LinkContainer } from 'react-router-bootstrap'
import Modal from 'react-bootstrap/Modal'
import FloatingLabel from 'react-bootstrap/FloatingLabel'

import './Metadata.scss'

import { usePack } from '@/stores/pack'
import { useUser } from '@/stores/user'
import { shallow } from 'zustand/shallow'
import { ThemeContext } from '@/lib/context'

import { v4 as uuidv4 } from 'uuid'
import { stripHTML } from '@/lib/utilities'

// Lots of logic is shared with EditingPair

export function Metadata(props) {
	const [editing, setEditing] = useState(false)
	const [newPack, deletePack] = useUser((state) => [state.newPack, state.deletePack], shallow)
	const [
		pack,
		togglePublish,
		editClass,
		editName,
		addQuizletCards,
		addCategory,
		setFolder,
		canEdit,
		setEditingPack,
	] = usePack(
		(state) => [
			// Data
			state.pack,
			state.togglePublish,
			state.editClass,
			state.editName,
			state.addQuizletCards,
			state.addCategory,
			state.setFolder,
			// Editing
			state.canEdit,
			state.setEditing,
		],
		shallow
	)

	const theme = useContext(ThemeContext)

	const [willDelete, startDelete] = useState(false)
	const [settingFolder, startSettingFolder] = useState(false)
	const [importing, importFromQuizlet] = useState(false)
	const [quizletContents, setQuizletContens] = useState('')
	const [category, setCategory] = useState('Default')

	const navigate = useNavigate()

	useEffect(() => {
		setEditing(props.editing)
	}, [props.editing])

	// TODO: unnecessary useEffect
	useEffect(() => {
		if (editing) {
			// Disable arrow key flashcard navigation
			setEditingPack(true)
		} else {
			setEditingPack(false)
			startDelete(false)
		}
	}, [editing])

	async function exitEditingMode() {
		// Save (upload) changes
		await newPack(pack.uuid, pack)

		// Return to the static version
		setEditing(!editing)
	}

	// sadge
	async function deleteP() {
		await deletePack(pack.uuid)
		navigate('/')
	}

	function importQuizlet() {
		let uuid = 'default'
		if (category.toLowerCase() !== 'default') {
			let uuid = uuidv4()
			addCategory(category, ['transparent', 'transparent'], uuid)
		}
		addQuizletCards(quizletContents, uuid)
		importFromQuizlet(false)
	}

	function exportPack() {
		let text = ''
		pack.content.forEach((card) => {
			text += `${stripHTML(card.term)}🟢${stripHTML(card.definition)}⭕\n`
		})
		navigator.clipboard.writeText(text)
		alert(
			'Copied to clipboard! To import into Quizlet, paste it in and enter 🟢 for custom on the left and ⭕ for the custom of the right,'
		)
	}

	if (editing) {
		return (
			<div key="editing">
				<Form>
					<input
						id="packNameX"
						type="text"
						value={pack.name}
						className="form-control form-control-lg"
						onChange={(e) => editName(e.target.value)}
					/>
					<div className="d-flex justify-content-around mt-3 mb-3 align-items-center">
						<div className="row g-0 align-items-center">
							<div className="col-auto">For</div>
							<div className="col-auto">
								<input
									id="packClass"
									type="text"
									value={pack.class}
									className="form-control form-control-sm ms-2"
									onChange={(e) => editClass(e.target.value)}
								/>
							</div>
						</div>
						<div>
							Created by{' '}
							<LinkContainer className="link-primary" to={`/view/${pack.author}`}>
								<b>{pack.superficialAuthor}</b>
							</LinkContainer>
						</div>
						<div>
							Published on <b>{pack.date}</b>
						</div>
					</div>
				</Form>

				<div className="d-flex justify-content-between">
					<div>
						{willDelete ? (
							<>
								<Button
									size="sm"
									className="me-2"
									variant="warning"
									onClick={() => startDelete(false)}
								>
									Cancel
								</Button>
								<Button
									size="sm"
									className="me-2"
									variant="danger"
									onClick={deleteP}
								>
									Are you sure?
								</Button>
							</>
						) : (
							<Button
								size="sm"
								className="me-2"
								variant="warning"
								onClick={() => startDelete(true)}
							>
								Delete
							</Button>
						)}
						<OverlayTrigger
							placement="top"
							overlay={
								<Tooltip>
									{pack.published
										? 'Currently everyone can view this'
										: 'Currently only you can see this'}
								</Tooltip>
							}
						>
							<Button
								className="me-2"
								size="sm"
								variant="dark"
								disabled={pack.author == 'me' ? true : false}
								onClick={() => {
									togglePublish(!pack.published)
								}}
							>
								{pack.published ? 'Unpublish' : 'Publish'}
							</Button>
						</OverlayTrigger>
						<Button
							className="me-2"
							size="sm"
							variant="success"
							onClick={() => importFromQuizlet(!importing)}
						>
							Import from Quizlet
						</Button>
					</div>

					<div>
						<Button
							size="sm"
							className="me-2"
							variant={theme.dark ? 'light' : 'dark'}
							onClick={() => startSettingFolder(true)}
						>
							Set Folder {pack?.folder && `(Currently ${pack.folder})`}
						</Button>
						{settingFolder && (
							<Modal show={settingFolder} onHide={() => startSettingFolder(false)}>
								<Modal.Header closeButton>
									<Modal.Title>Set Folder</Modal.Title>
								</Modal.Header>
								<Modal.Body>
									<p>Including a forward slash will create a subfolder</p>
									<input
										type="text"
										// For autocomplete
										id="pectoFolderName"
										className="form-control"
										value={pack.folder ? pack.folder : ''}
										onChange={(e) => {
											setFolder(e.target.value)
										}}
									/>
								</Modal.Body>
								<Modal.Footer>
									<Button
										variant="primary"
										onClick={() => startSettingFolder(false)}
									>
										Done
									</Button>
								</Modal.Footer>
							</Modal>
						)}
						{!props?.editing && (
							<Button size="sm" onClick={exitEditingMode}>
								Finish Editing
							</Button>
						)}
					</div>
				</div>

				<Modal show={importing} onHide={() => importFromQuizlet(false)}>
					<Modal.Header closeButton>
						<Modal.Title>Quizlet Integration</Modal.Title>
					</Modal.Header>
					<Modal.Body>
						This only works if you are the creator
						<ol>
							<li>
								Click the <span className="badge bg-dark">⋯</span> menu
							</li>
							<li>
								Press <span className="badge bg-primary">Export</span>
							</li>
							<li>
								Paste <span className="badge bg-dark">🟢</span> in <b>Custom</b> for{' '}
								<b>Between term and definition</b>
							</li>
							<li>
								Paste <span className="badge bg-dark">⭕</span> in <b>Custom</b> for{' '}
								<b>Between rows</b>
							</li>
							<li>
								Click <span className="badge bg-primary">Copy Text</span>
							</li>
							<li>Select a category and paste it below</li>
						</ol>
						<FloatingLabel controlId="floatingCategory" label="Category">
							<Form.Control
								type="text"
								value={category}
								onChange={(e) => {
									setCategory(e.target.value)
								}}
							/>
						</FloatingLabel>
						<FloatingLabel controlId="floatingContents" label="Content">
							<input
								type="text"
								value={quizletContents}
								onChange={(e) => setQuizletContens(e.target.value)}
								className="form-control mt-3"
							/>
						</FloatingLabel>
					</Modal.Body>
					<Modal.Footer>
						<Button variant="primary" onClick={importQuizlet}>
							Done
						</Button>
					</Modal.Footer>
				</Modal>
			</div>
		)
	} else {
		return (
			<div key="normal">
				<div className="d-flex align-items-center justify-content-between">
					<h1 id="packName">
						{pack.name == '' ? (
							<span className="text-muted">My Pack</span>
						) : (
							<span>{pack.name}</span>
						)}
					</h1>
					<p>
						Author:{' '}
						<LinkContainer className="link-primary" to={`/view/${pack.author}`}>
							<b>@{pack.author}</b>
						</LinkContainer>
					</p>
				</div>

				<div className="d-flex justify-content-between">
					<p>
						For{' '}
						{pack.class == '' ? (
							<span className="text-muted">My Class</span>
						) : (
							<b>{pack.class}</b>
						)}
					</p>
					<p>
						Published on: <b>{pack.date}</b>
					</p>
				</div>

				<div className="d-flex justify-content-between">
					<div>
						<Button
							size="sm"
							className="me-2"
							onClick={() => {
								navigator.clipboard.writeText(window.location.href)
							}}
							disabled={pack.author == 'me'}
						>
							{pack.author == 'me'
								? 'Create an account to share your pack'
								: '📋 Copy'}
						</Button>
						<Button
							size="sm"
							variant="secondary"
							onClick={exportPack}
							disabled={pack.author == 'me'}
						>
							📃 Export
						</Button>
					</div>

					{canEdit ? (
						<Button
							size="sm"
							variant={theme.dark ? 'light' : 'dark'}
							onClick={() => setEditing(!editing)}
						>
							Edit Metadata
						</Button>
					) : null}
				</div>
			</div>
		)
	}
}
