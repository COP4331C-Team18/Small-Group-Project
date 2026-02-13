// Base URL for API endpoints.
// Use the site root so production works without requiring a /Small-Group-Project prefix.
const urlBase = window.location.origin + "/LAMPAPI";
const extension = "php";

let userId = 0;
let firstName = "";
let lastName = "";

function doLogin()
{
	userId = 0;
	firstName = "";
	lastName = "";
	
	let login = document.getElementById("loginName").value;
	let password = document.getElementById("loginPassword").value;
//	var hash = md5( password );
	
	document.getElementById("loginResult").innerHTML = "";

	let tmp = {login:login,password:password};
//	var tmp = {login:login,password:hash};
	let jsonPayload = JSON.stringify( tmp );
	
	let url = urlBase + '/Login.' + extension;

	let xhr = new XMLHttpRequest();
	xhr.open("POST", url, true);
	xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");
	try
	{
		xhr.onreadystatechange = function() 
		{
			if (this.readyState == 4 && this.status == 200) 
			{
				let jsonObject = JSON.parse( xhr.responseText );
				userId = jsonObject.id;
		
				if( userId < 1 )
				{		
					document.getElementById("loginResult").innerHTML = "User/Password combination incorrect";
					return;
				}
		
				firstName = jsonObject.firstName;
				lastName = jsonObject.lastName;

				saveCookie();
	
				window.location.href = "dashboard/";
			}
		};
		xhr.send(jsonPayload);
	}
	catch(err)
	{
		document.getElementById("loginResult").innerHTML = err.message;
	}

}

function saveCookie()
{
	let minutes = 20;
	let date = new Date();
	date.setTime(date.getTime()+(minutes*60*1000));	
	document.cookie =
		"firstName=" + firstName +
		",lastName=" + lastName +
		",userId=" + userId +
		";expires=" + date.toGMTString() +
		";path=/";
}

function readCookie()
{
	userId = -1;
	let data = document.cookie;
	let splits = data.split(",");
	for(var i = 0; i < splits.length; i++) 
	{
		let thisOne = splits[i].trim();
		let tokens = thisOne.split("=");
		if( tokens[0] == "firstName" )
		{
			firstName = tokens[1];
		}
		else if( tokens[0] == "lastName" )
		{
			lastName = tokens[1];
		}
		else if( tokens[0] == "userId" )
		{
			userId = parseInt( tokens[1].trim() );
		}
	}
}

function getUserName()
{
	if (firstName && lastName)
		return firstName + " " + lastName;
	else
		return "Commander";
}

function doLogout()
{
    userId = 0;
    firstName = "";
    lastName = "";

    // Delete ALL cookies with the SAME path
    document.cookie = "firstName=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/";
    document.cookie = "lastName=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/";
    document.cookie = "userId=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/";

    window.location.replace("/login.html");
}

function doRegister()
{
    let firstName = document.getElementById("firstName").value.trim();
    let lastName  = document.getElementById("lastName").value.trim();
    let username  = document.getElementById("username").value.trim();
    let password  = document.getElementById("password").value;
    let confirm   = document.getElementById("confirmPassword").value;
    let email     = document.getElementById("email").value.trim();

    let result = document.getElementById("registerResult");
    result.innerHTML = "";

    if (!firstName || !lastName || !username || !email)
    {
        result.innerHTML = "All fields are required.";
        return;
    }

    if (password.length < 6)
    {
        result.innerHTML = "Password must be at least 6 characters.";
        return;
    }

    if (password !== confirm)
    {
        result.innerHTML = "Passwords do not match.";
        return;
    }

    let tmp = {
        Firstname: firstName,
        Lastname: lastName,
        Username: username,
        Password: password,
        Email: email,
    };

    let jsonPayload = JSON.stringify(tmp);
    let url = urlBase + '/Register.' + extension;

    let xhr = new XMLHttpRequest();
    xhr.open("POST", url, true);
    console.log(url, jsonPayload); // Debug log
    xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");

    console.log("Registering user:", tmp); // Debug log

    try
    {
        xhr.onreadystatechange = function ()
        {
            if (this.readyState === 4)
            {
              if (xhr.status !== 200)
              {
                console.log("Register failed:", xhr.status, xhr.responseText);
                result.innerHTML = "Register failed (HTTP " + xhr.status + ").";
                return;
              }

              if (!xhr.responseText)
              {
                console.log("Empty response from Register.");
                result.innerHTML = "Server returned an empty response.";
                return;
              }

            let response;
            try
            {
              response = JSON.parse(xhr.responseText);
            }
            catch (parseErr)
            {
              console.log("Non-JSON response from Register:", xhr.status, xhr.responseText);
              result.innerHTML = "Server returned an unexpected response.";
              return;
            }

                if (response.error && response.error.length > 0)
                {
                  console.log(response, response.error); // Debug log
                  result.innerHTML = response.error;
                }
                else
                {
                    result.innerHTML = "Registration successful! Redirecting…";

                    setTimeout(() => {
                        window.location.href = "login.html";
                    }, 1500);
                }
            }
        };
        xhr.send(jsonPayload);
    }
    catch (err)
    {
        result.innerHTML = err.message;
    }
}

