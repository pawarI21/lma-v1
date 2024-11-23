/* eslint-disable @typescript-eslint/no-empty-function */
import React, { createContext, useContext, useState } from 'react';

const initialNavigationState = {
	currentScreen: 'login',
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	navigate: (screen: string) => {},
};

const NavigationContext = createContext(initialNavigationState);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function NavigationProvider({ children }: any) {
	const [currentScreen, setCurrentScreen] = useState(initialNavigationState.currentScreen);

	const navigate = (screen: string) => {
		console.log('navigate');
		setCurrentScreen(screen);
	};

	return <NavigationContext.Provider value={{ currentScreen, navigate }}>{children}</NavigationContext.Provider>;
}
export function useNavigation() {
	return useContext(NavigationContext);
}
export default NavigationProvider;
