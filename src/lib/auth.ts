const userName = process.env.adminUserName || 'admin';
const secretPassword = process.env.adminPassword || 'admin';

export const authenticate = (user: string | undefined, pass: string | undefined) => {
    return user == userName && pass == secretPassword
}

export const credentials = {
    userName,
    secretPassword,
    base64: Buffer.from(`${userName}:${secretPassword}`).toString('base64')
}