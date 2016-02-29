var roco = {};
roco.FaceRecognition = function (http, key) {
    var usehttp = false;

    this.createPerson = function (name,callback,error) {
        var data = {
            name: name,
        }
        makeApiCall('persongroups/1/persons','POST',JSON.stringify(data), callback, error);
    }
        
        
    this.addFace = function (personId,url,callback,error) {
        if (!personId) {
            error({message:'SELECT A PERSON'});
            return;
        }
        var data = {
            url:url
        }
        makeApiCall('persongroups/1/persons/'+personId+'/persistedFaces/?userData=url,'+url,'POST',
            JSON.stringify(data),callback, error);
    }
        
    this.getFace = function (personId,faceId,callback,error) {
        makeApiCall('persongroups/1/persons/'+personId+'/persistedFaces/'+faceId,'GET','',callback,error);
    }
    
    
    this.addFaceToList = function (url,callback,error) {
        var data = {
            url:url
        }
        makeApiCall('facelists/1/persistedFaces/','POST',JSON.stringify(data),callback,error);
    }
    
    this.checkFace = function (faceIds,callback,error) {
        if (!faceIds || !faceIds.length) {
            error({message:'SELECT A FACE'});
            return;
        }
        var data = {
            personGroupId:1,
            faceIds: faceIds,
            "maxNumOfCandidatesReturned":1 
        }
        makeApiCall('identify','POST',JSON.stringify(data),callback,error)
    }
    
    this.deletePerson = function (personId,callback,error) {
        makeApiCall('persongroups/1/persons/'+personId,'DELETE','',callback,error);
    }
    
    this.deletePersonFace = function (personId,faceId,callback,error) {
        makeApiCall('persongroups/1/persons/'+personId + '/persistedFaces/'+faceId,'DELETE','',callback,error);
    }
    
    this.recognize = function (url,callback,error) {
        if (!url) {
            error({message:'URL IS REQUIRED'})
            return;
        }
        var data = {
            url:url
        }
        var _this = this;
        makeApiCall('detect?returnFaceId=true&returnFaceLandmarks=false','POST',JSON.stringify(data),function (res) {
            _this.checkFace([res[0].faceId],callback,error);
        },error);
    }
    
    this.getPersons = function (callback,error) {
        makeApiCall('persongroups/1/persons','GET','',callback,error);
    }
    
    this.getFaces = function (callback,error) {
        makeApiCall('facelists/1','GET','',callback,error);
    }
    
    this.trainGroup = function (callback,error) {
        makeApiCall('persongroups/1/train','POST','',callback,error);
    }
    
    function makeApiCall(api,method,data,callback,errorcallback) {
        if (!api) api = '';
        var callParams = {
            url: 'https://api.projectoxford.ai/face/v1.0/'+api,
            method: method || 'GET',
            responseType: "json",
            headers: {
                "Ocp-Apim-Subscription-Key":key
            },
            contentType: "application/json",
            data: data

        }
        if (usehttp) {                 
            http(callParams)
            .then(function successCallback(response) {
               if (callback) callback(response.data);
            }, function errorCallback(error) {
                console.log(error);
                this.error = error.data.error;
                if (errorcallback) errorcallback(error.data);
            });
        } else {
            $.ajax(callParams)
            .done(function successCallback(response) {
                if (callback) callback(response);
            }).fail(function errorCallback(error) {
                console.log(error);
                if (errorcallback) errorcallback(error);
            });
        }
    }
}