// Contacts API helpers (safe to load on every page)

// Fetch contacts for a user from the backend.
// Returns objects shaped for createContactCard: { id, name, phone, email, roleText }
function getContacts(userIdToFetch, startIdx = 0, count = 100)
{
  return new Promise((resolve, reject) =>
  {
    if (!(typeof userIdToFetch === "number" && userIdToFetch > 0))
    {
      reject(new Error("Invalid userId"));
      return;
    }

    const tmp = { userId: userIdToFetch, startIdx: startIdx, count: count };
    const jsonPayload = JSON.stringify(tmp);
    const url = urlBase + "/GetContacts." + extension;

    const xhr = new XMLHttpRequest();
    xhr.open("POST", url, true);
    xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");
    xhr.onreadystatechange = function ()
    {
      if (xhr.readyState !== 4) return;
      if (xhr.status !== 200)
      {
        reject(new Error("GetContacts failed (HTTP " + xhr.status + ")"));
        return;
      }

      let jsonObject;
      try
      {
        jsonObject = JSON.parse(xhr.responseText);
      }
      catch (e)
      {
        reject(new Error("GetContacts returned invalid JSON"));
        return;
      }

      if (jsonObject.error && jsonObject.error.length > 0)
      {
        reject(new Error(jsonObject.error));
        return;
      }

      const results = Array.isArray(jsonObject.results) ? jsonObject.results : [];
      const contacts = results.map((row) =>
      {
        const id = Number(row.ID ?? row.id ?? 0) || 0;
        const first = row.Firstname ?? row.firstname ?? "";
        const last = row.Lastname ?? row.lastname ?? "";
        return {
          id: id,
          name: String((first + " " + last).trim()),
          roleText: String(row.Nickname ?? row.nickname ?? ""),
          phone: String(row.Phone ?? row.phone ?? ""),
          email: String(row.Email ?? row.email ?? ""),
        };
      });

      resolve(contacts);
    };

    xhr.send(jsonPayload);
  });
}

// Create a contact in the backend. Returns the JSON response (including inserted id).
function addContact(params = {})
{
  return new Promise((resolve, reject) =>
  {
    const userIdToUse = Number(params.userId ?? userId) || 0;
    const fullName = String(params.name ?? "").trim();
    const nicknameToUse = String(params.nickname ?? "");
    const phoneToUse = String(params.phone ?? "");
    const emailToUse = String(params.email ?? "");

    if (!(userIdToUse > 0))
    {
      reject(new Error("Invalid userId"));
      return;
    }

    if (!fullName)
    {
      reject(new Error("Name is required"));
      return;
    }

    const nameParts = fullName.split(/\s+/).filter(Boolean);
    const first = nameParts.length > 0 ? nameParts[0] : "";
    const last = nameParts.length > 1 ? nameParts.slice(1).join(" ") : "";

    const tmp = {
      Firstname: first,
      Lastname: last,
      Nickname: nicknameToUse,
      Email: emailToUse,
      Phone: phoneToUse,
      UserID: userIdToUse,
    };

    const jsonPayload = JSON.stringify(tmp);
    const url = urlBase + "/AddContact." + extension;

    const xhr = new XMLHttpRequest();
    xhr.open("POST", url, true);
    xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");
    xhr.onreadystatechange = function ()
    {
      if (xhr.readyState !== 4) return;
      if (xhr.status !== 200)
      {
        reject(new Error("AddContact failed (HTTP " + xhr.status + ")"));
        return;
      }

      let jsonObject;
      try
      {
        jsonObject = JSON.parse(xhr.responseText);
      }
      catch (e)
      {
        reject(new Error("AddContact returned invalid JSON"));
        return;
      }

      if (jsonObject.error && jsonObject.error.length > 0)
      {
        reject(new Error(jsonObject.error));
        return;
      }

      resolve(jsonObject);
    };

    xhr.send(jsonPayload);
  });
}

