// import * as React from 'react';
// import * as React from 'react'
// import * as RN from 'react-native'
// import * as t from 'io-ts'
// import * as H from 'history'
// // import * as ReactRouter from 'react-router'
// import * as ReactRouterNative from 'react-router-native'
// import * as ReactRouter from 'react-router'
// import * as moment from 'moment'

// import TrainingListScreen from './screens/TrainingListScreen'
// import TrainingScreen from './screens/TrainingScreen'
// import * as Util from './Utils'
// import * as Model from './Models'
// import * as BS from 'react-native-better-styles'
// const { s, colors } = BS

// const { width } = RN.Dimensions.get('window')

// const palette: BS.Palette = {
//   greyDarkest: '#2e333d',
//   greyDarker: '#434b55',
//   greyDark: '#555b65',
//   grey: '#8a949d',
//   greyLight: '#d2dadd',
//   greyLighter: '#e5eaee',
//   greyLightest: '#fafafa',
//   white: '#ffffff',
//   black: '#000000',
//   blueDark: '#2b55e4',
//   blue: '#2c5cff',
//   blueLight: '#587eff',
//   red: '#ff2b71',
//   orange: '#ff605e',
//   yellow: '#fbcf00',
//   green: '#0cddae',
//   t: 'rgba(0,0,0,0)'
// }

// const headings: BS.Multipliers = {
//   '7': 0.75,
//   '6': 0.85,
//   '5': 1,
//   '4': 1.2,
//   '3': 1.6,
//   '2': 2,
//   '1': 3.25
// }

// BS.build(
//   {
//     remSize: 15,
//     palette,
//     headings
//   } as BS.Options
// )

// interface AppState {
//   editingTrainingIndex: number | null
//   currentTraining: Model.OngoingTraining | Model.NotStartedTraining | Model.FinishedTraining | null
//   finishedTrainings: Model.FinishedTraining[]
//   animationCallback?: () => void
// }

// type AppProps = ReactRouter.RouteComponentProps<{}>

// class App extends React.Component<AppProps, AppState> {
//   constructor(props: AppProps) {
//     super(props)
//     this.state = {
//       editingTrainingIndex: null,
//       currentTraining: null,
//       finishedTrainings: []
//     }
//   }

//   async componentDidMount() {
//     await this.fetchData()
//     if (!!this.state.currentTraining) this.props.history.push('/training')
//   }

//   componentDidUpdate() {
//     this.storeData()
//   }

//   fetchData = async () => {
//     try {
//       const storedStateJSON = await RN.AsyncStorage.getItem('@Gymple:State')
//       if (storedStateJSON !== null) {
//         const state = await Util.decode(
//           JSON.parse(storedStateJSON),
//           t.interface({
//             currentTraining: t.union([
//               Model.TOngoingTraining,
//               Model.TNotStartedTraining,
//               Model.TFinishedTraining,
//               t.null
//             ]),
//             finishedTrainings: t.array(Model.TFinishedTraining)
//           })
//         )
//         this.setState(state)
//       }
//     } catch (error) {
//       await RN.AsyncStorage.setItem('@Gymple:State', '')
//       throw new Error(error)
//     }
//   }

//   storeData = async () => {
//     const { currentTraining, finishedTrainings } = this.state
//     try {
//       await RN.AsyncStorage.setItem(
//         '@Gymple:State',
//         JSON.stringify({
//           currentTraining,
//           finishedTrainings
//         })
//       )
//     } catch (error) {
//       throw new Error(error)
//     }
//   }

//   startNewTraining = () => {
//     this.setState({
//       currentTraining: {
//         kind: 'NotStartedTraining',
//         title: 'Training on ' + moment().format('dddd'),
//         plannedExercises: []
//       },
//       editingTrainingIndex: null
//     })
//   }

//   restartFinishedTraining = (finishedTraining: Model.FinishedTraining) => {
//     const notStartedTrainingFromFinished: Model.NotStartedTraining = {
//       kind: 'NotStartedTraining',
//       title: finishedTraining.title + ' copy',
//       plannedExercises: finishedTraining.completedExercises
//     }
//     this.setState({
//       currentTraining: notStartedTrainingFromFinished,
//       editingTrainingIndex: null
//     })
//   }

//   updateCurrentTraining = (
//     currentTraining: Model.OngoingTraining | Model.NotStartedTraining | Model.FinishedTraining,
//     editingTrainingIndex: number | null
//   ) => {
//     this.setState({
//       currentTraining,
//       editingTrainingIndex
//     })
//   }

