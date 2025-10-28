var endpoint = 'https://staging.khaleejauction.com/newdesign/api/';
function sendRequest(api, body, callBack, handleError) {
    $.ajax({
        url:  endpoint + api + ".php",
        type: "POST",
        dataType: "json",
        data: JSON.stringify(body),
        contentType: "application/json",
        success: callBack,
        error: handleError
    });
}
var data = {
    /*
    *   if      !value && item not set -> item not set yet                  returns undefined
    *   if else !value                 -> item is already set               returns Item value
    *   else     value && item not set -> item not set yet set Item value,  returns Item value after setting
    */
    tojson: (value) => {
        return value ? JSON.parse(value) : undefined;
    },
    handleValue: (key, storage, value) => {
        if(!value && !storage.getItem(key))
            return undefined;
        
        if(!value && storage.getItem(key))  
            return storage.getItem(key);
                    
        if(value && !storage.getItem(key)) { 
            storage.setItem(key, value);
            return data.handleValue(key, storage);//gets value
        }
        return undefined;
  },
  devicID:    (value) => {    
    var result = data.handleValue('devicID', localStorage, value);    
    if(result)
        return result;

    // value not set yet, get the calculated value        
    var agent = window.navigator.userAgent;
    switch( agent ){
        case agent.match(/iPad/i) || agent.match(/iPhone/i):
            return "iphone"+(Math.random()*1e32).toString(36);
        case navigator.platform.toUpperCase().indexOf('MAC')>=0:
            return "mac"+(Math.random()*1e32).toString(36);
        default:    
            return "device"+(Math.random()*1e32).toString(36);
        }
    },
    secretKey:  (value) => {
        return data.handleValue('secretKey', localStorage, value);
    },
    token:      (value) => {
        return data.handleValue('token', localStorage, value);
    },
    userid:     (value) => {
        return data.handleValue('userid', localStorage, value);
    },
    jwtToken:   (value) => {
        return data.handleValue('jwtToken', localStorage, value);
    },
    language:   () => {
    //add it to localstorage?????????
        return "EN";// or "AR"
    },
    social:     (value) => {
        if(value)
            value   = JSON.stringify(value);
        var result  = data.handleValue('social', sessionStorage, value);
        return data.tojson(result);
    }
}
var API = {
    secretKey: () => {
        sendRequest('get_initial', {
            action: "getkey"
        }, RESPONSE.secretKey);
    },
    login: (username, password) => {
        if(!data.secretKey()){
            API.secretKey()
            setTimeout(API.login, 5000); //edit
            return;
        }
        var secretKey = data.secretKey();
        username      = CryptoJS.AES.encrypt(JSON.stringify(username),     secretKey, {format: CryptoJSAesJson}).toString(),
        password      = CryptoJS.AES.encrypt(JSON.stringify(password),     secretKey, {format: CryptoJSAesJson}).toString(),
        deviceID      = CryptoJS.AES.encrypt(JSON.stringify(data.devicID), secretKey, {format: CryptoJSAesJson}).toString(),
        data.devicID(deviceID);
        sendRequest('user_login',  {
            "username" : username,
            "password" : password, 
            "deviceID": deviceID
        }, RESPONSE.login );
    },
    logout: () => {
        sendRequest('logout', {
            "token": data.token(),
            "deviceID": data.devicID(),
            "userId": user.aesId(),
            "language": data.language()
        }, RESPONSE.logout );
    },
    social: () => {
        sendRequest('common_function',  {
            action: "socialmedia",
            language: data.language()
        }, RESPONSE.social );
    }
}
var RESPONSE = {
    success: (json) => {
        return json && json.status && json.status === 'success';
    },
    secretKey: (json) => {
        if(RESPONSE.success(json))
            data.secretKey(json.unifi_key);
    },
    login: (json) => {
        Element.enable('submit-login');
        if(!RESPONSE.success(json)){
            Error.span($('form'), json.status);
            return;
        }
        //set user and redirect
        data.userid(json.userid);
        data.token(json.token);
        data.jwtToken(json.token);
        page.redirect2home();   
    },
    logout: (json) => {
        if(!RESPONSE.success(json))
            return;
        localStorage.clear();
        page.redirect2home();
    },
    social: (json) => {
        if(!RESPONSE.success(json))
            return;
        data.social(json.results);//set value in sessionStorage
        load.social(json.results);
    }
}
var load = {
    social: (jsonArr) => {
        for (var i in jsonArr) {
            var result = jsonArr[i];
            console.log(result);
        }
    }
}
var page = {
    isLogin: () => {
        return window.location.pathname === "/login.html";
    },
    redirect2home: () => {
        window.location.replace("/index.html");
    },
    header : () => {
        if(page.isLogin()) {
            Element.hide('login-menu');
            Element.hide('logout-menu');
            Element.hide('profile-menu');
            return;
        }
        if(user.isLogged()){
            Element.addevent('click', 'logout-menu', API.logout);
            Element.hide('login-menu');
            Element.show('logout-menu');
            Element.show('profile-menu');
        }
        else {
            Element.show('login-menu');
            Element.hide('logout-menu');
            Element.hide('profile-menu');
        }
    },
    footer: () => {
        init.social();
    }
}
var init = {
    social: () => {
        var result = data.social();
        if(result)
            load.social(result);
        else
            API.social();
    }
}
var Error = {
    print: (error) => {
        console.log( error );
    },
    span: (node, msg) => {
        node.appened(
            $("<span>", {
                id: "span-err",
                class: 'err-msg',
                text: msg
            })
        );
    }
}
var Element = {
    exist: (id) => {
        return document.getElementById(id) ? true : false;
    },
    getById: (id) => {
        return document.getElementById(id);
    },
    getByClass: (classname) =>{
        return document.body.getElementsByClassName(classname);
    },
    disable: (id) => {
        if(!Element.getById(id))
            return;
        Element.getById(id).setAttribute('disabled', true);
        Element.getById(id).classList.add('disabled');
    },
    enable: (id) => {
        if(!Element.getById(id))
            return;
        Element.getById(id).removeAttribute('disabled');
        Element.getById(id).classList.remove('disabled');
    },
    hide: (id) => {
        if(!Element.getById(id))
            return;
        if(Element.getById(id).style.display && Element.getById(id).style.display !== 'none')
            Element.getById(id).setAttribute('displayAtt', Element.getById(id).style.display);
        Element.getById(id).style.display = 'none';
    },
    show: (id) => {
        if(!Element.getById(id))
            return;
        if(Element.getById(id).hasAttribute('displayAtt')) {
            Element.getById(id).style.display = Element.getById(id).getAttribute('displayAtt');
            Element.getById(id).removeAttribute('displayAtt');
        }
        else
            if(Element.getById(id).style.display && Element.getById(id).style.display === 'none')
                Element.getById(id).style.removeProperty('display');
    },
    addevent: (event, id, call) => {
        if(!Element.getById(id))
            return;
        Element.getById(id).addEventListener(event, call);
    }
}
var user = {
    id: () => {
        var userId = data.userid();
        return userId ? userId : '-1';
    },
    aesId: () => {
        return user.isLogged() ? CryptoJS.AES.encrypt(JSON.stringify(user.id()), data.secretKey(), {format: CryptoJSAesJson}).toString() : '-1';
    },
    isLogged: () => {
        return user.id() === '-1' ? false : true;
    },
}
page.header();
page.footer();