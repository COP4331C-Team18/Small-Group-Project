const urlBase = '/LAMPAPI';
const extension = 'php';

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

function addColor()
{
	let newColor = document.getElementById("colorText").value;
	document.getElementById("colorAddResult").innerHTML = "";

	let tmp = { color: newColor, userId: userId };
	let jsonPayload = JSON.stringify( tmp );

	let url = urlBase + '/AddColor.' + extension;
	
	let xhr = new XMLHttpRequest();
	xhr.open("POST", url, true);
	xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");
	try
	{
		xhr.onreadystatechange = function() 
		{
			if (this.readyState == 4 && this.status == 200) 
			{
				document.getElementById("colorAddResult").innerHTML = "Color has been added";
			}
		};
		xhr.send(jsonPayload);
	}
	catch(err)
	{
		document.getElementById("colorAddResult").innerHTML = err.message;
	}
	
}

function searchColor()
{
	let srch = document.getElementById("searchText").value;
	document.getElementById("colorSearchResult").innerHTML = "";
	
	let colorList = "";

	let tmp = {search:srch,userId:userId};
	let jsonPayload = JSON.stringify( tmp );

	let url = urlBase + '/SearchColors.' + extension;
	
	let xhr = new XMLHttpRequest();
	xhr.open("POST", url, true);
	xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");
	try
	{
		xhr.onreadystatechange = function() 
		{
			if (this.readyState == 4 && this.status == 200) 
			{
				document.getElementById("colorSearchResult").innerHTML = "Color(s) has been retrieved";
				let jsonObject = JSON.parse( xhr.responseText );
				
				for( let i=0; i<jsonObject.results.length; i++ )
				{
					colorList += jsonObject.results[i];
					if( i < jsonObject.results.length - 1 )
					{
						colorList += "<br />\r\n";
					}
				}
				
				document.getElementsByTagName("p")[0].innerHTML = colorList;
			}
		};
		xhr.send(jsonPayload);
	}
	catch(err)
	{
		document.getElementById("colorSearchResult").innerHTML = err.message;
	}
	
}

// UI helpers (safe to load on every page)
window.App = window.App || {};

window.App.createContactCard = function createContactCard(contact)
{
	const card = document.createElement("div");
	card.className = "contact-card";
	card.setAttribute("data-name", contact.name);
	card.setAttribute("data-role", contact.roleText || "");

	const glow = document.createElement("div");
	glow.className = "card-glow";
	card.appendChild(glow);

	const delBtn = document.createElement("button");
	delBtn.type = "button";
	delBtn.className = "delete-contact";
	delBtn.setAttribute("aria-label", "Delete contact");
	delBtn.title = "Delete contact";
	card.appendChild(delBtn);

	const avatarContainer = document.createElement("div");
	avatarContainer.className = "avatar-container";

	const avatarRing = document.createElement("div");
	avatarRing.className = "avatar-ring";
	avatarContainer.appendChild(avatarRing);

	const avatar = document.createElement("div");
	avatar.className = "avatar";
	avatar.setAttribute("style", "background: linear-gradient(135deg, #60a5fa20, #1b2735)");
	avatar.textContent = (contact.name || "")
		.trim()
		.split(/\s+/)
		.filter(Boolean)
		.map(word => word[0].toUpperCase())
		.join("");
	avatarContainer.appendChild(avatar);

	card.appendChild(avatarContainer);

	const nameEl = document.createElement("h3");
	nameEl.className = "contact-name";
	nameEl.textContent = contact.name;
	card.appendChild(nameEl);

	const roleEl = document.createElement("p");
	roleEl.className = "contact-role";
	roleEl.textContent = contact.roleText;
	card.appendChild(roleEl);

	const details = document.createElement("div");
	details.className = "contact-details";

	const phoneItem = document.createElement("div");
	phoneItem.className = "detail-item";
	phoneItem.innerHTML = `<span class="detail-icon">☎</span><span>${contact.phone}</span>`;
	details.appendChild(phoneItem);

	const emailItem = document.createElement("div");
	emailItem.className = "detail-item";
	emailItem.innerHTML = `<span class="detail-icon">✉</span><span>${contact.email}</span>`;
	details.appendChild(emailItem);

	card.appendChild(details);

	const actions = document.createElement("div");
	actions.className = "card-actions";
	actions.innerHTML =
	'<button class="btn-action btn-primary">Message</button>' +
	'<button class="btn-action btn-secondary">Profile</button>';
	card.appendChild(actions);

	return card;
}

window.App.renderContactCards = function renderContactCards(contactsGrid, contacts)
{
	if (!contactsGrid) return [];
	contactsGrid.textContent = "";
	(contacts || []).forEach((contact) => {
		contactsGrid.appendChild(window.App.createContactCard(contact));
	});
	return contactsGrid.querySelectorAll(".contact-card");
}

// Backward compatibility for pages that call createContactCard directly
if (typeof window.createContactCard !== "function")
{
	window.createContactCard = window.App.createContactCard;
}