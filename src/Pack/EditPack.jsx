import React, { useEffect, useState } from 'react'

import Cards from './Cards'
import { Metadata } from './Metadata'
import { useParams } from 'react-router-dom'
import { useNavigate } from 'react-router-dom'

import Button from 'react-bootstrap/Button'
import ButtonGroup from 'react-bootstrap/ButtonGroup'
import Spinner from 'react-bootstrap/Spinner'

import { usePack } from '@/stores/pack'
import { useUser } from '@/stores/user'
import { shallow } from 'zustand/shallow'

import { v4 as uuidv4 } from 'uuid'

function EditPack() {
	const { displayName, packId } = useParams()
	// We wrap useState around this so we can modify it (ex. adding new cards)
	const [user, newPack] = useUser((state) => [state.user, state.newPack], shallow)
	const [pack, error, loading, loadPack, filterPackCategory, addCards, letMeEdit] = usePack(
		(state) => [
			// Data
			state.pack,
			state.error,
			state.loading,
			state.loadPack,
			state.filterPackCategory,
			state.addCards,
			// Editing
			state.letMeEdit,
		],
		shallow
	)

	// Saving progress spinner
	const [saving, startSaving] = useState(false)

	// const [editingAll, setEditingAll] = useState(false)

	const navigate = useNavigate()

	useEffect(() => {
		if (pack === undefined) {
			;(async () => {
				await loadPack(displayName, packId)
				filterPackCategory(0)
			})()
		}
	}, [])

	useEffect(() => {
		if (user?.uid !== pack?.uid && pack?.uid !== 'me') {
			return (
				<div className="text-center">
					<h1>403</h1>
					<p>You don&apos;t have permission to edit this pack.</p>
				</div>
			)
		} else {
			letMeEdit(true)
		}
	}, [user])

	// Loading logic
	if (loading) {
		return (
			<div className="text-center">
				<h1>📎</h1>
				<Spinner animation="grow" size="sm" />
			</div>
		)
	}

	// The === is very important, since it must be a boolean, not an error object
	if (error === true) {
		return (
			<div className="text-center">
				<h1>404</h1>
				<p>Sorry, this pack doesn&apos;t exist.</p>
			</div>
		)
	}

	if (error) {
		return (
			<div className="text-center">
				<h1>403</h1>
				<p>This pack exists, but it hasn&apos;t been published.</p>
				<code>{error.toString()}</code>
			</div>
		)
	}

	async function saveCards(viewMode = false) {
		startSaving(true)

		await newPack(packId, pack)

		if (viewMode) {
			navigate(`/view/${pack.author}/${pack.uuid}`)
		} else {
			// This isn't a stopgap for async, it just shows the saving spinner,
			// providing feedback to the user
			setTimeout(() => {
				startSaving(false)
			}, '200')
		}
	}

	function newCards() {
		// Add new terms
		addCards({
			term: '',
			definition: '',
			category: 'default',
			uuid: uuidv4(),
		})
	}

	return (
		<div id="packRoot" className="mx-auto mb-5 border border-2 p-4 rounded-3 pack">
			<Metadata editing />

			<div id="packContentContainer" className="mt-3 border border-2 rounded-3">
				{/* <AnimatePresence> */}
				{pack.content.map((cards, index) => (
					<Cards index={index} edit={true} key={cards.uuid + index} />
				))}
				{/* </AnimatePresence> */}
			</div>

			<div id="parentToolbar" className="d-flex justify-content-between fixed-bottom">
				<ButtonGroup className="mx-auto fw-bold" id="bottomToolbar">
					<Button variant="light" onClick={() => saveCards()} className="p-3">
						{saving ? (
							<Spinner animation="border" variant="dark" size="sm" />
						) : (
							'💾 Save'
						)}
					</Button>
					<Button variant="light" onClick={newCards} className="p-3">
						➕ Add Cards
					</Button>
					{/* <LinkContainer to={`/view/${pack.author}/${pack.uuid}`}> */}
					<Button variant="light" onClick={() => saveCards(true)} className="p-3">
						{saving ? 'Saving...' : '↩ Return'}
					</Button>
					{/* </LinkContainer> */}
				</ButtonGroup>
			</div>
		</div>
	)
}

export default EditPack
