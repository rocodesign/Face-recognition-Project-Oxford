

angular.module('faceAPI', [])
    .controller('FaceController', function($scope, $http) {
        var fc = this;
        var usehttp = false;
        var API_KEYS = {
            'PROJECT_OXFORD':{
                primary:'f957d4e5b4e64684bd57ee15b36d394e',
                secondary: 'c1a80b2c359a49338619f8f71afacd5e'
            }
        }
        
        $.getScript( "js/facerec.js", function( data, textStatus, jqxhr ) {
            console.log( data ); // Data returned
            console.log( textStatus ); // Success
            console.log( jqxhr.status ); // 200
            console.log( "Load was performed." );
            fc.fr = new roco.FaceRecognition(null,'f957d4e5b4e64684bd57ee15b36d394e');
        });
        
        
        
        
        fc.createPerson = function () {
            console.log('creating person');
            var data = {
                name: fc.name,
            }
            makeApiCall('persongroups/1/persons','POST',JSON.stringify(data), fc.getPersons);
        }
        
        
        fc.addFace = function () {
            console.log('adding face');
            if (!fc.person) {
                fc.error = 'SELECT A PERSON';
                return;
            }
            var data = {
                url:fc.faceUrl
            }
            makeApiCall('persongroups/1/persons/'+fc.person.personId+'/persistedFaces/?userData=url,'+fc.faceUrl,'POST',JSON.stringify(data))
        }
        
        fc.getFace = function (personId,faceId) {
            console.log('fc',fc);
            fc.url = null;
            fc.fr.getFace(personId,faceId,function (res) {
                console.log('got face', res);
                if (res.userData) {
                    fc.url = res.userData.split(",")[1];
                    $scope.$apply();
                }
            })
        }
        
        
        fc.addFaceList = function () {
            console.log('adding face');
            if (!fc.person) {
                fc.error = 'SELECT A PERSON';
                return;
            }
            var data = {
                url:fc.faceUrl,
                userData: "11111"
            }
            makeApiCall('facelists/1/persistedFaces/','POST',JSON.stringify(data))
        }
        
        fc.checkFace = function (faceId) {
            console.log('checking face');
            if (!fc.face && !faceId) {
                fc.error = 'SELECT A FACE';
                return;
            }
            var data = {
                personGroupId:"1",
                faceIds: [faceId || fc.face.persistedFaceId || fc.face],
                "maxNumOfCandidatesReturned":1 
            }
            makeApiCall('identify','POST',JSON.stringify(data),function (res) {
                console.log('face checked',res);
                fc.foundperson = res[0].candidates[0].personId;
            })
        }
        
        fc.deletePerson = function (person) {
            makeApiCall('persongroups/1/persons/'+person.personId,'DELETE','',function (res) {
                fc.persons.splice(fc.persons.indexOf(person),1);                
            })
        }
        
        fc.deletePersonFace = function (person,faceId) {
            makeApiCall('persongroups/1/persons/'+person.personId + '/persistedFaces/'+faceId,'DELETE','',function (res) {
                person.persistedFaceIds.splice(person.persistedFaceIds.indexOf(faceId),1); 
            })
        }
        
         fc.detectAndCheck = function () {
             fc.foundperson = null;
            console.log('detecting face');
            if (!fc.faceUrl) {
                fc.error = 'ADD A FACE URL';
                return;
            }
            var data = {
                url:fc.faceUrl,
                userData: "1234"
            }
            makeApiCall('detect?returnFaceId=true&returnFaceLandmarks=false','POST',JSON.stringify(data),function (res) {
                console.log('detected',res);
                fc.checkFace(res[0].faceId);
            });
        }
        
        fc.getPersons = function () {
            makeApiCall('persongroups/1/persons','GET','',function (res) {
                fc.persons = res;
            });
        }
        
        fc.getFaces = function () {
            makeApiCall('facelists/1','GET','',function (res) {
                fc.listfaces = res.persistedFaces;
            });
        }
        
        fc.trainGroup = function () {
            makeApiCall('persongroups/1/train','POST','',function (res) {
                
            });
        }
        
        function makeApiCall(api,method,data,callback) {
            if (!api) api = '';
            fc.error = '';
            var callParams = {
                url: 'https://api.projectoxford.ai/face/v1.0/'+api,
                method: method || 'GET',
                responseType: "json",
                headers: {
                    "Ocp-Apim-Subscription-Key":"f957d4e5b4e64684bd57ee15b36d394e"
                },
                contentType: "application/json",
                data: data

            }
            $('#request').text(JSON.stringify(callParams,null,2));
            if (usehttp) {                 
                $http(callParams)
                .then(function successCallback(response) {
                    $('#response').append(JSON.stringify(response.data,null,2));
                        if (callback) callback(response.data);
                }, function errorCallback(error) {
                    console.log(error);
                    fc.error = error.data.error;
                });
            
            } else {
                $.ajax(callParams)
                .done(function successCallback(response) {
                    $('#response').text(JSON.stringify(response,null,2));
                        if (callback) callback(response);
                    $scope.$apply();
                }).fail(function errorCallback(error) {
                    console.log(error);
                    fc.error = error.responseJSON.code + " " + error.responseJSON.message;
                    $scope.$apply();
                });
            }
        }
        
        makeApiCall('persongroups/1/');
        fc.getPersons();
        //fc.getFaces();
    });
    
    

