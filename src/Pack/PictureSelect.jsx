import React, { useContext, useState } from 'react'

import Dropdown from 'react-bootstrap/Dropdown'
import Modal from 'react-bootstrap/Modal'
import Button from 'react-bootstrap/Button'

import { usePack } from '@/stores/pack'
import { shallow } from 'zustand/shallow'

import { truncateString } from '@/lib/utilities'
import { ThemeContext } from '@/lib/context'

/**
 * A dropdown menu that allows the user to select a picture for a card and contains a modal to add pictures
 *
 * Directly modifies the `Pack` state
 *
 * @component
 * @param {number} index - The index of the card in the pack
 */
function PictureSelect({ index }) {
	const [cards, pictures, addPicture, setCardPicture, removeCardPicture] = usePack(
		(state) => [
			// Data
			state.pack.content[index]?.picture,
			state.pack.pictures,
			state.addPicture,
			state.setCardPicture,
			state.removeCardPicture,
		],
		shallow
	)
	const theme = useContext(ThemeContext)

	// Valid URL
	const [validURL, setValidURL] = useState(false)

	// New Category modal
	const [show, setShow] = useState(false)
	const [newPicture, setNewPicture] = useState('')

	return (
		<>
			<Dropdown>
				<Dropdown.Toggle
					size="sm"
					className="ms-2 rounded-3 text-muted"
					variant={`outline-${theme.color}`}
					tabIndex="-1"
				>
					{cards?.picture ? truncateString(cards.picture, 15) : 'No Picture'}
				</Dropdown.Toggle>

				<Dropdown.Menu>
					<Dropdown.Item onClick={() => removeCardPicture(index)}>
						Remove Picture
					</Dropdown.Item>
					{pictures.map((picture) => (
						<div key={picture}>
							<Dropdown.Item onClick={() => setCardPicture(index, picture)}>
								{picture}
							</Dropdown.Item>
						</div>
					))}
					<li>
						<hr className="dropdown-divider" />
					</li>
					<Dropdown.Item
						className="text-center"
						onClick={() => {
							setNewPicture('')
							setShow(true)
						}}
					>
						New
					</Dropdown.Item>
				</Dropdown.Menu>
			</Dropdown>

			{/* New Category Modal */}
			<Modal show={show} onHide={() => setShow(false)}>
				<Modal.Header closeButton>
					<Modal.Title>New Picture</Modal.Title>
				</Modal.Header>
				<Modal.Body>
					<input
						type="text"
						value={newPicture}
						onChange={(e) => {
							if (
								pictures.includes(e.target.value) ||
								!e.target.value.startsWith('http') ||
								!e.target.value.includes('.') ||
								!e.target.value.includes('://') ||
								e.target.value.includes(' ')
							) {
								setValidURL(false)
							} else {
								setValidURL(true)
							}
							setNewPicture(e.target.value)
						}}
						className="form-control"
					/>
				</Modal.Body>
				<Modal.Footer>
					<Button
						variant="primary"
						disabled={!validURL}
						onClick={() => {
							addPicture(newPicture)
							setShow(false)
						}}
					>
						Confirm
					</Button>
				</Modal.Footer>
			</Modal>
		</>
	)
}

export default PictureSelect
