import { createStaticNavigation, StaticParamList } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import Login from '../screens/login';
import Signup from '../screens/signup';
import Home from '../screens/home';
import Details from '../screens/details';
import { BackButton } from '../components/BackButton';

const Stack = createStackNavigator({
  screens: {
    Login: {
      screen: Login,
      options: {
        headerShown: false,
      },
    },
    Signup: {
      screen: Signup,
      options: {
        headerShown: false,
      },
    },
    Explore: {
      screen: Home,
      options: {
        headerShown: false,
      },
    },
    Lesson: {
      screen: Details,
      options: ({ navigation }) => ({
        headerLeft: () => <BackButton onPress={navigation.goBack} />,
        headerTitle: 'Lesson',
      }),
    },
  },
});

type RootNavigatorParamList = StaticParamList<typeof Stack>;

declare global {
  namespace ReactNavigation {
    // eslint-disable-next-line @typescript-eslint/no-empty-object-type
    interface RootParamList extends RootNavigatorParamList {}
  }
}

const Navigation = createStaticNavigation(Stack);
export default Navigation;
