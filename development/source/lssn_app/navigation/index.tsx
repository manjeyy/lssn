import { createStaticNavigation, StaticParamList } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import Splash from '../screens/splash';
import Login from '../screens/login';
import Signup from '../screens/signup';
import Home from '../screens/home';
import Details from '../screens/details';
import Profile from '../screens/profile';
import { BackButton } from '../components/BackButton';
import { darkTheme } from '../lib/theme';

const Stack = createStackNavigator({
  initialRouteName: 'Splash',
  screens: {
    Splash: {
      screen: Splash,
      options: { headerShown: false },
    },
    Login: {
      screen: Login,
      options: { headerShown: false },
    },
    Signup: {
      screen: Signup,
      options: { headerShown: false },
    },
    Explore: {
      screen: Home,
      options: { headerShown: false },
    },
    Lesson: {
      screen: Details,
      options: { headerShown: false },
    },
    Profile: {
      screen: Profile,
      options: ({ navigation }) => ({
        headerLeft: () => <BackButton onPress={navigation.goBack} />,
        headerTitle: 'Profile',
        headerTitleStyle: { color: darkTheme.foreground, fontWeight: '700' },
        headerStyle: { backgroundColor: darkTheme.background },
        headerShadowVisible: false,
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
