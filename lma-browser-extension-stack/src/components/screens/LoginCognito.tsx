import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from 'components/ui/card';
import { Label } from 'components/ui/label';
import { Input } from 'components/ui/input';
import { Button } from 'components/ui/button';
import { signIn } from 'aws-amplify/auth';
import { toast } from 'hooks/use-toast';
import { useUserContext } from 'context/UserContext';

function LoginCognito() {
	const { updateCurrentSession } = useUserContext();
	const [isLoading, setIsLoading] = useState<boolean>(false);

	const [state, setState] = useState({
		email: '',
		password: '',
	});

	async function handleSignIn() {
		setIsLoading(true);
		try {
			const { isSignedIn, nextStep } = await signIn({
				username: state.email,
				password: state.password,
			});
			if (!isSignedIn) {
				toast({
					title: 'Error',
					description: 'Invalid username or password.',
				});
				setIsLoading(false);
				return;
			}
			if (nextStep.signInStep !== 'DONE') {
				setIsLoading(false);
				return;
			}
			await updateCurrentSession();
		} catch (error) {
			setIsLoading(false);
		} finally {
			setIsLoading(false);
		}
	}

	return (
		<div className='flex h-full'>
			<Card className='m-auto bg-slate-900 border-0'>
				<CardHeader className='space-y-1'>
					<CardTitle className='text-2xl font-bold text-slate-100'>Login</CardTitle>
					<CardDescription className='text-slate-200'>
						Enter your email and password to login to your account
					</CardDescription>
				</CardHeader>
				<CardContent>
					<div className='space-y-4'>
						<div className='space-y-2'>
							<Label className='text-slate-300' htmlFor='email'>
								Email
							</Label>
							<Input
								className='text-slate-100 text-sm font-normal placeholder:text-xs border-slate-600 bg-slate-50/5'
								id='email'
								type='email'
								placeholder='m@example.com'
								required
								value={state.email}
								onChange={(e) => setState((prev) => ({ ...prev, email: e.target.value }))}
							/>
						</div>
						<div className='space-y-2'>
							<Label className='text-slate-300' htmlFor='password'>
								Password
							</Label>
							<Input
								className='text-slate-100 text-sm font-normal placeholder:text-xs border-slate-600 bg-slate-50/5'
								id='password'
								type='password'
								required
								value={state.password}
								onChange={(e) => setState((prev) => ({ ...prev, password: e.target.value }))}
							/>
						</div>
						<Button type='submit' className='w-full' onClick={handleSignIn} disabled={isLoading}>
							Login{isLoading ? '...' : ''}
						</Button>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}

export default LoginCognito;