// Edit an existing contact (requires contactId).
function editContact(params = {})
{
  return new Promise((resolve, reject) =>
  {
    const userIdToUse = Number(params.userId ?? userId) || 0;
    const contactId = Number(params.contactId) || 0;
    const fullName = String(params.name ?? "").trim();
    const nicknameToUse = String(params.nickname ?? "");
    const phoneToUse = String(params.phone ?? "");
    const emailToUse = String(params.email ?? "");

    if (!(userIdToUse > 0))
    {
      reject(new Error("Invalid userId"));
      return;
    }

    if (!(contactId > 0))
    {
      reject(new Error("Invalid contactId"));
      return;
    }

    if (!fullName)
    {
      reject(new Error("Name is required"));
      return;
    }

    const nameParts = fullName.split(/\s+/).filter(Boolean);
    const first = nameParts.length > 0 ? nameParts[0] : "";
    const last = nameParts.length > 1 ? nameParts.slice(1).join(" ") : "";

    const tmp = {
      userId: userIdToUse,
      contactId: contactId,
      firstname: first,
      lastname: last,
      nickname: nicknameToUse,
      phone: phoneToUse,
      email: emailToUse,
    };

    const jsonPayload = JSON.stringify(tmp);
    const url = urlBase + "/EditContact." + extension;

    const xhr = new XMLHttpRequest();
    xhr.open("POST", url, true);
    xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");
    xhr.onreadystatechange = function ()
    {
      if (xhr.readyState !== 4) return;
      if (xhr.status !== 200)
      {
        reject(new Error("EditContact failed (HTTP " + xhr.status + ")"));
        return;
      }

      let jsonObject;
      try
      {
        jsonObject = JSON.parse(xhr.responseText);
      }
      catch (e)
      {
        reject(new Error("EditContact returned invalid JSON"));
        return;
      }

      if (jsonObject.error && jsonObject.error.length > 0)
      {
        reject(new Error(jsonObject.error));
        return;
      }

      resolve(jsonObject);
    };

    xhr.send(jsonPayload);
  });
}

// Delete a contact by id for the logged-in user.
function deleteContact(params = {})
{
  return new Promise((resolve, reject) =>
  {
    const userIdToUse = Number(params.userId ?? userId) || 0;
    const contactId = Number(params.contactId ?? params.id) || 0;

    if (!(userIdToUse > 0))
    {
      reject(new Error("Invalid userId"));
      return;
    }

    if (!(contactId > 0))
    {
      reject(new Error("Invalid contactId"));
      return;
    }

    const tmp = { userId: userIdToUse, id: contactId };
    const jsonPayload = JSON.stringify(tmp);
    const url = urlBase + "/DeleteContact." + extension;

    const xhr = new XMLHttpRequest();
    xhr.open("POST", url, true);
    xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");
    xhr.onreadystatechange = function ()
    {
      if (xhr.readyState !== 4) return;
      if (xhr.status !== 200)
      {
        reject(new Error("DeleteContact failed (HTTP " + xhr.status + ")"));
        return;
      }

      let jsonObject;
      try
      {
        jsonObject = JSON.parse(xhr.responseText);
      }
      catch (e)
      {
        reject(new Error("DeleteContact returned invalid JSON"));
        return;
      }

      if (jsonObject.error && jsonObject.error.length > 0)
      {
        reject(new Error(jsonObject.error));
        return;
      }

      resolve(jsonObject);
    };

    xhr.send(jsonPayload);
  });
}