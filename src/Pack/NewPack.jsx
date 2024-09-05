import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

import Spinner from 'react-bootstrap/Spinner'

import { v4 as uuidv4 } from 'uuid'

import { BasePack } from '@/lib/schema'

import { useUser } from '@/stores/user'
import { shallow } from 'zustand/shallow'

// READ: https://beta.reactjs.org/learn/you-might-not-need-an-effect#initializing-the-application
// READ: https://beta.reactjs.org/learn/synchronizing-with-effects#how-to-handle-the-effect-firing-twice-in-development
// React Strict Mode renders components twice for reccomendations on your code,
// sending unnecessary API calls. Normally this isn't a problem, but this creates
// double the documents, which is annoying to clean up in Firestore
//
// This is why we use an id variable

const NewPack = function () {
	const [user, newPack, authenticated] = useUser(
		(state) => [state.user, state.newPack, state.authenticated],
		shallow
	)
	const navigate = useNavigate()

	var id = uuidv4()

	useEffect(() => {
		async function createNew() {
			if (authenticated()) {
				newPack(id, {
					...BasePack(),
					uid: user.uid,
					uuid: id,
					author: user.username,
					superficialAuthor: user.username,
				})
				navigate(`/view/${user.username}/${id}`)
			} else {
				newPack(id, { ...BasePack(), uuid: id })
				navigate(`/view/me/${id}`)
			}
		}
		createNew()
	}, [])

	return (
		<div className="d-flex justify-content-center">
			<Spinner animation="border" variant="dark" size="lg" />
		</div>
	)
}

export default NewPack
