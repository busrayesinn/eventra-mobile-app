import React from 'react';
import 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AppNavigator from './src/navigation/AppNavigator';
import CustomToast from './src/components/CustomToast';

function App(): React.JSX.Element {
  return (
    <SafeAreaProvider>
      <AppNavigator />
      <CustomToast />
    </SafeAreaProvider>
  );
}

export default App;