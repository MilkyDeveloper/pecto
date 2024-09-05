import React, { Suspense, lazy } from 'react'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import ReactDOM from 'react-dom/client'
// import Pack from './Pack/Pack'
// import Root from './Root'
// import NewPack from './Pack/NewPack'
// import UserView from './UserView'
// import Home from './Home'
// import EditPack from './Pack/EditPack'
// import Blitz from './Pack/Experiences/Blitz/Blitz'
// import Comprehend from './Pack/Experiences/Comprehend/Comprehend'
// import Extrapolate from './Pack/Experiences/Extrapolate/Extrapolate'
// import Assess from './Pack/Experiences/Assess/Assess'

import NotFound from './NotFound'
import Loading from './Loading'

import { registerSW } from 'virtual:pwa-register'

registerSW({ immediate: true })

const Pack = lazy(() => import('./Pack/Pack'))
const Root = lazy(() => import('./Root'))
const NewPack = lazy(() => import('./Pack/NewPack'))
const UserView = lazy(() => import('./UserView'))
const Home = lazy(() => import('./Home'))
const EditPack = lazy(() => import('./Pack/EditPack'))
const Blitz = lazy(() => import('./Pack/Experiences/Blitz/Blitz'))
const Comprehend = lazy(() => import('./Pack/Experiences/Comprehend/Comprehend'))
const Extrapolate = lazy(() => import('./Pack/Experiences/Extrapolate/Extrapolate'))
const Assess = lazy(() => import('./Pack/Experiences/Assess/Assess'))
const Master = lazy(() => import('./Pack/Experiences/Master/Master'))
const Class = lazy(() => import('./Class/Class'))
const Foundation = lazy(() => import('./Foundation'))

const router = createBrowserRouter([
	{
		path: '/',
		element: <Root />,
		// errorElement: <NotFound />,
		children: [
			{
				path: '/',
				element: <Home />,
			},
			{
				path: 'view/:displayName',
				element: <UserView />,
			},
			{
				path: 'view/me',
				element: <Home />,
			},
			{
				path: 'view/:displayName/:packId',
				element: <Pack />,
			},
			{
				path: 'edit/:displayName/:packId',
				element: <EditPack />,
			},
			{
				path: 'blitz/:displayName/:packId',
				element: <Blitz />,
			},
			{
				path: 'comprehend/:displayName/:packId',
				element: <Comprehend />,
			},
			{
				path: 'extrapolate/:displayName/:packId',
				element: <Extrapolate />,
			},
			{
				path: 'assess/:displayName/:packId',
				element: <Assess />,
			},
			{
				path: 'master/:displayName/:packId',
				element: <Master />,
			},
			{
				path: 'new/pack',
				element: <NewPack />,
			},
			{
				path: 'new/pack',
				element: <NewPack />,
			},
			{
				path: 'class/:teacher/:classId',
				element: <Class />,
			},
			{
				path: 'foundation',
				element: <Foundation />,
			},
			// {
			// 	path: 'search/:searchTerm',
			// 	element: <SearchPacks />,
			// },
			{
				path: '*',
				element: <NotFound />,
			},
		],
	},
])

ReactDOM.createRoot(document.getElementById('root')).render(
	<React.StrictMode>
		<Suspense fallback={<Loading />}>
			<RouterProvider router={router} />
		</Suspense>
	</React.StrictMode>
)

// var script = document.createElement('script')
// script.src = '//cdn.jsdelivr.net/npm/eruda'
// document.body.appendChild(script)
// script.onload = function () {
// 	eruda.init()
// }
