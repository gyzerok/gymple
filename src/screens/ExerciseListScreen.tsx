import * as React from 'react'
import * as RN from 'react-native'
import Icon from 'react-native-vector-icons/Ionicons'

import * as Util from '../Util'
import * as Model from '../Model'
import * as ExerciseData from '../ExercisesData'

import { s, sizes, colors } from './../styles'

interface ExerciseListProps {
  onClose: () => void
  onSelect: (exercise: Model.Exercise) => void
}

interface ExerciseListState {
  filter: string | null
  exercises: Model.ExerciseTemplate[]
}

export default class ExerciseListScreen extends React.PureComponent<ExerciseListProps, ExerciseListState> {
  constructor(props: ExerciseListProps) {
    super(props)
    this.state = {
      filter: null,
      exercises: generateDefaultExersices(ExerciseData.exercises, ExerciseData.muscles)
    }
  }

  handleSelect = (exerciseTemplate: Model.ExerciseTemplate) => {
    this.props.onSelect(convertTemplateToGenericExercise(exerciseTemplate))
  }

  render() {
    const { filter, exercises } = this.state
    const { onClose } = this.props
    return (
      <RN.View style={[s.flx_i, s.jcsb, s.bg_greyLightest]}>
        <RN.View style={[s.bg_blue, s.pt2, s.ph05, s.pb05]}>
          <RN.TouchableOpacity onPress={onClose}>
            <Icon name="md-close" size={sizes[175]} color={colors.white} style={s.ml075} />
          </RN.TouchableOpacity>
          <RN.View style={[s.mv05, s.bg_blueDark, s.ph075, s.h3, s.flx_row, s.br025]}>
            <RN.View style={[s.w2, s.jcc]}>
              <Icon name="ios-search" size={sizes[175]} color={colors.white_20} />
            </RN.View>
            <RN.TextInput
              underlineColorAndroid={colors.t}
              placeholderTextColor={colors.white_20}
              style={[s.bg_t, s.f4, s.flx_i, s.white, s.h3, s.jcc]}
              placeholder="Search through exercises"
              onChangeText={text => this.setState({ filter: text })}
            />
          </RN.View>
        </RN.View>
        <RN.ScrollView style={[s.flx_i]}>
          {exercises.filter(exercise => (filter ? exercise.title.includes(filter) : true)).map(exercise =>
            <RN.TouchableOpacity key={exercise.title} onPress={() => this.handleSelect(exercise)}>
              <RN.View style={[s.pv1, s.bbw1, s.b_black_5, s.pr1, s.ml125]}>
                <RN.View style={[s.flx_row, s.jcsb, s.aifs]}>
                  <RN.Text style={[s.f4, s.fw3, s.bg_t, s.blue, s.flx_i, s.mb025, s.lh125]}>
                    {exercise.title}
                  </RN.Text>
                </RN.View>
                <RN.Text style={[s.f7, s.fw3]}>
                  {exercise.targetMuscles.map(({ title }) => title).join(', ')}
                </RN.Text>
              </RN.View>
            </RN.TouchableOpacity>
          )}
        </RN.ScrollView>
      </RN.View>
    )
  }
}

const generateDefaultExersices = (
  exerscsesData: ExerciseData.ExerciseData[],
  musclesData: ExerciseData.MuscleData[]
): Model.ExerciseTemplate[] => {
  return exerscsesData.map(({ title, targetMusclesIds, additionalMusclesIds }) => {
    const targetMuscles = [...targetMusclesIds, ...additionalMusclesIds].reduce((acc, muscleId) => {
      const muscleData = musclesData.find(muscle => muscle.id === muscleId)
      if (muscleData) {
        return [...acc, muscleData]
      }
      return acc
    }, [] as ExerciseData.MuscleData[])

    return {
      kind: 'ExerciseTemplate',
      title,
      restSeconds: 90,
      targetMuscles
    } as Model.ExerciseTemplate
  })
}

const convertTemplateToGenericExercise = (exercise: Model.Exercise | Model.ExerciseTemplate): Model.Exercise => {
  switch (exercise.kind) {
    case 'Exercise':
      return exercise
    case 'ExerciseTemplate':
      return {
        kind: 'Exercise',
        title: exercise.title,
        restSeconds: exercise.restSeconds,
        targetMuscles: exercise.targetMuscles,
        attempts: {
          first: { weight: 30, repetitions: 8 },
          other: []
        }
      }
    default:
      return Util.shouldNeverHappen(exercise)
  }
}