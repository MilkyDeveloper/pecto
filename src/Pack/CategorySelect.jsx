import React, { useContext, useState } from 'react'

import Dropdown from 'react-bootstrap/Dropdown'
import Modal from 'react-bootstrap/Modal'
import Button from 'react-bootstrap/Button'

import { hslToHex } from '@/lib/utilities'

import { saveStarred, usePack } from '@/stores/pack'
import { shallow } from 'zustand/shallow'
import { ThemeContext } from '@/lib/context'
import { syncLocalStorage } from '@/lib/firebase'
import { useUser } from '@/stores/user'

/**
 * A dropdown menu that allows the user to select a category for a card and contains a modal to add or edit categories
 *
 * Directly modifies the `Pack` state
 *
 * @component
 * @param {number} index - The index of the card in the pack
 */
function CategorySelect({ index }) {
	const [user] = useUser((state) => [state.user], shallow)
	const [
		cards, // TODO: fix misleading name
		uuid,
		packUUID,
		categories,
		addCategory,
		editCategory,
		setCardCategory,
		removeCardCategory,
		canEdit,
	] = usePack(
		(state) => [
			// Data
			state.pack.content[index].category,
			state.pack.content[index].uuid,
			state.pack.uuid,
			state.pack.categories,
			state.addCategory,
			state.editCategory,
			state.setCardCategory,
			state.removeCardCategory,
			state.canEdit,
		],
		shallow
	)
	const theme = useContext(ThemeContext)

	// New Category modal
	const [show, setShow] = useState(false)
	const [newCategory, setNewCategory] = useState('')
	const [newColor, setNewColor] = useState(['', ''])
	const [replaceCategory, setReplaceCategory] = useState('')

	const [editingCategoryDropdown, editCategoryDropdown] = useState(false)

	const [starred, setStarred] = useState(
		localStorage.getItem(`starred-${packUUID}-${uuid}`) === 'true'
	)

	function submitNewCategory() {
		if (replaceCategory == '') {
			addCategory(newCategory, newColor)
		} else {
			editCategory(replaceCategory, { name: newCategory, colors: newColor })
			setNewCategory('New Category')
			setNewColor(['#FFFFFF', '#FFFFFF'])
			setReplaceCategory('')
		}
		setShow(false)
	}

	function changeCardCategory(category) {
		setCardCategory(index, category)
	}

	function generateNewColor(currentHexCode) {
		var hue = currentHexCode
		if (currentHexCode == null) {
			hue = Math.floor(Math.random() * 360)
			setNewColor([hslToHex(hue, 100, 97), hslToHex(hue, 100, 99)])
		} else {
			setNewColor([hue, hue])
		}
	}

	function showEditModal(id, category) {
		setNewCategory(category.name)
		setNewColor(category.colors)
		setReplaceCategory(id)
		setShow(true)
	}

	async function toggleStarred(val) {
		setStarred(val)
		saveStarred(val, packUUID, uuid, user?.uid)
	}

	return (
		<>
			<div className="d-flex justify-content-between align-items-center">
				{starred ? (
					<Button
						size="sm"
						variant={theme.dark ? 'secondary' : 'dark'}
						onClick={() => toggleStarred(false)}
						tabIndex="-1"
					>
						⭐
					</Button>
				) : (
					<Button
						size="sm"
						variant={theme.color}
						onClick={() => toggleStarred(true)}
						tabIndex="-1"
					>
						⭐
					</Button>
				)}
				{canEdit ? (
					<Dropdown>
						<Dropdown.Toggle
							size="sm"
							className="ms-2"
							variant={theme.color}
							tabIndex="-1"
						>
							{categories[cards].name}
						</Dropdown.Toggle>
						<Dropdown.Menu>
							{Object.entries(categories).map(([id, category]) => (
								<div key={id}>
									<Dropdown.Item
										onClick={() => changeCardCategory(id)}
										key={category.name}
									>
										{category.name}
									</Dropdown.Item>
									{editingCategoryDropdown && category.name !== 'Default' && (
										<div className="d-flex justify-content-between align-items-center ps-2 pe-2 pt-1 pb-1">
											<Button
												size="sm"
												variant="outline-light"
												onClick={() => showEditModal(id, category)}
											>
												✏️
											</Button>
											<Button
												size="sm"
												variant="outline-light"
												onClick={() => removeCardCategory(id)}
											>
												🗑️
											</Button>
										</div>
									)}
								</div>
							))}
							<li>
								<hr className="dropdown-divider" />
							</li>
							<div className="text-center d-flex justify-content-between align-items-center ps-2 pe-2">
								<Button
									size="sm"
									variant={theme.color}
									onClick={() => editCategoryDropdown(!editingCategoryDropdown)}
								>
									⚒️
								</Button>
							</div>
							<li>
								<hr className="dropdown-divider" />
							</li>
							<Dropdown.Item
								className="text-center"
								onClick={() => {
									generateNewColor()
									setShow(true)
								}}
							>
								New
							</Dropdown.Item>
						</Dropdown.Menu>
					</Dropdown>
				) : (
					<Button size="sm" className="ms-2" variant={theme.color} tabIndex="-1" disabled>
						{categories[cards].name}
					</Button>
				)}
			</div>

			{/* New Category Modal */}
			<Modal show={show} onHide={() => setShow(false)}>
				<Modal.Header closeButton>
					<Modal.Title>Categories</Modal.Title>
				</Modal.Header>
				<Modal.Body>
					<input
						type="text"
						value={newCategory}
						onChange={(e) => setNewCategory(e.target.value)}
						className="form-control"
					/>
					<div className="mt-3 d-flex justify-content-between">
						<input
							type="color"
							className="form-control form-control-color"
							value={newColor[0]}
							onChange={(e) => generateNewColor(e.target.value)}
						/>
						<Button variant="dark" onClick={() => generateNewColor(null)}>
							Randomize
						</Button>
					</div>
				</Modal.Body>
				<Modal.Footer>
					<Button variant="primary" onClick={submitNewCategory}>
						{/* eslint-disable-next-line prettier/prettier */}
						{replaceCategory == '' ? 'Add New Category' : 'Set Category'}
					</Button>
				</Modal.Footer>
			</Modal>
		</>
	)
}

export default CategorySelect