//   finishCurrentTraining = () => {
//     const { currentTraining, finishedTrainings, editingTrainingIndex } = this.state
//     if (currentTraining) {
//       switch (currentTraining.kind) {
//         case 'OngoingTraining':
//           const newFinishedTraining: Model.FinishedTraining = {
//             kind: 'FinishedTraining',
//             title: currentTraining.title,
//             startedAt: currentTraining.startedAt,
//             finishedAt: new Date(),
//             completedExercises: currentTraining.completedExercises
//           }
//           this.setState({
//             currentTraining: null,
//             finishedTrainings:
//               newFinishedTraining.completedExercises.length > 0
//                 ? [newFinishedTraining, ...finishedTrainings]
//                 : finishedTrainings
//           })
//           break
//         case 'FinishedTraining':
//           this.setState({
//             currentTraining: null,
//             editingTrainingIndex: null,
//             finishedTrainings:
//               currentTraining.completedExercises.length > 0
//                 ? finishedTrainings.map((t, i) => (i === editingTrainingIndex ? currentTraining : t))
//                 : finishedTrainings.filter((_, i) => i !== editingTrainingIndex)
//           })
//           break
//         case 'NotStartedTraining':
//           this.setState({ currentTraining: null })
//           break
//         default:
//           Util.shouldNeverHappen(currentTraining)
//       }
//     }
//   }

//   removeFinishedTraining = (index: number) => {
//     const { finishedTrainings } = this.state
//     this.setState({
//       finishedTrainings: finishedTrainings.filter((_, i) => i !== index)
//     })
//   }

//   render() {
//     const { history, location } = this.props
//     const { currentTraining, finishedTrainings, editingTrainingIndex, animationCallback } = this.state

//     const uniqeCompletedExercises = finishedTrainings.reduce((completedExercises, training) => {
//       const completedExercisesTitles: string[] = completedExercises.map(e => e.title)
//       return [
//         ...completedExercises,
//         ...training.completedExercises.filter(e => completedExercisesTitles.indexOf(e.title) === -1)
//       ] as Model.Exercise[]
//     }, [] as Model.Exercise[])

//     return (
//       <AnimatedChildRoute animationCallback={animationCallback} location={location} history={history}>
//         <ReactRouterNative.Switch location={this.props.location}>
//           <ReactRouterNative.Route
//             exact
//             path="/"
//             render={() =>
//               <TrainingListScreen
//                 editingTrainingIndex={editingTrainingIndex}
//                 finishedTrainings={finishedTrainings}
//                 onStartNewTraining={() => {
//                   this.startNewTraining()
//                   history.push('/training')
//                 }}
//                 onOpenTraining={(training, i) => {
//                   this.updateCurrentTraining(training, i)
//                   history.push('/training')
//                 }}
//                 onRemoveFinishedTraining={this.removeFinishedTraining}
//               />}
//           />
//           <ReactRouterNative.Route
//             exact
//             path="/training"
//             render={() =>
//               currentTraining
//                 ? <TrainingScreen
//                     training={currentTraining}
//                     completedExercises={uniqeCompletedExercises}
//                     onFinish={() => {
//                       this.setState(
//                         {
//                           animationCallback: () => {
//                             this.finishCurrentTraining()
//                             this.setState({ animationCallback: undefined })
//                           }
//                         },
//                         () => history.goBack()
//                       )
//                     }}
//                     onRestartFinished={this.restartFinishedTraining}
//                     onUpdate={training => this.updateCurrentTraining(training, editingTrainingIndex)}
//                   />
//                 : <ReactRouterNative.Redirect to="/" />}
//           />
//         </ReactRouterNative.Switch>
//       </AnimatedChildRoute>
//     )
//   }
// }

// interface AnimatedChildRouteProps {
//   location: H.Location
//   history: H.History
//   children: React.ReactNode
//   animationCallback?: () => void
// }

// interface AnimatedChildRouteState {
//   prevChildren: React.ReactNode | null
//   anim: RN.Animated.Value
// }

// class AnimatedChildRoute extends React.Component<AnimatedChildRouteProps, AnimatedChildRouteState> {
//   constructor(props: AnimatedChildRouteProps) {
//     super(props)
//     this.state = {
//       anim: new RN.Animated.Value(100),
//       prevChildren: null
//     }
//   }

//   componentWillReceiveProps(nextProps: AnimatedChildRouteProps) {
//     const { animationCallback } = this.props
//     if (this.props.location.pathname !== nextProps.location.pathname) {
//       this.state.anim.setValue(0)
//       this.setState(
//         {
//           prevChildren: this.props.children
//         },
//         () => {
//           RN.Animated
//             .timing(this.state.anim, {
//               easing: RN.Easing.quad,
//               toValue: 100,
//               duration: 300
//             })
//             .start(() => {
//               this.setState(
//                 {
//                   prevChildren: null
//                 },
//                 () => !!animationCallback && animationCallback()
//               )
//             })
//         }
//       )
//     }
//   }

