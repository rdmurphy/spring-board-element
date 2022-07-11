export const publicKey =
	'41299b80b09f0bd623f3ce230328a7bab374975a7c497a5afb298b30183e0623';
export const privateKey =
	'52d117b99f320a1a66df787a6d86c7adb77ae4f881bdd5705c1bbbbdcd50f9c5';
export const generateBoardHTML = () =>
	Buffer.from(
		`<time datetime="${new Date().toISOString()}"></time><style>p{color:red}time{display:none}</style><p>Foo bar blee. Here's a number to prove it's me: <span id="number">83</span>.</p>`,
	);
