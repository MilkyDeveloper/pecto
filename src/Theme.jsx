import React, { useEffect, useState } from 'react'
import Form from 'react-bootstrap/Form'

import { shallow } from 'zustand/shallow'
import { useUser } from '@/stores/user'

import { Themes } from './Themes'
import { syncLocalStorage } from './lib/firebase'

export default function Theme({ theme, setTheme }) {
	const [user] = useUser((state) => [state.user], shallow)

	return (
		<Form.Select
			value={theme}
			onChange={async (e) => {
				localStorage.setItem('theme', e.target.value)
				if (user?.uid !== undefined) {
					await syncLocalStorage(user.uid)
				}
				if (confirm('Would you like to reload the page to apply the theme?'))
					window.location.reload()
				else {
					setTheme(e.target.value)
				}
			}}
			className="w-auto me-2"
		>
			{Themes.map((theme, i) => (
				<option key={theme.id} value={i}>
					{theme.name}
				</option>
			))}
		</Form.Select>
	)
}