//   render() {
//     const { prevChildren, anim } = this.state
//     const { children, history } = this.props

//     if (history.action === 'POP')
//       return (
//         <RN.View style={{ flex: 1 }}>
//           <RN.View style={[s.absolute, s.absolute__fill]}>
//             {children}
//           </RN.View>
//           {prevChildren &&
//             <RN.Animated.View
//               style={[
//                 s.absolute,
//                 s.absolute__fill,
//                 {
//                   shadowColor: colors.black_20,
//                   shadowOpacity: 0.4,
//                   shadowRadius: 40,
//                   transform: [
//                     {
//                       translateX: anim.interpolate({
//                         inputRange: [0, 100],
//                         outputRange: [0, width]
//                       })
//                     }
//                   ]
//                 }
//               ]}
//             >
//               {prevChildren}
//             </RN.Animated.View>}
//         </RN.View>
//       )
//     return (
//       <RN.View style={{ flex: 1 }}>
//         {prevChildren &&
//           <RN.View style={[s.absolute, s.absolute__fill]}>
//             {prevChildren}
//           </RN.View>}
//         <RN.Animated.View
//           style={[
//             s.absolute,
//             s.absolute__fill,
//             {
//               shadowColor: colors.black_20,
//               shadowOpacity: 0.4,
//               shadowRadius: 40,
//               transform: [
//                 {
//                   translateX: anim.interpolate({
//                     inputRange: [0, 100],
//                     outputRange: [width, 0]
//                   })
//                 }
//               ]
//             }
//           ]}
//         >
//           {children}
//         </RN.Animated.View>
//       </RN.View>
//     )
//   }
// }

// const Routed = ReactRouter.withRouter(App) as any
// class RoutedApp extends React.Component {
//   render() {
//     return (
//       <ReactRouterNative.NativeRouter>
//         <Routed />
//       </ReactRouterNative.NativeRouter>
//     )
//   }
// }

import * as React from 'react'
import * as RN from 'react-native'
import * as BS from 'react-native-better-styles'
import * as ReactRouterNative from 'react-router-native'
import * as MobxReact from 'mobx-react/native'

import { stores } from './store/index'

import { palette, multipliers, headings, fonts } from './stylesSettings'
import { AnimatedChildRoute, Route, Redirect } from './components/Router'

import screenWrapper from './components/ScreenWrapper'

import SetScreen from './screens/SetScreen'
import SelectExerciseScreen from './screens/SelectExerciseScreen'
import EditExerciseScreen from './screens/EditExerciseScreen'
import TrainingScreen from './screens/TrainingScreen'
import TrainingsListScreen from './screens/TrainingsListScreen'

const { width, height } = RN.Dimensions.get('window')

function calculateRemSize(width: number): number {
  if (width > 400) return 17
  else if (width > 370) return 15
  return 13
}

// building better-styles
BS.build({
  remSize: calculateRemSize(width > height ? height : width),
  palette,
  multipliers,
  headings,
  fonts
})

// fill dataStore with initial data
stores.dataStore.generateInitialData()

@MobxReact.observer
class App extends React.Component<{}> {
  render() {
    return (
      <MobxReact.Provider {...stores}>
        <ReactRouterNative.Router history={stores.routing.history}>
          <AnimatedChildRoute pathname={stores.routing.location.pathname}>
            <ReactRouterNative.Switch>
              <Route exact path="/" render={() => <Redirect to={{ path: '/trainingslist' }} />} />
              <Route exact path="/set" component={screenWrapper(SetScreen)} />
              <Route exact path="/selectexercise" component={screenWrapper(SelectExerciseScreen)} />
              <Route exact path="/editexercise" component={screenWrapper(EditExerciseScreen)} />
              <Route exact path="/training" component={screenWrapper(TrainingScreen)} />
              <Route exact path="/trainingslist" component={screenWrapper(TrainingsListScreen)} />
              {/* <Route exact path="/login" component={screenWrapper(LoginScreen)} />
              <Route exact path="/signup" component={screenWrapper(SignupScreen)} />
              <Route exact authRequired path="/carsList" component={screenWrapper(CarsListScreen)} />
              <Route exact authRequired path="/carDamage" component={screenWrapper(CarDamageScreen)} />
              <Route exact authRequired path="/car" component={screenWrapper(CarScreen)} /> */}
            </ReactRouterNative.Switch>
          </AnimatedChildRoute>
        </ReactRouterNative.Router>
      </MobxReact.Provider>
    )
  }
}

RN.AppRegistry.registerComponent('Gymple', () => App)
// import * as ReactIntl from 'react-intl';
// import 'intl';

// import localizations from './localizations';

/*
const en = require('react-intl/locale-data/en');
const ru = require('react-intl/locale-data/ru');

ReactIntl.addLocaleData([...en, ...ru]);

*/
