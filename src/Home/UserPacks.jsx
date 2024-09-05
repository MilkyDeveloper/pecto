import React from 'react'
import { LinkContainer } from 'react-router-bootstrap'
import Form from 'react-bootstrap/Form'
import Button from 'react-bootstrap/Button'
import { useState, useMemo } from 'react'

import { useUser } from '@/stores/user'
import { shallow } from 'zustand/shallow'

function UserPacks(props) {
	const [editing, setEditing] = useState(false)
	const [deletePack] = useUser((state) => [state.deletePack], shallow)
	const [search, setSearch] = useState('')
	const [sort, setSort] = useState(0)
	const packs = useMemo(() => {
		let sorted
		if (sort === 0) {
			sorted = props.packs.sort((a, b) => {
				return new Date(b.date) - new Date(a.date)
			})
		} else if (sort === 1) {
			sorted = props.packs.sort((a, b) => {
				return a.class.localeCompare(b.class)
			})
		} else if (sort === 2) {
			sorted = props.packs.sort((a, b) => {
				return a.name.localeCompare(b.name)
			})
		}

		let filtered = sorted
		if (search !== '') {
			const s = search.toLowerCase()
			filtered = sorted.filter((pack) => {
				return (
					pack.name.toLowerCase().includes(s) ||
					pack.class.toLowerCase().includes(s) ||
					pack?.folder?.toLowerCase()?.includes(s) ||
					(
						(pack?.folder?.toLowerCase() ? `${pack?.folder?.toLowerCase()}/` : '') +
						pack.name
					).includes(s)
				)
			})
		}

		return filtered
	}, [props.packs, sort, search])
	const completions = useMemo(() => {
		return props.packs.map((pack) => {
			return [(pack?.folder ? `${pack?.folder}/` : '') + pack.name, pack.uuid]
		})
	}, [search, props.packs])

	var packsToDelete = []

	async function handleDelete() {
		// packsToDelete.forEach(async (uuid) => {
		// 	deletePack(uuid)
		// })
		for (const uuid of packsToDelete) {
			await deletePack(uuid)
		}
		window.location.reload()
	}

	return (
		<>
			<div className="d-flex justify-content-between mt-3 mb-3">
				<input
					value={search}
					onChange={(e) => setSearch(e.target.value)}
					className="form-control"
					list="datalistOptions"
					placeholder="Autosearch"
				/>
				<datalist id="datalistOptions">
					{completions.map((c) => (
						<option key={c[1]} value={c[0]} />
					))}
				</datalist>
			</div>

			<div className="d-flex justify-content-between mb-3">
				<div className="d-flex justify-content-start">
					<p className="my-auto me-2">Sort by</p>
					<Form.Select
						className="w-auto"
						value={sort}
						onChange={(e) => setSort(Number(e.target.value))}
					>
						<option value="0">Date</option>
						<option value="1">Class</option>
						<option value="2">Name</option>
					</Form.Select>
				</div>

				{props.canEdit &&
					(editing ? (
						<div>
							<Button
								variant="warning"
								onClick={() => {
									setEditing(false)
								}}
							>
								Cancel
							</Button>
							<Button
								variant="danger"
								className="ms-2"
								onClick={() => {
									handleDelete()
									setEditing(false)
								}}
							>
								Confirm Delete (unrecoverable)
							</Button>
						</div>
					) : (
						<Button
							variant="warning"
							onClick={() => {
								setEditing(true)
							}}
						>
							Bulk Delete
						</Button>
					))}
			</div>

			<div className="row row-cols-1 row-cols-sm-3 gy-4">
				{props.canEdit && (
					<div className="col">
						<LinkContainer to={`/new/pack`}>
							<div className="card text-center h-100 d-block">
								<div className="card-body">
									<div className="my-auto">
										<h2>➕</h2>
										<h5>New Pack</h5>
									</div>
								</div>
							</div>
						</LinkContainer>
					</div>
				)}

				{packs.map((pack) => (
					<div className="col" key={pack.uuid}>
						<LinkContainer to={`/view/${pack.author}/${pack.uuid}`}>
							<div className="card">
								<div className="card-body">
									<h5 className="card-title">
										{pack.name == '' ? (
											<span className="text-muted">Empty Title</span>
										) : (
											pack.name
										)}
									</h5>
									<h6 className="card-subtitle mb-2 text-muted">
										✏️ {pack.superficialAuthor}
									</h6>
									For{' '}
									{pack.class == '' ? (
										<span className="text-muted">N/A</span>
									) : (
										pack.class
									)}
									<br />
									Created on {pack.date}
									<br />
									{pack?.folder ? (
										<span>
											Located in <code>{pack?.folder}</code>
										</span>
									) : (
										''
									)}
								</div>
							</div>
						</LinkContainer>

						{props.canEdit && editing && (
							<div className="mt-2">
								<Form.Check
									reverse
									label="Remove"
									onClick={(e) => {
										if (e.target.checked == true) {
											packsToDelete.push(pack.uuid)
										} else {
											packsToDelete = packsToDelete.filter(
												(e) => e != pack.uuid
											)
										}
									}}
								/>
							</div>
						)}
					</div>
				))}
			</div>
		</>
	)
}

export default UserPacks
