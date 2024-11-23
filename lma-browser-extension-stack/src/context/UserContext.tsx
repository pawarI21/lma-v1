/* eslint-disable @typescript-eslint/no-empty-function */
import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { AuthSession, fetchAuthSession, FetchAuthSessionOptions, signOut } from 'aws-amplify/auth';

interface User {
	id_token?: string;
	access_token?: string;
}
interface IUserProvider {
	children: React.ReactNode;
}

interface IInitialUserContext {
	user: User;
	logout: () => void;
	loggedIn: boolean;
	checkTokenExpired: () => Promise<boolean>;
	updateCurrentSession: (options?: FetchAuthSessionOptions) => Promise<AuthSession | null>;
}

const initialUserContext: IInitialUserContext = {
	user: {},
	logout: () => {},
	loggedIn: false,
	checkTokenExpired: async () => {
		return true;
	},
	updateCurrentSession: async () => {
		return null;
	},
};
const UserContext = createContext<IInitialUserContext>(initialUserContext);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function UserProvider({ children }: IUserProvider) {
	const [user, setUser] = useState<User>({});
	const [loggedIn, setLoggedIn] = useState(false);

	const updateCurrentSession = useCallback(
		async (options?: FetchAuthSessionOptions) => {
			try {
				const auth = await fetchAuthSession(options);
				if (auth.tokens) {
					setUser({
						access_token: auth.tokens.accessToken.toString(),
						id_token: auth.tokens.idToken?.toString(),
					});
					setLoggedIn(true);
					return auth;
				} else {
					setUser({});
					setLoggedIn(false);
					return null;
				}
			} catch (err) {
				setUser({});
				setLoggedIn(false);
				console.log(err);
				return null;
			}
		},
		[setUser, setLoggedIn]
	);

	const checkTokenExpired = useCallback(async () => {
		const user = await updateCurrentSession({ forceRefresh: true });
		if (!user) {
			return true;
		}
		return false;
	}, []);

	// Load user
	useEffect(() => {
		updateCurrentSession();
	}, []);

	const logout = useCallback(async () => {
		try {
			await signOut();
		} catch (error) {
			console.log('error signing out: ', error);
		}
		setUser({});
		setLoggedIn(false);
	}, [user, loggedIn]);

	return (
		<UserContext.Provider value={{ user, logout, loggedIn, checkTokenExpired, updateCurrentSession }}>
			{children}
		</UserContext.Provider>
	);
}
export function useUserContext() {
	return useContext(UserContext);
}
export default UserProvider;
