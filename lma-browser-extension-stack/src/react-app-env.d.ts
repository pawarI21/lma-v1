/// <reference types="react-scripts" />

declare namespace NodeJS {
	interface ProcessEnv {
		REACT_APP_API_URL: string; // Replace with your actual variables
		REACT_APP_AUTH_TOKEN: string;
		NODE_ENV: 'development' | 'production' | 'test'; // Optional, useful for React
		REACT_APP_USER_POOL_ID: string;
		REACT_APP_USER_POOL_CLIENT_ID: string;
		REACT_APP_IDENTITY_POOL_ID: string;
		REACT_APP_APPSYNC_GRAPHQL_URL: string;
		REACT_APP_AWS_REGION: string;
		REACT_APP_SETTINGS_PARAMETER: string;
		REACT_APP_ENABLE_LEX_AGENT_ASSIST: string;
		REACT_APP_LEX_IDENTITY_POOL_ID: string;
		REACT_APP_LEX_IDENTITY_POOL_CLIENT_ID: string;
		REACT_APP_LEX_USER_POOL_NAME: string;
		REACT_APP_LEX_DOMAIN_NAME: string;
		REACT_APP_LEX_BOT_ID: string;
		REACT_APP_LEX_BOT_ALIAS_ID: string;
		REACT_APP_LEX_BOT_LOCALE_ID: string;

		[key: string]: string | undefined; // Allow for other variables
	}
}
