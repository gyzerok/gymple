import * as React from 'react'
import * as RN from 'react-native'
import * as t from 'io-ts'
import Icon from 'react-native-vector-icons/Ionicons'
import Swipeout from 'react-native-swipeout'
import * as moment from 'moment'

import TrainingScreen from './TrainingScreen'
import * as Util from '../Util'
import * as Model from '../Model'

import { s, colors, sizes } from './../styles'

interface TrainingsListState {
  editingTrainingIndex: number | null
  currentTraining: Model.OngoingTraining | Model.NotStartedTraining | Model.FinishedTraining | null
  finishedTrainings: Model.FinishedTraining[]
  isScrollEnabled: boolean
}

export default class TrainingsListScreen extends React.PureComponent<void, TrainingsListState> {
  constructor() {
    super()
    this.state = {
      editingTrainingIndex: null,
      currentTraining: null,
      finishedTrainings: [],
      isScrollEnabled: true
    }
  }

  componentDidMount() {
    this.fetchData()
  }

  fetchData = async () => {
    try {
      const storedStateJSON = await RN.AsyncStorage.getItem('@Gymple:State')
      if (storedStateJSON !== null) {
        Util.decode(
          JSON.parse(storedStateJSON),
          t.interface({
            currentTraining: t.union([
              Model.TOngoingTraining,
              Model.TNotStartedTraining,
              Model.TFinishedTraining,
              t.null
            ]),
            finishedTrainings: t.array(Model.TFinishedTraining),
            isScrollEnabled: t.boolean
          })
        )
          .then(state => this.setState(state))
          .catch(async () => {
            try {
              await RN.AsyncStorage.setItem('@Gymple:State', '')
            } catch (error) {
              throw new Error(error)
            }
          })
      }
    } catch (error) {
      throw new Error(error)
    }
  }

  storeData = async () => {
    try {
      await RN.AsyncStorage.setItem('@Gymple:State', JSON.stringify(this.state))
    } catch (error) {
      throw new Error(error)
    }
  }

  startNewTraining = () => {
    this.setState(
      {
        currentTraining: {
          kind: 'NotStartedTraining',
          title: 'Training on ' + moment().format('dddd'),
          plannedExercises: []
        },
        editingTrainingIndex: null
      },
      () => this.storeData()
    )
  }

  restartFinishedTraining = (finishedTraining: Model.FinishedTraining) => {
    const notStartedTrainingFromFinished: Model.NotStartedTraining = {
      kind: 'NotStartedTraining',
      title: finishedTraining.title + ' copy',
      plannedExercises: finishedTraining.completedExercises
    }
    this.setState(
      {
        currentTraining: notStartedTrainingFromFinished,
        editingTrainingIndex: null
      },
      () => this.storeData()
    )
  }

  updateCurrentTraining = (
    currentTraining: Model.OngoingTraining | Model.NotStartedTraining | Model.FinishedTraining,
    editingTrainingIndex: number | null
  ) => {
    this.setState(
      {
        currentTraining,
        editingTrainingIndex
      },
      () => this.storeData()
    )
  }

  finishTraining = () => {
    const { currentTraining, finishedTrainings, editingTrainingIndex } = this.state
    if (currentTraining) {
      switch (currentTraining.kind) {
        case 'OngoingTraining':
          const newFinishedTraining: Model.FinishedTraining = {
            kind: 'FinishedTraining',
            title: currentTraining.title,
            startedAt: currentTraining.startedAt,
            finishedAt: new Date(),
            completedExercises: currentTraining.completedExercises
          }
          this.setState(
            {
              currentTraining: null,
              finishedTrainings:
                newFinishedTraining.completedExercises.length > 0
                  ? [newFinishedTraining, ...finishedTrainings]
                  : finishedTrainings
            },
            () => this.storeData()
          )
          break
        case 'FinishedTraining':
          this.setState(
            {
              currentTraining: null,
              editingTrainingIndex: null,
              finishedTrainings:
                currentTraining.completedExercises.length > 0
                  ? finishedTrainings.map((t, i) => (i === editingTrainingIndex ? currentTraining : t))
                  : finishedTrainings.filter((_, i) => i !== editingTrainingIndex)
            },
            () => this.storeData()
          )
          break
        case 'NotStartedTraining':
          this.setState(
            {
              currentTraining: null
            },
            () => this.storeData()
          )
          break
        default:
          Util.shouldNeverHappen(currentTraining)
      }
    }
  }

