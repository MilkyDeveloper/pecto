import React, { useState, useEffect, useContext } from 'react'
import UserPacks from './Home/UserPacks'

import { useUser } from '@/stores/user'
import { shallow } from 'zustand/shallow'
import { getMyPacks as getMyPacksLocal } from '@/lib/localstore'
import { ThemeContext } from './lib/context'

import ListGroup from 'react-bootstrap/ListGroup'
import Button from 'react-bootstrap/Button'

function Home() {
	const [user, newPack, deletePack, getMyPacks] = useUser(
		(state) => [state.user, state.newPack, state.deletePack, state.getMyPacks],
		shallow
	)
	const [usersPacks, setUsersPacks] = useState([])
	const [localPacks, setLocalPacks] = useState([])

	const theme = useContext(ThemeContext)

	useEffect(() => {
		async function fetchData() {
			setUsersPacks(await getMyPacks())
		}
		fetchData()
	}, [user])

	useEffect(() => {
		async function fetchData() {
			setLocalPacks(await getMyPacksLocal())
		}
		fetchData()
	}, [])

	return (
		<div className="container">
			<div className="m-3">
				<h3>Your Packs</h3>
				<UserPacks canEdit packs={usersPacks} />

				{/* TODO: implement! */}
				{/* <div className="row row-cols-1 row-cols-sm-3 gy-4 mt-0">
					<div className="col">
						<div className="card text-center h-100">
							<div className="card-body">
								<div className="mx-auto">
									<h2>📂</h2>
									<h5>New Folder</h5>
								</div>
							</div>
						</div>
					</div>
					<div className="col">
						<div className="card text-center h-100">
							<div className="card-body">
								<h5>New Folder</h5>
							</div>
						</div>
					</div>
				</div>

				<div className="row row-cols-1 row-cols-sm-3 gy-4 mt-0">
					<div className="col">
						<div className="card text-center h-100">
							<div className="card-body">
								<div className="mx-auto">
									<h2>📖</h2>
									<h5>New Class</h5>
								</div>
							</div>
						</div>
					</div>
				</div> */}

				{localPacks.length > 0 && user?.uid !== undefined && (
					<>
						<h3 className="mt-3">Manage Local Packs</h3>
						<ListGroup className="mt-3">
							{localPacks.map((pack) => (
								<ListGroup.Item key={pack.uuid} className="theme-fg">
									<div className="d-flex justify-content-between align-items-center">
										{pack.name == '' ? (
											<a
												className="text-muted"
												href={`/view/me/${pack.uuid}`}
											>
												No Name
											</a>
										) : (
											<a href={`/view/me/${pack.uuid}`}>{pack.name}</a>
										)}
										<div>
											<Button
												variant={theme.color ? 'light' : 'dark'}
												size="sm"
												className="ms-2"
												onClick={async () => {
													await newPack(pack.uuid, {
														...pack,
														author: user.username,
														uid: user.uid,
														superficialAuthor: user.username,
													})
													window.location.reload()
												}}
											>
												Upload
											</Button>
											<Button
												variant="danger"
												size="sm"
												className="ms-2 me-2"
												onClick={() => deletePack(pack.uuid, true)}
											>
												Delete
											</Button>
											📖{' '}
											{pack.class == '' ? (
												<span className="text-muted me-2">No Name</span>
											) : (
												<span className="me-2">pack.class</span>
											)}
											📅 {pack.date}
										</div>
									</div>
								</ListGroup.Item>
							))}
						</ListGroup>
					</>
				)}

				{/* TODO: implement */}
				{/* <div className="d-flex justify-content-center text-muted font-monospace fw-bold text-uppercase mt-2 mb-2">
					Import
				</div>

				<div className="row row-cols-1 row-cols-sm-3 gy-4 mb-2">
					{[
						{ icon: '📲', description: 'Import Quizlet' },
						{ icon: '⭐', description: 'Import from Anki' },
						{ icon: '📁', description: 'Import from File' },
					].map((action) => (
						<div className="col" key={action.description}>
							<div className="card text-center" key={action.description}>
								<div className="card-body">
									<h2>{action.icon}</h2>
									<h5>{action.description}</h5>
								</div>
							</div>
						</div>
					))}
				</div> */}
			</div>
		</div>
	)
}

export default Home
