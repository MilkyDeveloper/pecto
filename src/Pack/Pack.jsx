import React, { useContext, useEffect, useState } from 'react'
import Cards from './Cards'
import { Metadata } from './Metadata'
import { useParams, useNavigate } from 'react-router-dom'

import Button from 'react-bootstrap/Button'
import ButtonGroup from 'react-bootstrap/ButtonGroup'
import Spinner from 'react-bootstrap/Spinner'
import Form from 'react-bootstrap/Form'

import { Navigation } from './Navigation'
import { FlashcardView } from './Views/FlashcardView'

import { usePack } from '@/stores/pack'
import { useUser } from '@/stores/user'
import { shallow } from 'zustand/shallow'

import { v4 as uuidv4 } from 'uuid'
import { ThemeContext } from '@/lib/context'

function Pack() {
	const { displayName, packId } = useParams()
	// We wrap useState around this so we can modify it (ex. adding new cards)
	//const { pack: ogPack, mutate, isLoading, error } = usePack(packId)
	//const { pack, setPack } = useState(ogPack)
	const [user, newPack] = useUser((state) => [state.user, state.newPack], shallow)
	const [
		pack,
		error,
		loading,
		filterPackCategory,
		filterPackStarred,
		loadPack,
		addCards,
		canEdit,
		letMeEdit,
	] = usePack(
		(state) => [
			// Data
			state.pack,
			state.error,
			state.loading,
			state.filterPackCategory,
			state.filterPackStarred,
			state.loadPack,
			state.addCards,
			// Editing
			state.canEdit,
			state.letMeEdit,
		],
		shallow
	)
	const theme = useContext(ThemeContext)

	// For a saving progress spinner
	const [saving, startSaving] = useState(false)

	// Category filter
	const [categoryFilter, setCategoryFilter] = useState(0)
	// const [filteredPack, setFilteredPack] = useState(pack)

	// Starred filter
	const [starredFilter, setStarredFilter] = useState(0)

	const navigate = useNavigate()

	useEffect(() => {
		loadPack(displayName, packId)
	}, [])

	useEffect(() => {
		if (pack !== undefined) {
			// Calculate editing access
			if (
				(user?.uid === pack.uid || (pack?.uid == 'me' && !user?.uid)) &&
				categoryFilter === 0 &&
				starredFilter === 0
			) {
				letMeEdit(true)
			} else {
				letMeEdit(false)
			}
		}
	}, [user, pack])

	// useEffect(() => {
	// 	if (categoryFilter == 0) {
	// 		setFilteredPack(pack)
	// 	} else {
	// 		setFilteredPack({
	// 			...pack,
	// 			content: pack.content.filter((cards) => cards.category == categoryFilter),
	// 		})
	// 	}
	// }, [categoryFilter, pack])

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
				<p>This pack exists, but hasn&apos;t been published.</p>
				<code>{error.toString()}</code>
			</div>
		)
	}

	// Loading logic
	// Also wait for the filteredPack to load
	if (loading || pack?.uuid != packId) {
		return (
			<div className="text-center">
				<h1>📎</h1>
				<Spinner animation="grow" size="sm" />
			</div>
		)
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

	async function saveCards(editMode = false) {
		startSaving(true)

		await newPack(packId, pack)

		if (editMode) {
			navigate(`/edit/${pack.author}/${pack.uuid}`)
		} else {
			// This isn't a stopgap for async, it just shows the saving spinner,
			// providing feedback to the user
			// setTimeout(() => {
			// 	startSaving(false)
			// }, '200')

			// Do you want to know what is a stopgap?
			// Allows filters to work and not be weird
			window.location.reload()
		}
	}

	return (
		<div id="packRoot" className="mx-auto">
			<Navigation baseURL={`${pack.author}/${pack.uuid}`} currentPage="view" />

			<div className="pack border border-2 p-4 rounded-3">
				<Metadata />

				<FlashcardView category={categoryFilter} />

				<div className="d-flex justify-content-between align-items-center">
					<div>
						<Button
							variant={theme.color}
							size="sm"
							className="me-3"
							inline="true"
							onClick={() => {
								setStarredFilter(0)
								setCategoryFilter(0)
								filterPackStarred(0)
								filterPackCategory(0)
							}}
						>
							🔄
						</Button>
						<Form.Check
							className="mt-3"
							label={
								starredFilter === 0 ? 'Starred Filter (Disabled)' : 'Starred Filter'
							}
							type="checkbox"
							inline
							onChange={(e) => {
								filterPackStarred(e.target.checked)
								// TODO: very very very complicated
								// allow editing in filtered packs
								// will require us to add uuids for each card
								setStarredFilter(e.target.checked)
							}}
							checked={starredFilter}
						/>
					</div>

					<Form.Select
						className="w-25 mt-3"
						onChange={(e) => {
							let val = e.target.value
							if (val === '0') val = 0
							filterPackCategory(val)
							// TODO: very very very complicated
							// allow editing in filtered packs
							// will require us to add uuids for each card
							setCategoryFilter(val)
						}}
						value={categoryFilter}
					>
						<option value="0">All</option>
						{Object.entries(pack.categories).map(([uuid, content]) => (
							<option
								key={uuid}
								value={uuid}
								style={{ backgroundColor: content.colors[1] }}
							>
								{content.name}
							</option>
						))}
					</Form.Select>
				</div>

				<div id="packContentContainer" className="mt-3 border border-2 rounded-3">
					{/* <AnimatePresence> */}
					{pack.content.map((cards, index) => (
						<Cards index={index} edit={false} key={cards.uuid + index} />
					))}
					{/* </AnimatePresence> */}
				</div>

				{canEdit && (
					<div id="parentToolbar" className="d-flex justify-content-between fixed-bottom">
						<ButtonGroup className="mx-auto fw-bold" id="bottomToolbar">
							{/* <Button
								variant="light"
								onClick={() => {
									setEditingAll(!editingAll)
								}}
								className="p-3"
							>
								{editingAll ? '✔️ Done' : '✏️ Edit All'}
							</Button> */}
							<Button
								variant="light"
								onClick={() => saveCards(false)}
								className="p-3"
							>
								{saving ? (
									<Spinner animation="border" variant="dark" size="sm" />
								) : (
									'💾 Save'
								)}
							</Button>
							<Button variant="light" onClick={newCards} className="p-3">
								➕ New
							</Button>
							{/* <LinkContainer to={`/edit/${pack.author}/${pack.uuid}`}> */}
							<Button variant="light" onClick={() => saveCards(true)} className="p-3">
								{saving ? 'Saving...' : '✏️ Edit'}
							</Button>
							{/* </LinkContainer> */}
						</ButtonGroup>
					</div>
				)}
			</div>
		</div>
	)
}

export default Pack