  removeFinishedTraining = (index: number) => {
    const { finishedTrainings } = this.state
    this.setState(
      {
        finishedTrainings: finishedTrainings.filter((_, i) => i !== index)
      },
      () => this.storeData()
    )
  }

  allowScroll = (isScrollEnabled: boolean) => {
    this.setState({ isScrollEnabled })
  }

  render() {
    const { currentTraining, finishedTrainings, isScrollEnabled, editingTrainingIndex } = this.state

    if (currentTraining) {
      return (
        <TrainingScreen
          training={currentTraining}
          onFinish={this.finishTraining}
          onRestartFinished={this.restartFinishedTraining}
          onUpdate={training => this.updateCurrentTraining(training, editingTrainingIndex)}
        />
      )
    }

    if (finishedTrainings.length === 0) {
      return (
        <RN.View style={[s.flx_i, s.pv4, s.jcc, s.aic, s.bg_blue]}>
          <RN.StatusBar barStyle="light-content" translucent={true} backgroundColor={colors.t} />
          <RN.Text style={[s.white_50, s.f3, s.fw2, s.tc, s.ph4, s.mb1]}>
            You haven't completed any traingins yet
          </RN.Text>
          <RN.TouchableOpacity
            style={[s.asc, s.bg_green, s.br2, s.h325, s.jcc, s.ph3, s.mt075]}
            onPress={this.startNewTraining}
          >
            <RN.Text style={[s.f4, s.white, s.tc, s.b]}>Start First Training</RN.Text>
          </RN.TouchableOpacity>
        </RN.View>
      )
    }

    return (
      <RN.View style={[s.flx_i, s.jcsb, s.bg_greyLightest]}>
        <RN.StatusBar barStyle="light-content" translucent={true} backgroundColor={colors.t} />
        <RN.View style={[s.bg_blue, s.pt2, s.ph125, s.pb1]}>
          <RN.Text style={[s.white, s.fw3, s.f4, s.mt05]}>My Trainigs</RN.Text>
        </RN.View>
        <RN.View style={[s.flx_i, s.jcsb]}>
          <RN.ScrollView style={[s.flx_i]} scrollEnabled={isScrollEnabled}>
            {finishedTrainings.map((training, i) =>
              <Swipeout
                autoClose={true}
                key={String(training.finishedAt)}
                backgroundColor={colors.t}
                scroll={isAllow => this.allowScroll(isAllow)}
                buttonWidth={sizes[5]}
                right={[
                  {
                    onPress: () => this.removeFinishedTraining(i),
                    component: (
                      <RN.View style={[s.w5, s.bg_orange, s.jcc, s.flx_i]}>
                        <Icon name="md-trash" style={[s.white, s.f3, s.tc]} />
                      </RN.View>
                    )
                  }
                ]}
              >
                <RN.TouchableOpacity onPress={() => this.updateCurrentTraining(training, i)}>
                  <TrainingsListItem training={training} />
                </RN.TouchableOpacity>
              </Swipeout>
            )}
          </RN.ScrollView>
          <RN.View style={s.pb175}>
            <RN.TouchableOpacity
              style={[s.asc, s.bg_green, s.br2, s.h325, s.jcc, s.ph3, s.mt075]}
              onPress={this.startNewTraining}
            >
              <RN.Text style={[s.f4, s.white, s.tc, s.b]}>Start New Training</RN.Text>
            </RN.TouchableOpacity>
          </RN.View>
        </RN.View>
      </RN.View>
    )
  }
}

const TrainingsListItem = ({ training }: { training: Model.FinishedTraining }) => {
  return (
    <RN.View style={[s.pv1, s.bbw1, s.b_black_5, s.pr1, s.ml125]}>
      <RN.View style={[s.flx_row, s.jcsb, s.aifs]}>
        <RN.Text style={[s.f3, s.fw2, s.bg_t, s.blue, s.flx_i, s.mb025]}>
          {training.title}
        </RN.Text>
      </RN.View>
      <RN.Text style={[s.f6, s.black_50, s.fw3]}>
        {moment(training.finishedAt).format('dddd (MMMM Do)')}
      </RN.Text>
    </RN.View>
  )
}
