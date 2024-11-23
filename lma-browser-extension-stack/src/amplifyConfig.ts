import { Amplify } from 'aws-amplify';
import { KeyValueStorageInterface } from 'aws-amplify/utils';
import { cognitoUserPoolsTokenProvider } from 'aws-amplify/auth/cognito';

class MyCustomStorage implements KeyValueStorageInterface {
	storageObject: Record<string, string> = {};

	async setItem(key: string, value: string): Promise<void> {
		if (chrome.storage) {
			chrome.storage.local.set({ [key]: value });
		} else {
			localStorage.setItem(key, value);
		}
	}
	async getItem(key: string): Promise<string | null> {
		if (chrome.storage) {
			return await new Promise((resolve, reject) => {
				chrome.storage.local.get(key, (data) => {
					if (chrome.runtime.lastError) {
						reject(null);
					} else {
						// eslint-disable-next-line @typescript-eslint/no-explicit-any
						resolve(data as any);
					}
				});
			});
		} else {
			return localStorage.getItem(key);
		}
	}
	async removeItem(key: string): Promise<void> {
		if (chrome.storage) {
			chrome.storage.local.remove(key);
		} else {
			localStorage.removeItem(key);
		}
	}
	async clear(): Promise<void> {
		if (chrome.storage) {
			chrome.storage.local.clear();
		} else {
			localStorage.clear();
		}
	}
}

export const amplifyConfig = () => {
	cognitoUserPoolsTokenProvider.setKeyValueStorage(new MyCustomStorage());
	Amplify.configure({
		Auth: {
			Cognito: {
				userPoolId: process.env.REACT_APP_USER_POOL_ID,
				userPoolClientId: process.env.REACT_APP_USER_POOL_CLIENT_ID,
				identityPoolId: process.env.REACT_APP_IDENTITY_POOL_ID,
				loginWith: {
					email: true,
				},
				signUpVerificationMethod: 'code',
				userAttributes: {
					email: {
						required: true,
					},
				},
				allowGuestAccess: true,
				passwordFormat: {
					minLength: 8,
					requireLowercase: true,
					requireUppercase: true,
					requireNumbers: true,
					requireSpecialCharacters: true,
				},
			},
		},
		API: {
			Events: {
				endpoint: process.env.REACT_APP_APPSYNC_GRAPHQL_URL,
				region: process.env.REACT_APP_AWS_REGION,
				defaultAuthMode: 'userPool',
			},
			GraphQL: {
				endpoint: process.env.REACT_APP_APPSYNC_GRAPHQL_URL,
				region: process.env.REACT_APP_AWS_REGION,
				defaultAuthMode: 'userPool',
			},
		},
	});
};
