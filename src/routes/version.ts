import getRoutes from './index';

const checkVersion = async () => {
    let routesVersions: any = {};
    let routesObjects = await getRoutes();
    routesObjects.forEach((route) => {
        let prefix = route.path.match(/.*(?=\/v(\d\.?)+)/g);
        prefix = prefix ? prefix[0] : "";
        let routePath = route.path.match(/(?<=(v.*\/)).*$/g);
        routePath = routePath ? "/"+routePath[0] : "";
        let version = route.path.match(/(?<=v)(\d\.?)+/g);
        version = version ? version[0] : "";
        let routeMethod = route.method;
        if (routePath !== "" && version !== "") {
            let isFound = false;
            Object.keys(routesVersions).forEach((key) => {
                routesVersions[key].forEach((value)=>{
                    if (value.path === prefix + routePath && !value.version.includes(version) && value.method === routeMethod) {
                        value.version.push(version);
                        value.version.sort();
                        isFound = true;
                    }
                });
            });
            if (!isFound) {
                if(prefix in routesVersions){
                    routesVersions[prefix].push({
                        prefix,
                        method: routeMethod,
                        path: prefix + routePath,
                        version: [version]
                    });
                } else {
                    routesVersions[prefix] = [{
                        prefix,
                        method: routeMethod,
                        path: prefix + routePath,
                        version: [version]
                    }];
                }

            }
        }
    });
    return routesVersions;
};

export default [
    {
        method: 'GET',
        path: '/version',
        options: {
            handler: async (request, h) => {
                try {

                    let versions = await checkVersion();
                    let template = `
<!DOCTYPE html>
<html>

<head>
    <meta charset="UTF-8">
    <title>Crewhitz User API Documentation</title>
    <link rel="icon" type="image/png" href="/swaggerui/images/favicon-32x32.png" sizes="32x32" />
    <link rel="icon" type="image/png" href="/swaggerui/images/favicon-16x16.png" sizes="16x16" />
    <link href='/swaggerui/css/typography.css' media='screen' rel='stylesheet' type='text/css' />
    <link href='/swaggerui/css/reset.css' media='screen' rel='stylesheet' type='text/css' />
    <link href='/swaggerui/css/screen.css' media='screen' rel='stylesheet' type='text/css' />
    <link href='/swaggerui/css/reset.css' media='print' rel='stylesheet' type='text/css' />
    <link href='/swaggerui/css/print.css' media='print' rel='stylesheet' type='text/css' />
</head>

<body class="swagger-section">
    <div id='header'>
        <div class="swagger-ui-wrap">
            <a id="logo" href="http://swagger.io">swagger</a>
            <form id='api_selector' onsubmit="return false">
                <div class='input'><input placeholder="api_key" id="input_apiKey" style="display:none" name="apiKey" type="text"/></div>
                <div class='input'><input placeholder="http://example.com/api" id="input_baseUrl" style="display:none" name="baseUrl" type="text"/></div>
                <!--
                <div class='input'><a id="explore" href="#" data-sw-translate>Explore</a></div>
                -->
            </form>
        </div>
    </div>
    <div id="message-bar" class="swagger-ui-wrap" data-sw-translate>&nbsp;</div>
    <div id="swagger-ui-container" class="swagger-ui-wrap">
        <div class="container" id="resources_container">
        ${ Object.keys(versions).map((key)=>{
            return `
            <ul id="resources">
                <li id="resource_admin" class="resource">
                    <div class="heading">
                      <h2>
                        <a href="#!/${key}" class="toggleEndpointList" data-id="${key}">${key}</a> 
                      </h2>
                    </div>
                    <ul class="endpoints" id="${key}_endpoint_list" style="">
                        ${versions[key].map((value)=>{
                            return `
                            <li class="endpoint">  
                                <ul class="operations">
                                    <li class="${value.method.toLowerCase()} operation" id="${key}_getAdminV1Admins">
                                      <div class="heading">
                                        <h3 style="width: 100%"> 
                                          <span class="http_method">
                                          <a href="#" class="toggleOperation">${value.method.toUpperCase()}</a>
                                          </span>
                                          <span class="path">
                                          <a href="#" class="toggleOperation ">${value.path}</a>
                                          </span>
                                          ${value.version.map((versionValue)=>{
                                              return `
                                                <span class="http_method" style="float: right; margin-left: 10px;">
                                                    <a href="#" class="toggleOperation">${versionValue}</a>
                                                </span>
                                              `
                                          }).join("")}
                                        </h3>
                                       
                                      </div>
                                    </li>
                                </ul>
                            </li>
                            `
                        }).join("")}
                        
                    </ul>
                </li>
            </ul>
            `
        }).join("")}
           
        </div>
    </div>
</body>

</html>
                    `;


                    // return h.response(await checkVersion()).code(200);
                    return h.response(template).code(200);
                } catch (e) {
                    console.log(e);
                }

            },
            description: 'API Version',
            notes: 'API Last Version',
            tags: ['api', 'version'],
        },
    },
]
