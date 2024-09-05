import React, { useState, useEffect } from 'react'
import Container from 'react-bootstrap/Container'
import Nav from 'react-bootstrap/Nav'
import Navbar from 'react-bootstrap/Navbar'
import NavDropdown from 'react-bootstrap/NavDropdown'
import Button from 'react-bootstrap/Button'
import Form from 'react-bootstrap/Form'
import Modal from 'react-bootstrap/Modal'

// Auth
import {
	auth,
	authenticateWithGoogle,
	fetchLocalStorage,
	getUser,
	signOutOfGoogle,
} from '@/lib/firebase'
import { getUsername, initUser } from '@/lib/firebase'
import { useAuthState } from 'react-firebase-hooks/auth'
import { ThemeContext } from '@/lib/context'

import { Outlet } from 'react-router-dom'
// import { useNavigate } from 'react-router-dom'

import { LinkContainer } from 'react-router-bootstrap'

import './Root.scss'

import { useUser } from '@/stores/user'
import { shallow } from 'zustand/shallow'

import { debounce } from './lib/utilities'
import Theme from './Theme'
import { Themes } from './Themes'

function Root() {
	const [user, loading] = useAuthState(auth)
	const [setUser] = useUser((state) => [state.setUser], shallow)
	// const navigate = useNavigate()

	// const [search, setSearch] = useState('')
	const [render, setRender] = useState(false)
	const [askForUsername, setAskForUsername] = useState(false)
	const [username, setUsername] = useState('')
	const [usernameAvailable, setUsernameAvailable] = useState('Great Username!')
	const [theme, setTheme] = useState(localStorage.getItem('theme') || 0)
	const [showAbout, setShowAbout] = useState(false)

	useEffect(() => {
		if (user?.displayName == undefined) {
			setUser({})
		} else {
			setUser(user)
			fetchLocalStorage(user?.uid)
		}
	}, [user, loading])

	// Validate the new username
	useEffect(() => {
		async function checkAvailability() {
			if ((await getUsername(username)) !== undefined) {
				setUsernameAvailable('❌ Username has been taken')
			}
		}

		function checkUsername() {
			// Between 3 and 20 characters
			let correctLength = username.length >= 3 && username.length <= 20
			// // ASCII
			// let correctCharacters = ![...username].some((char) => char.charCodeAt(0) > 127)
			// Overlaps with ASCII but checks for no spaces, only alphanumeric
			let alphaNumeric = /^[\w-]+$/.test(username)
			if (!correctLength || !alphaNumeric) {
				setUsernameAvailable(
					'Username must be between 3 and 20 characters, not include spaces, and contain no special characters'
				)
			}
		}

		if (username == '') {
			setUsernameAvailable('Please enter a username')
		} else {
			setUsernameAvailable('Great Username!')
			checkUsername()
			debounce(checkAvailability())
		}
	}, [username])

	// // Lazy-load other themes
	// // We need to use a glob since we can't use import.meta.url for a dynamic import
	// useEffect(() => {
	// 	Themes.forEach((theme) => async () => {
	// 		if (theme.id !== 'light') await import(`./themes/${theme.id}.theme.scss`)
	// 	})
	// }, [])

	// Save the theme for future visits
	// useEffect(() => {
	// 	if (Themes[theme] !== undefined) {
	// 		localStorage.setItem('theme', theme)
	// 		// if (confirm('Would you like to reload the page to apply the theme?'))
	// 		// 	window.location.reload()
	// 	}
	// }, [theme])

	// Apply the theme
	// Only run this on initialization, these themes interfere with each-other
	useEffect(() => {
		async function applyTheme() {
			document.documentElement.setAttribute('data-bs-theme', Themes[theme].color)
			await import(`./themes/${Themes[theme].id}.scss`)
			setRender(true)
		}
		if (Themes[theme] !== undefined) applyTheme()
	}, [])

	async function handleAuthClick() {
		if (user) {
			// Log-Out functionality
			signOutOfGoogle()
		} else {
			// Log-In
			let user = await initUser()
			if ((await getUser(user.uid)) === undefined) {
				// initUser returns the displayName as the default username
				setUsername(await user.displayName)
				// Open the modal
				setAskForUsername(true)
			}
		}
	}

	async function confirmUsername() {
		setUsernameAvailable('Saving to database...')
		await authenticateWithGoogle(username)
		setAskForUsername(false)
		window.location.reload()
	}

	// function openSearchPage() {
	// 	navigate(`/search/${encodeURIComponent(search)}`)
	// }

	if (!render) return

	return (
		<>
			<Navbar
				id="navbar"
				data-bs-theme={Themes[theme]?.color}
				expand="lg"
				className="shadow-sm rounded-3 position-absolute fixed-top"
			>
				<Container fluid>
					<LinkContainer to={'/'}>
						<Navbar.Brand>📎 Pecto</Navbar.Brand>
					</LinkContainer>
					<Navbar.Toggle aria-controls="basic-navbar-nav" />
					<Navbar.Collapse id="basic-navbar-nav">
						<Nav
							className="me-auto my-2 my-lg-0"
							style={{ maxHeight: '100px' }}
							navbarScroll
						>
							<LinkContainer to={'/'}>
								<Nav.Link>Home</Nav.Link>
							</LinkContainer>

							<NavDropdown title="New">
								<LinkContainer to={`/new/pack/`}>
									<NavDropdown.Item>Pack</NavDropdown.Item>
								</LinkContainer>
							</NavDropdown>

							<Nav.Link onClick={() => setShowAbout(true)}>About</Nav.Link>
						</Nav>

						<div className="d-flex justify-content-end align-items-center">
							{/* <LinkContainer className="me-2" to={'/foundation'}>
								<Nav.Link>
									<img src="/foundation/foundation.png" className="w-25" />
								</Nav.Link>
							</LinkContainer> */}
							<Theme theme={theme} setTheme={setTheme} />
							<Button
								variant={user ? 'danger' : 'success'}
								onClick={handleAuthClick}
								className="text-nowrap"
							>
								{user ? 'Sign Out' : 'Sign in with Google'}
							</Button>
						</div>
					</Navbar.Collapse>
				</Container>
			</Navbar>

			{Themes[theme] && (
				<ThemeContext.Provider value={Themes[theme]}>
					<div id="detail">
						<Outlet />
					</div>
				</ThemeContext.Provider>
			)}

			{/* Credits */}
			<Modal show={showAbout} onHide={() => setShowAbout(false)}>
				<Modal.Header closeButton>
					<Modal.Title>About</Modal.Title>
				</Modal.Header>
				<Modal.Body>
					<h4>Modes</h4>
					<p>
						Once you&apos;ve created a pack or imported a quizlet, you can summarize,
						improve, and learn the material.
					</p>

					<h5>Blitz</h5>
					<p>
						Write the correct definition in a fast-paced gamemode and get the last ten
						questions correct to move on.
					</p>

					<h5>Master</h5>
					<p>
						Use Pecto&apos;s premier spaced-repetition algorithm to generate a study
						plan. Master guarantees that you retain the information if you follow the
						schedule.
					</p>

					<h5>Comprehend</h5>
					<p>
						Produce summaries using Artificial Intelligence and Natural Language
						Processing.
					</p>

					<h5>Assess</h5>
					<p>
						Generate a personalized printable test to assess your knowledge. Choose from
						Multiple Choice, Written, True or False, and Extended Multiple Choice
						questions.
					</p>

					<h5>Extrapolate</h5>
					<p>Enter text to automatically generate cards through AI.</p>

					<h4>Features</h4>

					<p />

					<h5>Google Sign-In</h5>
					<p>Sign in with Google to synchronize your packs</p>

					<h5>Themes</h5>
					<p>
						Use the Dark/Darker theme for pleasant viewing and Neopolitan for a playful
						colors.
					</p>
				</Modal.Body>
			</Modal>

			{/* Username sign-in modal */}
			<Modal show={askForUsername}>
				<Modal.Header>
					<Modal.Title>Create a Username</Modal.Title>
				</Modal.Header>
				<Modal.Body>
					<Form.Control
						value={username}
						onChange={(e) => {
							setUsername(e.target.value)
						}}
						type="input"
						placeholder="Enter a unique username 3-15 characters long"
						aria-label="Enter a unique username 3-15 characters long"
					/>
					<Form.Text>{usernameAvailable}</Form.Text>
				</Modal.Body>
				<Modal.Footer>
					<Button
						variant="primary"
						disabled={!usernameAvailable}
						onClick={confirmUsername}
					>
						Confirm
					</Button>
				</Modal.Footer>
			</Modal>
		</>
	)
}

export default Root
