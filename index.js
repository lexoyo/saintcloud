// see these links for doc
// * implementation of the SDK: https://github.com/google/google-api-nodejs-client/blob/master/src/apis/appengine/v1.ts#L1300
// * credential creation in console: https://console.developers.google.com/apis/credentials
// * 
var google = require('googleapis');                                                                                                                                                                                
const appengine = google.appengine('v1');                                                                                                                                                                          
const cloudresourcemanager = google.cloudresourcemanager('v1');                                                                                                                                                                          
const async = require('async');

var key = require('./alex-project-c8277e73fe39.json');                                                                                                                                                                
var jwtClient = new google.auth.JWT(                                                                                                                                                                               
  key.client_email,                                                                                                                                                                                                
  null,                                                                                                                                                                                                            
  key.private_key,                                                                                                                                                                                                 
  ['https://www.googleapis.com/auth/appengine.admin', 'https://www.googleapis.com/auth/cloud-platform', 'https://www.googleapis.com/auth/cloud-platform.read-only'], // an array of auth scopes                                                                                                                                   
  null                                                                                                                                                                                                             
);                                                                                                                                                                                                                 
        

jwtClient.authorize(function (err, tokens) {
    if (err) {
        console.log(err);
        return;                                                                                                                                                                                                        
    }    

    const getProjects = (cb) => {
        cloudresourcemanager.projects.list({
            auth: jwtClient
        }, null, (err, res) => {
            if(err) {
                cb("Couldn't retrieve projects", null);
            } else {
                cb(null, res.projects);
            }
        });
    };

    const getServices = (projects, cb) => {
        let pendingRequests = 0;
        projects.forEach(project => {
            pendingRequests++;
            appengine.apps.services.list({                                                                                                                                                                                   
                appsId: project.projectId,                                                                                                                                                                                           
                auth: jwtClient                                                                                                                                                                                                
              }, (err, resp) => {   
                pendingRequests--;   
                if(err) {
                    if(err.code != 404) cb(err, null);
                } else {        
                    project.services = resp.services;
                    if(pendingRequests === 0) {
                        cb(null, projects);
                    }
                }
            });
        });
    };

    const getVersions = (projects, cb) => {
        let pendingRequests = 0;
        projects.forEach(project => {
            project.services && project.services.forEach(service => {
                pendingRequests++;
                appengine.apps.services.versions.list({
                    appsId: project.projectId,
                    servicesId: service.id,
                    auth: jwtClient              
                }, (err, resp) => {   
                    pendingRequests--;   
                    if(err) {
                        if(err.code != 404) cb(err, null);
                    } else {        
                        service.versions = resp.versions;
                        if(pendingRequests === 0) {
                            cb(null, projects);
                        }
                    }
                });
            });
        });
    };

    const getInstances = (projects, cb) => {
        let pendingRequests = 0;
        projects.forEach(project => {
            project.services && project.services.forEach(service => {
                service.versions && service.versions.forEach(version => {
                    pendingRequests++;
                    appengine.apps.services.versions.instances.list({
                        appsId: project.projectId,
                        servicesId: service.id,
                        versionsId: version.id,
                        auth: jwtClient              
                    }, (err, resp) => {   
                        pendingRequests--;
                        if(err) {
                            if(err.code != 404) cb(err, null);
                        } else {        
                            version.instances = resp.instances;
                            if(pendingRequests === 0) {
                                cb(null, projects);
                            }
                        }
                    });
                });
            });
        });
    }
  
    async.waterfall([getProjects, getServices, getVersions, getInstances], (err, res) => {
        console.log(JSON.stringify(res, null, 4));
    });
});

