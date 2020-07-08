import fetch from 'node-fetch';

const baseUserSourceUrl = process.env.BASE_USER_SOURCE_URL; //`http://localhost:500/api`;


export async function createUser(userInputs) {
   
    const response = await fetch(`${baseUserSourceUrl}/auth/signup`, {
        method: 'post',
        body: JSON.stringify(userInputs),
        headers: {'Content-Type': 'application/json'}
    });

    const responseChecked = checkStatus(response);
    const confirmationStatus = responseChecked? { userCreated: true } : { userCreated: false };

    return confirmationStatus;
}

export async function signIn(userInputs) {

    const response = await fetch(`${baseUserSourceUrl}/auth/signin`, {
        method: 'post',
        body: JSON.stringify(userInputs),
        headers: {'Content-Type': 'application/json'}
    });

    const responseChecked = checkStatus(response);
    const jsonResponse = await responseChecked.json();

    return {
        userInfo: jsonResponse.userInfo,
        accessToken: jsonResponse.accessToken,
        refreshToken: jsonResponse.refreshToken
    }
}

export async function logout(userInputs) {
   
    const response = await fetch(`${baseUserSourceUrl}/auth/logout`, {
        method: 'post',
        body: JSON.stringify(userInputs),
        headers: {'Content-Type': 'application/json'}
    });

    const responseChecked = checkStatus(response);
    const confirmationStatus = responseChecked? { userLoggedOut: true } : { userLoggedOut: false };

    return confirmationStatus;
}

export async function getRefreshedToken(userInputs) {

    const response = await fetch(`${baseUserSourceUrl}/auth/refreshtoken`, {
        method: 'post',
        body: JSON.stringify(userInputs),
        headers: {'Content-Type': 'application/json'}
    });

    const responseChecked = checkStatus(response);
    const jsonResponse = await responseChecked.json();

    return jsonResponse
}

export async function getUserById(authorization) {

    const response = await fetch(`${baseUserSourceUrl}/content/user`, {
        method: 'post',
        body: JSON.stringify({id: authorization.id}),
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `${authorization.token}`,
        }
    });

    const responseChecked = checkStatus(response);    
    const jsonResponse = await responseChecked.json();
    
    return {...jsonResponse}
}

export async function getCurrentUser(authorization) {

    const response = await fetch(`${baseUserSourceUrl}/content/user`, {
        method: 'post',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `${authorization.token}`,
        }
    });

    const responseChecked = checkStatus(response);

    const jsonResponse = await responseChecked.json();
    
    return {...jsonResponse}
}

export async function getUsersWithIDs(authorization) {
    
    const response = await fetch(`${baseUserSourceUrl}/content/users`, {
        method: 'post',
        body: JSON.stringify({userIds: authorization.userIds}),
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `${authorization.token}`,
        }
    });

    const responseChecked = checkStatus(response);

    const jsonResponse = await responseChecked.json();
    
    return jsonResponse.users;
}

export async function deleteUser(authorization) {

    const response = await fetch(`${baseUserSourceUrl}/delete/user`, {
        method: 'post',
        body: JSON.stringify({id: authorization.id}),
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `${authorization.token}`,
        }
    });

    const responseChecked = checkStatus(response);
    const confirmationStatus = responseChecked? { userDeleted: true } : { userDeleted: false };

    return confirmationStatus;
}



const checkStatus = res => {
	if (res.ok) {
		// res.status >= 200 && res.status < 300
		return res;
    } if (res.status === 400 ) {
        const error = new Error('Email or Username already taken');
        error.code = res.status;
		throw error;
    } else {
        const error = new Error(res.statusText);
        error.code = res.status;
        
		throw error;
    }
}