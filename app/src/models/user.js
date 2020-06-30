import fetch from 'node-fetch';

const baseUserSourceUrl = `http://localhost:500/api`;


export async function createUser(username, email, firstname, lastname, password, roles) {

    const userInputs = {
        "username": username,
        "email": email,
        "firstname": firstname,
        "lastname": lastname,
        "roles": roles,
        "password": password
    }
    
    const response = await fetch(`${baseUserSourceUrl}/auth/signup`, {
        method: 'post',
        body: JSON.stringify(userInputs.username),
        headers: {'Content-Type': 'application/json'}
    });

    const responseChecked = checkStatus(response);
    const confirmationStatus = responseChecked? { userCreated: true } : { userCreated: false };

    return confirmationStatus;
}

export async function signIn(username, password) {

    const userInputs = {
        "username": username,
        "password": password
    }

    const response = await fetch(`${baseUserSourceUrl}/auth/signin`, {
        method: 'post',
        body: JSON.stringify(userInputs.username),
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

export async function getUserById(authorization) {

    console.log("this is the id: ", authorization.id);
    console.log("this is the token: ", authorization.token);

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

    console.log("this is the token: ", authorization.token);

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