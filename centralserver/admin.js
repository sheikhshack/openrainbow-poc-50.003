const AdminBro = require('admin-bro');
const AdminBroExpress = require('admin-bro-expressjs');
const AdminBroMongoose = require('admin-bro-mongoose');


// Importing a bunch of mongoose models to make things SEXY and Fast
const User = require('./mongoosemigrations/models/userschema.js');
const Agent = require('./mongoosemigrations/models/agentschema.js');
const LogSessions = require('./mongoosemigrations/models/loggingschema.js');
const Departments = require('./mongoosemigrations/models/departmentschema.js');

// Customisations
const options = {

}


// Adding custom icons to the table of contents
const parentOfLogging = {
    name: 'Past Logging',
    icon: 'Catalog',
};
const parentOfAgents= {
    name: 'Agent',
    icon: 'User',
};

const parentOfDepartment= {
    name: 'Department Management',
    icon: 'Building',
};

AdminBro.registerAdapter(AdminBroMongoose);
const adminBro = new AdminBro({
    rootPath: '/admin',
    resources: [

        {resource: Agent, options: {parent: parentOfAgents}},
        {resource: Departments, options: {parent: parentOfDepartment}},
        {resource: LogSessions, options: {parent: parentOfLogging}}
    ],
    branding: {
        companyName: "Swaggy Inc. ",
        softwareBrothers: false,

    },
    locale:{
        translations: {
            labels:{
                loginWelcome: "Welcome to Backend"
            },
            messages:{
                loginWelcome: "Damn cancerous. Alcatel should pay us for this shit"
            }}

    },
    dashboard:{
        component: AdminBro.bundle('./admin/mainPage')
    },
    pages:{
        accountGeneration:{
            label: "Account Generation",
            name: "Account Generation",
            handler: async (request, response, context) => {
                return {
                    text: "I am fetched from the backend"
                }
            },
            component: AdminBro.bundle('./admin/testingComponents/registrationpage')
        }
    }



});

// TODO: Login credentials security
const ADMIN = {
    email: "admin@swaggy.com",
    password: "@Swaggy97"
};

const router = AdminBroExpress.buildAuthenticatedRouter(adminBro, {
    cookieName: 'admin-user',
    cookiePassword: 'admin-password',
    authenticate: async (email, password) => {
        if (email === ADMIN.email && password === ADMIN.password)
        {
            return ADMIN;
        }
        return null;
    }
});

module.exports = router;
