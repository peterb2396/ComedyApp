// Navigation.js
import React from 'react';
import { NavigationContainer} from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/Ionicons';

import Page1 from './Page1.js'
import Page2 from './Page2.js'


const Tab = createBottomTabNavigator();



const Navigation = (props) => {

  return (
    <NavigationContainer>
      <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
    
          if (route.name === 'Page1') {
            iconName = focused ? 'cart' : 'cart-outline';
          } else if (route.name === 'Page2') {
            iconName = focused ? 'list' : 'list-outline';
          }
    
          return <Icon name={iconName} size={size} color={color} />;
        },
      })}
      >
        <Tab.Screen name="Page1" children={()=><Page1/>} />
        <Tab.Screen name="Page2" children={()=><Page2/>} />
    
       </Tab.Navigator>
    </NavigationContainer>
  );
};

export default Navigation;
