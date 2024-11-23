import React from 'react';
import ReactDOM from 'react-dom/client';
import '@cloudscape-design/global-styles/index.css';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { Theme, applyTheme } from '@cloudscape-design/components/theming';
import NavigationProvider from './context/NavigationContext';
import SettingsProvider from './context/SettingsContext';
import UserProvider from './context/UserContext';
import IntegrationProvider from './context/ProviderIntegrationContext';
import { amplifyConfig } from 'amplifyConfig';

const theme: Theme = {
	tokens: {
		colorTextButtonPrimaryDefault: {
			light: 'grey-900',
			dark: 'grey-900',
		},
		colorBackgroundButtonPrimaryDefault: {
			light: '#FF9900',
			dark: '#FF9900',
		},
		colorBackgroundButtonPrimaryActive: {
			light: '#FF9900',
			dark: '#FF9900',
		},
		colorBackgroundButtonPrimaryHover: {
			light: '#FF9900',
			dark: '#FF9900',
		},
		colorTextButtonPrimaryActive: {
			light: '#grey-900',
			dark: '#grey-900',
		},
		colorTextButtonPrimaryHover: {
			light: '#grey-900',
			dark: '#grey-900',
		},
	},
	contexts: {
		header: {
			tokens: {
				colorTextButtonPrimaryDefault: {
					light: 'grey-900',
					dark: 'grey-900',
				},
				colorBackgroundButtonPrimaryDefault: {
					light: '#FF9900',
					dark: '#FF9900',
				},
				colorBackgroundButtonPrimaryActive: {
					light: '#FF9900',
					dark: '#FF9900',
				},
			},
		},
	},
};
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const { reset } = applyTheme({ theme });
amplifyConfig();

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
root.render(
	<React.StrictMode>
		<SettingsProvider>
			<UserProvider>
				<NavigationProvider>
					<IntegrationProvider>
						<App />
					</IntegrationProvider>
				</NavigationProvider>
			</UserProvider>
		</SettingsProvider>
	</React.StrictMode>
);

reportWebVitals();
